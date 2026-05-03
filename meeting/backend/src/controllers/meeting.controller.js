const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");
const config = require("../config");
const { generateUniqueCode } = require("../utils/meetingCode");
const { logAndMaybeSend } = require("../services/mailer");

function joinUrl(code) {
  return `${config.appOrigin}/room/${code}`;
}

function meetingJson(m) {
  return m.toJSON();
}

async function list(req, res) {
  try {
    const rows = await Meeting.find({ organizer: req.user._id }).sort({ startAt: 1 });
    return res.json({ meetings: rows.map(meetingJson) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to list meetings" });
  }
}

async function conflicts(req, res) {
  try {
    const { startISO, endISO, excludeId } = req.query;
    if (!startISO || !endISO) {
      return res.status(400).json({ error: "startISO and endISO required" });
    }
    const start = new Date(startISO);
    const end = new Date(endISO);
    const filter = {
      organizer: req.user._id,
      status: "scheduled",
      startAt: { $lt: end },
      endAt: { $gt: start },
    };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: excludeId };
    }
    const rows = await Meeting.find(filter);
    return res.json({ conflicts: rows.map(meetingJson) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to check conflicts" });
  }
}

async function create(req, res) {
  try {
    const {
      title,
      startISO,
      endISO,
      durationMinutes,
      invitees,
      reminderMinutesBefore,
      timeZone,
      recurring,
    } = req.body;

    if (!title || !startISO) {
      return res.status(400).json({ error: "title and startISO required" });
    }

    const startAt = new Date(startISO);
    let endAt;
    if (endISO) {
      endAt = new Date(endISO);
    } else {
      const mins = Number(durationMinutes) || 60;
      endAt = new Date(startAt.getTime() + mins * 60_000);
    }

    const recurringType = ["daily", "weekly", "monthly"].includes(recurring) ? recurring : "none";
    
    // Conflict detection
    const conflicting = await Meeting.findOne({
      organizer: req.user._id,
      status: "scheduled",
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    });
    if (conflicting) {
      return res.status(400).json({ error: "Meeting conflict" });
    }

    const list = Array.isArray(invitees)
      ? [...new Set(invitees.map((e) => String(e).trim().toLowerCase()).filter(Boolean))]
      : [];

    const instancesCount = recurringType === "daily" ? 14 : recurringType === "weekly" ? 8 : recurringType === "monthly" ? 6 : 1;
    const instances = [];
    let currentStart = new Date(startAt);
    let currentEnd = new Date(endAt);

    for (let i = 0; i < instancesCount; i++) {
      const code = await generateUniqueCode();
      instances.push({
        organizer: req.user._id,
        title: String(title).trim(),
        startAt: new Date(currentStart),
        endAt: new Date(currentEnd),
        invitees: list,
        reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        code,
        status: "scheduled",
        recurring: recurringType,
      });

      if (recurringType === "daily") {
        currentStart.setDate(currentStart.getDate() + 1);
        currentEnd.setDate(currentEnd.getDate() + 1);
      } else if (recurringType === "weekly") {
        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      } else if (recurringType === "monthly") {
        currentStart.setMonth(currentStart.getMonth() + 1);
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }
    }

    const createdMeetings = await Meeting.insertMany(instances);
    const meeting = createdMeetings[0];

    const url = joinUrl(meeting.code);
    for (const to of meeting.invitees) {
      await logAndMaybeSend(req.user, {
        meetingId: meeting._id,
        type: "invite",
        to,
        subject: `Invitation: ${meeting.title}`,
        text: `You are invited to "${meeting.title}".\n\nJoin: ${url}\nCode: ${meeting.code}\nStarts: ${meeting.startAt.toISOString()}`,
      });
    }

    return res.status(201).json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create meeting" });
  }
}

async function getOne(req, res) {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    return res.json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load meeting" });
  }
}

async function update(req, res) {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    if (meeting.status === "cancelled") {
      return res.status(400).json({ error: "Cannot edit a cancelled meeting" });
    }

    const {
      title,
      startISO,
      endISO,
      durationMinutes,
      invitees,
      reminderMinutesBefore,
      timeZone,
      recurring,
    } = req.body;

    if (title !== undefined) meeting.title = String(title).trim();
    if (startISO !== undefined) meeting.startAt = new Date(startISO);
    if (endISO !== undefined) {
      meeting.endAt = new Date(endISO);
    } else if (startISO !== undefined && durationMinutes !== undefined) {
      const mins = Number(durationMinutes) || 60;
      meeting.endAt = new Date(meeting.startAt.getTime() + mins * 60_000);
    }
    if (invitees !== undefined) {
      meeting.invitees = [...new Set(invitees.map((e) => String(e).trim().toLowerCase()).filter(Boolean))];
    }
    if (reminderMinutesBefore !== undefined) {
      meeting.reminderMinutesBefore = Number(reminderMinutesBefore) || 15;
    }
    if (timeZone !== undefined) meeting.timeZone = String(timeZone);
    if (recurring !== undefined) {
      meeting.recurring = ["daily", "weekly", "monthly"].includes(recurring) ? recurring : "none";
    }

    // Conflict detection
    const conflicting = await Meeting.findOne({
      organizer: req.user._id,
      status: "scheduled",
      startAt: { $lt: meeting.endAt },
      endAt: { $gt: meeting.startAt },
      _id: { $ne: meeting._id }
    });
    if (conflicting) {
      return res.status(400).json({ error: "Meeting conflict" });
    }

    await meeting.save();

    const url = joinUrl(meeting.code);
    for (const to of meeting.invitees) {
      await logAndMaybeSend(req.user, {
        meetingId: meeting._id,
        type: "update",
        to,
        subject: `Updated: ${meeting.title}`,
        text: `The meeting was updated.\n\nJoin: ${url}\nStarts: ${meeting.startAt.toISOString()}`,
      });
    }

    return res.json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update meeting" });
  }
}

async function appendInvitees(req, res) {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    if (meeting.status === "cancelled") {
      return res.status(400).json({ error: "Meeting is cancelled" });
    }

    const emails = Array.isArray(req.body.emails)
      ? req.body.emails
      : String(req.body.emails || "")
          .split(/[\n,;]+/)
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

    const prev = new Set(meeting.invitees);
    const added = emails.filter((e) => !prev.has(e));
    meeting.invitees = [...new Set([...meeting.invitees, ...emails])];
    await meeting.save();

    const url = joinUrl(meeting.code);
    for (const to of added) {
      await logAndMaybeSend(req.user, {
        meetingId: meeting._id,
        type: "invite",
        to,
        subject: `Invitation: ${meeting.title}`,
        text: `You are invited to "${meeting.title}".\n\nJoin: ${url}\nCode: ${meeting.code}`,
      });
    }

    return res.json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to add invitees" });
  }
}

async function cancel(req, res) {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    meeting.status = "cancelled";
    meeting.cancelledAt = new Date();
    await meeting.save();

    for (const to of meeting.invitees) {
      await logAndMaybeSend(req.user, {
        meetingId: meeting._id,
        type: "cancel",
        to,
        subject: `Cancelled: ${meeting.title}`,
        text: "This meeting has been cancelled.",
      });
    }

    return res.json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to cancel" });
  }
}

async function restore(req, res) {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id,
    });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    meeting.status = "scheduled";
    meeting.cancelledAt = null;
    await meeting.save();
    return res.json({ meeting: meetingJson(meeting) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to restore" });
  }
}

async function remove(req, res) {
  try {
    const r = await Meeting.deleteOne({ _id: req.params.id, organizer: req.user._id });
    if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete" });
  }
}

async function publicByCode(req, res) {
  try {
    const code = String(req.params.code || "")
      .trim()
      .toUpperCase();
    const meeting = await Meeting.findOne({ code }).lean();
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    return res.json({
      meeting: {
        id: meeting._id.toString(),
        title: meeting.title,
        code: meeting.code,
        status: meeting.status,
        startISO: new Date(meeting.startAt).toISOString(),
        endISO: new Date(meeting.endAt).toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Lookup failed" });
  }
}

module.exports = {
  list,
  conflicts,
  create,
  getOne,
  update,
  appendInvitees,
  cancel,
  restore,
  remove,
  publicByCode,
};

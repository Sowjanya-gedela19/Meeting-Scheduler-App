const { userResponse } = require("./auth.controller");

async function patchMe(req, res) {
  try {
    const { displayTimeZone, simulateEmail, personalBusy } = req.body;
    if (displayTimeZone !== undefined) req.user.displayTimeZone = String(displayTimeZone);
    if (simulateEmail !== undefined) req.user.simulateEmail = Boolean(simulateEmail);
    if (personalBusy !== undefined) {
      req.user.personalBusy = Array.isArray(personalBusy)
        ? personalBusy.map(String)
        : [];
    }
    await req.user.save();
    return res.json({ user: userResponse(req.user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Update failed" });
  }
}

async function emailLogs(req, res) {
  try {
    const EmailLog = require("../models/EmailLog");
    const rows = await EmailLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    const list = rows.map((r) => ({
      id: r._id.toString(),
      type: r.type,
      to: r.to,
      subject: r.subject,
      body: r.body,
      sent: r.sent,
      error: r.error,
      createdAt: r.createdAt,
      meetingId: r.meeting ? r.meeting.toString() : null,
    }));
    return res.json({ logs: list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load logs" });
  }
}

module.exports = { patchMe, emailLogs };

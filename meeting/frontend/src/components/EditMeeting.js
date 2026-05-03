import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as meetingsApi from "../api/meetingsApi";
import { useMeetings } from "../context/MeetingsContext";
import { isCancelled } from "../lib/meetingUtils";

function parseEmails(raw) {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toDatetimeLocalValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditMeeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, editMeeting, showToast } = useMeetings();
  const meeting = useMemo(() => meetings.find((m) => m.id === id), [meetings, id]);

  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("60");
  const [inviteRaw, setInviteRaw] = useState("");
  const [reminder, setReminder] = useState("15");
  const [timeZone, setTimeZone] = useState("");
  const [ignoreClash, setIgnoreClash] = useState(false);
  const [clashes, setClashes] = useState([]);

  useEffect(() => {
    if (!meeting) return;
    setTitle(meeting.title);
    setStart(toDatetimeLocalValue(meeting.startISO));
    const ms =
      (new Date(meeting.endISO).getTime() - new Date(meeting.startISO).getTime()) / 60_000;
    setDuration(String(ms > 0 ? ms : 60));
    setInviteRaw((meeting.invitees || []).join(", "));
    setReminder(String(meeting.reminderMinutesBefore || 15));
    setTimeZone(meeting.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [meeting]);

  useEffect(() => {
    setIgnoreClash(false);
  }, [start, duration]);

  useEffect(() => {
    if (!start || !meeting) {
      setClashes([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const startD = new Date(start);
        const endISO = new Date(
          startD.getTime() + Number(duration || 60) * 60_000
        ).toISOString();
        const list = await meetingsApi.fetchConflicts({
          startISO: startD.toISOString(),
          endISO,
          excludeId: meeting.id,
        });
        if (!cancelled) setClashes(list || []);
      } catch {
        if (!cancelled) setClashes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [start, duration, meeting]);

  if (!meeting) {
    return (
      <main className="page page--narrow">
        <p>Meeting not found.</p>
        <Link to="/meetings" className="link">
          Back to meetings
        </Link>
      </main>
    );
  }

  if (isCancelled(meeting)) {
    return (
      <main className="page page--narrow">
        <p>This meeting is cancelled. Restore it from the detail page to edit.</p>
        <Link to={`/meetings/${meeting.id}`} className="link">
          View meeting
        </Link>
      </main>
    );
  }

  const zones = [
    timeZone,
    "UTC",
    "America/New_York",
    "Europe/London",
    "Asia/Tokyo",
  ].filter((v, i, a) => a.indexOf(v) === i);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !start) {
      alert("Please add a title and start time.");
      return;
    }
    if (clashes.length && !ignoreClash) {
      showToast("Time conflicts with another meeting — confirm or adjust.");
      return;
    }
    const startD = new Date(start);
    const endD = new Date(startD.getTime() + Number(duration) * 60_000);
    const invitees = parseEmails(inviteRaw);
    try {
      await editMeeting(meeting.id, {
        title: title.trim(),
        startISO: startD.toISOString(),
        endISO: endD.toISOString(),
        invitees,
        reminderMinutesBefore: Number(reminder) || 15,
        timeZone,
      });
      showToast("Meeting updated.");
      navigate(`/meetings/${meeting.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Update failed";
      alert(msg);
    }
  }

  return (
    <main className="page page--wide">
      <Link to={`/meetings/${meeting.id}`} className="back-link">
        ← Back to meeting
      </Link>
      <div className="card card--form card--stretch">
        <h1>Edit meeting</h1>
        <p className="lede lede--tight">Change title, schedule, invites, or reminder.</p>

        {clashes.length > 0 ? (
          <div className="clash-banner" role="alert">
            <strong>Availability conflict</strong>
            <p>Overlaps: {clashes.map((c) => c.title).join(", ")}</p>
            <label className="field field--row">
              <input
                type="checkbox"
                checked={ignoreClash}
                onChange={(e) => setIgnoreClash(e.target.checked)}
              />
              <span>Save anyway (I will resolve the clash)</span>
            </label>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label className="field">
            <span>Starts (your device local time)</span>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Meeting time zone (for invites & labels)</span>
            <select
              className="select"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Duration</span>
            <select
              className="select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>
          </label>
          <label className="field">
            <span>Invitees (emails)</span>
            <textarea
              className="textarea"
              value={inviteRaw}
              onChange={(e) => setInviteRaw(e.target.value)}
              rows={3}
            />
          </label>
          <label className="field">
            <span>Reminder before start</span>
            <select
              className="select"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="60">1 hour</option>
              <option value="1440">1 day</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary btn--block">
            Save changes
          </button>
        </form>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as meetingsApi from "../api/meetingsApi";
import { useMeetings } from "../context/MeetingsContext";

function parseEmails(raw) {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function CreateMeeting() {
  const navigate = useNavigate();
  const { createMeeting, showToast } = useMeetings();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("60");
  const [inviteRaw, setInviteRaw] = useState("");
  const [reminder, setReminder] = useState("15");
  const [timeZone, setTimeZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [ignoreClash, setIgnoreClash] = useState(false);
  const [clashes, setClashes] = useState([]);

  useEffect(() => {
    setIgnoreClash(false);
  }, [start, duration]);

  useEffect(() => {
    if (!start) {
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
        });
        if (!cancelled) setClashes(list || []);
      } catch {
        if (!cancelled) setClashes([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [start, duration]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !start) {
      alert("Please add a title and start time.");
      return;
    }
    if (clashes.length && !ignoreClash) {
      showToast("Time conflicts with another meeting — adjust or confirm.");
      return;
    }
    const invitees = parseEmails(inviteRaw);
    try {
      const m = await createMeeting({
        title: title.trim(),
        startISO: new Date(start).toISOString(),
        durationMinutes: duration,
        invitees,
        reminderMinutesBefore: reminder,
        timeZone,
      });
      showToast(
        invitees.length
          ? `Meeting created — ${invitees.length} invite(s) saved.`
          : "Meeting created."
      );
      navigate(`/meetings/${m.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || "Could not create meeting";
      alert(msg);
    }
  }

  const zones = [
    timeZone,
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Asia/Tokyo",
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <main className="page page--wide">
      <Link to="/meetings" className="back-link">
        ← All meetings
      </Link>
      <div className="card card--form card--stretch">
        <h1>Create a meeting</h1>
        <p className="lede lede--tight">
          Set title, date & time, meeting time zone, invitees, and reminder. Invites are sent via
          the server when SMTP is configured.
        </p>

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
              <span>Create anyway (I will resolve the clash)</span>
            </label>
          </div>
        ) : null}

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product review"
              required
            />
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
            <span>Invite others (emails)</span>
            <textarea
              className="textarea"
              value={inviteRaw}
              onChange={(e) => setInviteRaw(e.target.value)}
              placeholder="alex@company.com, sam@company.com"
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
            Create meeting
          </button>
        </form>
      </div>
    </main>
  );
}

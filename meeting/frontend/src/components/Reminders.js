import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMeetings } from "../context/MeetingsContext";
import { isCancelled } from "../lib/meetingUtils";

export default function Reminders() {
  const { meetings } = useMeetings();
  const [perm, setPerm] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  const upcoming = useMemo(
    () =>
      [...meetings]
        .filter((m) => !isCancelled(m) && new Date(m.endISO).getTime() >= Date.now())
        .sort((a, b) => new Date(a.startISO) - new Date(b.startISO)),
    [meetings]
  );

  async function enableNotifications() {
    if (typeof Notification === "undefined" || !Notification.requestPermission) return;
    const p = await Notification.requestPermission();
    setPerm(p);
  }

  return (
    <main className="page page--wide">
      <Link to="/dashboard" className="back-link">
        ← App home
      </Link>

      <h1 className="page-title">Reminders</h1>
      <p className="lede">
        Each meeting uses its own “remind before start” setting. When the time hits, we can show a
        browser notification and add a simulated reminder row to the{" "}
        <Link to="/emails" className="link">
          Email log
        </Link>
        .
      </p>

      <div className="card card--form card--stretch remind-card">
        <h2 className="h2-plain">Browser notifications</h2>
        <p className="lede lede--tight">
          Status: <strong>{perm}</strong>
        </p>
        {perm === "default" && (
          <button type="button" className="btn btn--primary" onClick={enableNotifications}>
            Enable reminders
          </button>
        )}
        {perm === "denied" && (
          <p className="hint">Notifications are blocked for this site. Enable them in browser settings.</p>
        )}
        {perm === "unsupported" && (
          <p className="hint">This browser does not support notifications.</p>
        )}
      </div>

      <section className="section">
        <h2 className="section-title">Upcoming — reminder timing</h2>
        {upcoming.length === 0 ? (
          <p className="empty">No upcoming meetings.</p>
        ) : (
          <ul className="meeting-list">
            {upcoming.map((m) => (
              <li key={m.id} className="meeting-row">
                <div>
                  <Link to={`/meetings/${m.id}`} className="meeting-row__title">
                    {m.title}
                  </Link>
                  <p className="meeting-row__meta">
                    {new Date(m.startISO).toLocaleString()} · Reminder{" "}
                    <strong>{m.reminderMinutesBefore} min</strong> before
                  </p>
                </div>
                <Link to={`/room/${m.code}`} className="btn btn--secondary btn--sm">
                  Join
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

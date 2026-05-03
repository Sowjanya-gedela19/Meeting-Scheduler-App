import { Link } from "react-router-dom";
import { useMeetings } from "../context/MeetingsContext";
import { useSettings } from "../context/SettingsContext";
import { formatRangeTz, isCancelled } from "../lib/meetingUtils";

export default function MeetingsList() {
  const { meetings } = useMeetings();
  const { displayTimeZone } = useSettings();
  const now = Date.now();

  const upcomingActive = [...meetings]
    .filter((m) => !isCancelled(m) && new Date(m.endISO).getTime() >= now)
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO));

  const cancelledUpcoming = [...meetings]
    .filter((m) => isCancelled(m) && new Date(m.endISO).getTime() >= now)
    .sort((a, b) => new Date(a.startISO) - new Date(b.startISO));

  const past = [...meetings]
    .filter((m) => new Date(m.endISO).getTime() < now)
    .sort((a, b) => new Date(b.startISO) - new Date(a.startISO));

  return (
    <main className="page page--wide">
      <div className="page-head">
        <div>
          <h1 className="page-title">Your meetings</h1>
          <p className="lede lede--tight">
            Times shown in <strong>{displayTimeZone}</strong> (see Settings to change).
          </p>
        </div>
        <Link to="/meetings/new" className="btn btn--primary">
          New meeting
        </Link>
      </div>

      <section className="section">
        <h2 className="section-title">Upcoming</h2>
        {upcomingActive.length === 0 ? (
          <p className="empty">
            No upcoming meetings.{" "}
            <Link to="/meetings/new" className="link">
              Create one
            </Link>
            .
          </p>
        ) : (
          <ul className="meeting-list">
            {upcomingActive.map((m) => (
              <li key={m.id} className="meeting-row">
                <div>
                  <Link to={`/meetings/${m.id}`} className="meeting-row__title">
                    {m.title}
                  </Link>
                  <p className="meeting-row__meta">
                    {formatRangeTz(m.startISO, m.endISO, displayTimeZone)}
                  </p>
                  <p className="meeting-row__code">
                    Code <strong>{m.code}</strong>
                  </p>
                </div>
                <div className="meeting-row__actions">
                  <Link to={`/room/${m.code}`} className="btn btn--secondary btn--sm">
                    Join
                  </Link>
                  <Link to={`/meetings/${m.id}`} className="btn btn--ghost btn--sm">
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Cancelled</h2>
        {cancelledUpcoming.length === 0 ? (
          <p className="empty">No cancelled upcoming meetings.</p>
        ) : (
          <ul className="meeting-list meeting-list--muted">
            {cancelledUpcoming.map((m) => (
              <li key={m.id} className="meeting-row">
                <div>
                  <Link to={`/meetings/${m.id}`} className="meeting-row__title">
                    {m.title}
                  </Link>
                  <p className="meeting-row__meta">
                    {formatRangeTz(m.startISO, m.endISO, displayTimeZone)}
                  </p>
                </div>
                <Link to={`/meetings/${m.id}`} className="btn btn--ghost btn--sm">
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">Past</h2>
        {past.length === 0 ? (
          <p className="empty">No past meetings yet.</p>
        ) : (
          <ul className="meeting-list meeting-list--muted">
            {past.map((m) => (
              <li key={m.id} className="meeting-row">
                <div>
                  <span className="meeting-row__title meeting-row__title--static">
                    {m.title}
                    {isCancelled(m) ? " (cancelled)" : ""}
                  </span>
                  <p className="meeting-row__meta">
                    {formatRangeTz(m.startISO, m.endISO, displayTimeZone)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

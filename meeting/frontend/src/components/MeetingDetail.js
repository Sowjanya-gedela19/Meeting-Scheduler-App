import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMeetings } from "../context/MeetingsContext";
import { useSettings } from "../context/SettingsContext";
import { formatInTimeZone, isCancelled } from "../lib/meetingUtils";

function parseEmails(raw) {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { meetings, addInvitees, cancelMeeting, restoreMeeting, removeMeeting, showToast } =
    useMeetings();
  const { displayTimeZone } = useSettings();
  const [inviteRaw, setInviteRaw] = useState("");

  const meeting = useMemo(() => meetings.find((m) => m.id === id), [meetings, id]);

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

  const joinUrl = `${window.location.origin}/room/${meeting.code}`;
  const cancelled = isCancelled(meeting);
  const meetingTz = meeting.timeZone || displayTimeZone;

  function copyLink() {
    navigator.clipboard.writeText(joinUrl).then(
      () => showToast("Join link copied."),
      () => alert(joinUrl)
    );
  }

  function handleAddInvites(e) {
    e.preventDefault();
    const emails = parseEmails(inviteRaw);
    if (!emails.length) return;
    addInvitees(meeting.id, emails);
    setInviteRaw("");
    showToast(`Added ${emails.length} invite(s).`);
  }

  function handleCancel() {
    if (!window.confirm("Cancel this meeting for everyone?")) return;
    cancelMeeting(meeting.id);
    showToast("Meeting cancelled. Simulated cancel emails were queued if invitees exist.");
  }

  function handleRestore() {
    restoreMeeting(meeting.id);
    showToast("Meeting restored.");
  }

  function handleRemoveForever() {
    if (!window.confirm("Permanently remove this meeting from your list?")) return;
    removeMeeting(meeting.id);
    navigate("/meetings");
  }

  return (
    <main className="page page--wide">
      <Link to="/meetings" className="back-link">
        ← All meetings
      </Link>

      {cancelled ? (
        <div className="cancelled-banner" role="status">
          This meeting is <strong>cancelled</strong>. Join is disabled. You can restore it or
          remove it from history.
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="card card--form card--stretch">
          <h1>{meeting.title}</h1>
          <div className="tz-block">
            <p className="lede lede--tight">
              <strong>Your display zone ({displayTimeZone})</strong>
              <br />
              {formatInTimeZone(meeting.startISO, displayTimeZone, {
                dateStyle: "full",
                timeStyle: "short",
              })}{" "}
              →{" "}
              {formatInTimeZone(meeting.endISO, displayTimeZone, {
                timeStyle: "short",
              })}
            </p>
            <p className="lede lede--tight">
              <strong>Meeting zone ({meetingTz})</strong>
              <br />
              {formatInTimeZone(meeting.startISO, meetingTz, {
                dateStyle: "full",
                timeStyle: "short",
              })}{" "}
              →{" "}
              {formatInTimeZone(meeting.endISO, meetingTz, { timeStyle: "short" })}
            </p>
          </div>
          <dl className="detail-facts">
            <div>
              <dt>Join code</dt>
              <dd>
                <code className="code-pill">{meeting.code}</code>
              </dd>
            </div>
            <div>
              <dt>Meeting link</dt>
              <dd>
                <div className="meeting-link-row">
                  <input readOnly className="meeting-link-input" value={joinUrl} />
                  <button type="button" className="btn btn--secondary btn--sm" onClick={copyLink}>
                    Copy
                  </button>
                </div>
              </dd>
            </div>
            <div>
              <dt>Reminder</dt>
              <dd>{meeting.reminderMinutesBefore} minutes before</dd>
            </div>
          </dl>
          <div className="detail-actions">
            {!cancelled ? (
              <Link to={`/room/${meeting.code}`} className="btn btn--primary">
                Join meeting
              </Link>
            ) : null}
            <button type="button" className="btn btn--secondary" onClick={copyLink}>
              Copy invite link
            </button>
            {!cancelled ? (
              <Link to={`/meetings/${meeting.id}/edit`} className="btn btn--secondary">
                Edit meeting
              </Link>
            ) : null}
            {!cancelled ? (
              <button type="button" className="btn btn--ghost" onClick={handleCancel}>
                Cancel meeting
              </button>
            ) : (
              <>
                <button type="button" className="btn btn--secondary" onClick={handleRestore}>
                  Restore meeting
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleRemoveForever}>
                  Remove from history
                </button>
              </>
            )}
          </div>
        </div>

        <div className="card card--form card--stretch">
          <h2 className="h2-plain">Invite participants</h2>
          <p className="lede lede--tight">
            Add emails — simulated invite messages appear on the Email log page when enabled in
            Settings.
          </p>
          {meeting.invitees?.length ? (
            <ul className="chip-list">
              {meeting.invitees.map((email) => (
                <li key={email} className="chip">
                  {email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty">No invitees yet.</p>
          )}
          {!cancelled ? (
            <form className="form" onSubmit={handleAddInvites}>
              <label className="field">
                <span>Email addresses</span>
                <textarea
                  className="textarea"
                  value={inviteRaw}
                  onChange={(e) => setInviteRaw(e.target.value)}
                  rows={3}
                  placeholder="name@company.com"
                />
              </label>
              <button type="submit" className="btn btn--primary btn--block">
                Add invites
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}

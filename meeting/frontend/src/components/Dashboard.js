import { Link, useNavigate } from "react-router-dom";
import { useMeetings } from "../context/MeetingsContext";
import { isCancelled } from "../lib/meetingUtils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { meetings, createMeeting, showToast } = useMeetings();
  const now = Date.now();
  const upcoming = meetings.filter(
    (m) => !isCancelled(m) && new Date(m.endISO).getTime() >= now
  ).length;

  function startInstant() {
    const m = createMeeting({
      title: "Instant meeting",
      startISO: new Date().toISOString(),
      durationMinutes: 60,
      invitees: [],
      reminderMinutesBefore: 5,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    showToast("Instant meeting created — share the code from the room.");
    navigate(`/room/${m.code}`);
  }

  return (
    <main className="page page--wide">
      <div className="page-head">
        <div>
          <h1 className="page-title">Meeting Scheduler App</h1>
          <p className="lede lede--tight">
            You have <strong>{upcoming}</strong> upcoming meeting{upcoming === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <div className="dash-grid">
        <button type="button" className="dash-card dash-card--accent" onClick={startInstant}>
          <span className="dash-card__k">Quick start</span>
          <span className="dash-card__t">Start instant meeting</span>
          <span className="dash-card__d">Opens a Zoom-style room with a join code.</span>
        </button>

        <Link to="/meetings/new" className="dash-card">
          <span className="dash-card__k">Schedule</span>
          <span className="dash-card__t">Create meeting</span>
          <span className="dash-card__d">Set time, duration, invites, and reminders.</span>
        </Link>

        <Link to="/meetings" className="dash-card">
          <span className="dash-card__k">Organize</span>
          <span className="dash-card__t">My meetings</span>
          <span className="dash-card__d">See what is coming up and open join links.</span>
        </Link>

        <Link to="/availability" className="dash-card">
          <span className="dash-card__k">Plan</span>
          <span className="dash-card__t">Availability</span>
          <span className="dash-card__d">View meeting load and mark personal busy time.</span>
        </Link>

        <Link to="/join" className="dash-card">
          <span className="dash-card__k">Connect</span>
          <span className="dash-card__t">Join with code</span>
          <span className="dash-card__d">Enter a 6-character code to enter the room.</span>
        </Link>

        <Link to="/reminders" className="dash-card">
          <span className="dash-card__k">Alerts</span>
          <span className="dash-card__t">Reminders</span>
          <span className="dash-card__d">Turn on browser notifications before your meetings.</span>
        </Link>

        <Link to="/calendar" className="dash-card">
          <span className="dash-card__k">Overview</span>
          <span className="dash-card__t">Calendar</span>
          <span className="dash-card__d">Month view with meetings on each day.</span>
        </Link>

        <Link to="/emails" className="dash-card">
          <span className="dash-card__k">Simulated</span>
          <span className="dash-card__t">Email log</span>
          <span className="dash-card__d">See queued invite, update, cancel, and reminder emails.</span>
        </Link>

        <Link to="/settings" className="dash-card">
          <span className="dash-card__k">Profile</span>
          <span className="dash-card__t">Settings</span>
          <span className="dash-card__d">Display time zone and email simulation toggle.</span>
        </Link>
      </div>
    </main>
  );
}

import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <main className="page page--center">
      <header className="hero">
        <p className="eyebrow">Meeting Scheduler App</p>
        <h1>Schedule meetings, invite people, and join calls</h1>
        <p className="lede">
          Create sessions, check availability, share join codes, and get reminders.
        </p>
      </header>

      <div className="card card--actions">
        <div className="action-grid">
          <button type="button" className="btn btn--primary" onClick={() => nav("/meetings/new")}>
            Create meeting
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => nav("/join")}>
            Join with code
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => nav("/availability")}>
            Check availability
          </button>
        </div>
        <p className="hint">
          <Link to="/signup" className="link">
            Sign up
          </Link>
          {" · "}
          <Link to="/login" className="link">
            Log in
          </Link>
          {" · "}
          <Link to="/join" className="link">
            Join with code
          </Link>
        </p>
      </div>
    </main>
  );
}

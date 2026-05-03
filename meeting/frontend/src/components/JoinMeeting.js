import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function JoinMeeting() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    navigate(`/room/${c}`);
  }

  return (
    <main className="page page--narrow">
      <Link to="/" className="back-link">
        ← Home
      </Link>
      <div className="card card--form">
        <h1>Join a meeting</h1>
        <p className="lede lede--tight">Enter the 6-character code (like a Zoom meeting ID).</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Meeting code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC12X"
              maxLength={10}
              autoComplete="off"
            />
          </label>
          <button type="submit" className="btn btn--primary btn--block">
            Join
          </button>
        </form>
      </div>
    </main>
  );
}

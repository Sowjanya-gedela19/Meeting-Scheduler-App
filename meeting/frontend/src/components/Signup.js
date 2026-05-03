import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for the password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await signup(email, password);
      if (res.error) {
        setError(res.error);
        return;
      }
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page page--narrow">
      <Link to="/" className="back-link">
        ← Back home
      </Link>
      <div className="card card--form">
        <h1>Create account</h1>
        <p className="lede lede--tight">
          Sign up for the Meeting Scheduler App (demo — data stays in this browser).
        </p>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="hint">
          Already registered?{" "}
          <Link to="/login" className="link">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

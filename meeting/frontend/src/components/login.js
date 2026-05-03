import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.error) {
        setError(res.error);
        return;
      }
      const dest = location.state?.from || "/dashboard";
      navigate(dest, { replace: true });
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
        <h1>Log in</h1>
        <p className="lede lede--tight">Use the account you created on this device.</p>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="username"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            className="btn btn--primary btn--block"
            disabled={submitting}
          >
            {submitting ? "Signing in…" : "Continue"}
          </button>
        </form>
        <p className="hint">
          Need an account?{" "}
          <Link to="/signup" className="link">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

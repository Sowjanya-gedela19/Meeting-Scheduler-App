import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEmailLogs } from "../api/usersApi";

export default function SimulatedEmails() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const logs = await fetchEmailLogs();
        if (!cancelled) setEntries(logs);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.error || "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page page--wide">
      <Link to="/dashboard" className="back-link">
        ← App home
      </Link>
      <h1 className="page-title">Email log</h1>
      <p className="lede">
        Messages queued or sent by the server (Nodemailer when SMTP is configured). Rows with
        <strong> sent ✓</strong> were handed to your mail provider.
      </p>

      {error ? <p className="form-error">{error}</p> : null}

      {entries.length === 0 && !error ? (
        <p className="empty">No messages yet.</p>
      ) : null}

      {entries.length > 0 ? (
        <div className="email-table-wrap">
          <table className="email-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Type</th>
                <th>To</th>
                <th>Subject</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`email-tag email-tag--${row.type}`}>{row.type}</span>
                  </td>
                  <td>{row.to}</td>
                  <td>{row.subject}</td>
                  <td>{row.sent ? "Yes" : "No"}{row.error ? ` (${row.error})` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

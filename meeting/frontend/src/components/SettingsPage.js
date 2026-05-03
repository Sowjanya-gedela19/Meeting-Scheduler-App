import { Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import { ensureZoneInList } from "../lib/commonTimeZones";

export default function SettingsPage() {
  const { displayTimeZone, setDisplayTimeZone, simulateEmail, setSimulateEmail } =
    useSettings();
  const zones = ensureZoneInList(displayTimeZone);

  return (
    <main className="page page--wide">
      <Link to="/dashboard" className="back-link">
        ← App home
      </Link>
      <h1 className="page-title">Settings</h1>
      <p className="lede">
        Choose how times are shown across the app and whether to record simulated email
        notifications locally.
      </p>

      <div className="card card--form card--stretch settings-card">
        <h2 className="h2-plain">Time zone</h2>
        <p className="lede lede--tight">
          Calendar and meeting lists use this zone for dates and labels (the instant is still
          stored in UTC).
        </p>
        <label className="field">
          <span>Display time zone</span>
          <select
            className="select"
            value={displayTimeZone}
            onChange={(e) => setDisplayTimeZone(e.target.value)}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card card--form card--stretch settings-card">
        <h2 className="h2-plain">Email notifications (simulated)</h2>
        <p className="lede lede--tight">
          When enabled, invites, updates, cancellations, and reminder emails are appended to the
          Email log — no real messages are sent.
        </p>
        <label className="field field--row">
          <input
            type="checkbox"
            checked={simulateEmail}
            onChange={(e) => setSimulateEmail(e.target.checked)}
          />
          <span>Record simulated emails</span>
        </label>
      </div>
    </main>
  );
}

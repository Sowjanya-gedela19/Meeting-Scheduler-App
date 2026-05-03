import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMeetings } from "../context/MeetingsContext";
import { useSettings } from "../context/SettingsContext";
import { isActiveMeeting } from "../lib/meetingUtils";

function dateKeyInZone(iso, tz) {
  try {
    return new Date(iso).toLocaleDateString("en-CA", { timeZone: tz });
  } catch {
    return new Date(iso).toISOString().slice(0, 10);
  }
}

function startOfCalendarMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1);
}

function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthMatrix(year, monthIndex) {
  const first = startOfCalendarMonth(year, monthIndex);
  const lead = (first.getDay() + 6) % 7;
  const total = daysInMonth(year, monthIndex);
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= total; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  while (cells.length < 42) cells.push(null);
  const rows = [];
  for (let r = 0; r < cells.length / 7; r += 1) {
    rows.push(cells.slice(r * 7, r * 7 + 7));
  }
  return rows;
}

export default function CalendarView() {
  const { meetings } = useMeetings();
  const { displayTimeZone } = useSettings();
  const anchor = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({
    y: anchor.getFullYear(),
    m: anchor.getMonth(),
  });

  const byDay = useMemo(() => {
    const map = new Map();
    for (const m of meetings) {
      if (!isActiveMeeting(m)) continue;
      const k = dateKeyInZone(m.startISO, displayTimeZone);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(m);
    }
    return map;
  }, [meetings, displayTimeZone]);

  const rows = useMemo(
    () => monthMatrix(cursor.y, cursor.m),
    [cursor.y, cursor.m]
  );

  const title = new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    setSelectedKey(null);
  }, [cursor.y, cursor.m]);

  return (
    <main className="page page--wide">
      <Link to="/dashboard" className="back-link">
        ← App home
      </Link>
      <div className="page-head">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="lede lede--tight">
            Month view in <strong>{displayTimeZone}</strong> — change it in Settings.
          </p>
        </div>
        <div className="week-nav">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m - 1, 1);
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
            }}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              const t = new Date();
              setCursor({ y: t.getFullYear(), m: t.getMonth() });
            }}
          >
            Today
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              const d = new Date(cursor.y, cursor.m + 1, 1);
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
            }}
          >
            Next
          </button>
        </div>
      </div>

      <div className="calendar-shell">
        <h2 className="calendar-title">{title}</h2>
        <div className="cal-grid cal-grid--head">
          {WEEKDAYS.map((d) => (
            <div key={d} className="cal-head">
              {d}
            </div>
          ))}
        </div>
        {rows.map((week, wi) => (
          <div key={wi} className="cal-grid">
            {week.map((day, di) => {
              if (day == null) {
                return <div key={`e-${wi}-${di}`} className="cal-cell cal-cell--empty" />;
              }
              const key = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const list = byDay.get(key) || [];
              return (
                <button
                  key={key}
                  type="button"
                  className={`cal-cell${list.length ? " cal-cell--busy" : ""}${selectedKey === key ? " is-selected" : ""}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <span className="cal-daynum">{day}</span>
                  {list.length > 0 ? (
                    <span className="cal-dots" aria-hidden>
                      {list.slice(0, 3).map((m) => (
                        <span key={m.id} className="cal-dot" />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedKey ? (
        <section className="section cal-side">
          <h2 className="section-title">Meetings on {selectedKey}</h2>
          {(byDay.get(selectedKey) || []).length === 0 ? (
            <p className="empty">No scheduled meetings.</p>
          ) : (
            <ul className="meeting-list">
              {(byDay.get(selectedKey) || []).map((m) => (
                <li key={m.id} className="meeting-row">
                  <div>
                    <Link to={`/meetings/${m.id}`} className="meeting-row__title">
                      {m.title}
                    </Link>
                    <p className="meeting-row__meta">
                      {new Date(m.startISO).toLocaleTimeString(undefined, {
                        timeZone: displayTimeZone,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
      ) : (
        <p className="hint cal-hint">Select a day to see meetings.</p>
      )}
    </main>
  );
}

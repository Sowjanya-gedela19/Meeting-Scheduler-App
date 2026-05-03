import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { patchProfile } from "../api/usersApi";
import { useMeetings } from "../context/MeetingsContext";
import { useAuth } from "../context/AuthContext";
import { isActiveMeeting } from "../lib/meetingUtils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function startOfWeekMonday(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(base, n) {
  const x = new Date(base);
  x.setDate(x.getDate() + n);
  return x;
}

function slotBusyMeeting(meetings, weekStart, dayIndex, hour) {
  const slotStart = addDays(weekStart, dayIndex);
  slotStart.setHours(hour, 0, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
  const a = slotStart.getTime();
  const b = slotEnd.getTime();
  return meetings.filter(isActiveMeeting).some((m) => {
    const ms = new Date(m.startISO).getTime();
    const me = new Date(m.endISO).getTime();
    return ms < b && me > a;
  });
}

export default function Availability() {
  const { meetings } = useMeetings();
  const { user, refreshUser } = useAuth();
  const [weekOffset, setWeekOffset] = useState(0);
  const [personalBusy, setPersonalBusy] = useState(() => new Set());

  useEffect(() => {
    if (user?.personalBusy?.length) {
      setPersonalBusy(new Set(user.personalBusy));
    } else {
      setPersonalBusy(new Set());
    }
  }, [user?.personalBusy]);

  const weekStart = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    return startOfWeekMonday(base);
  }, [weekOffset]);

  const label = useMemo(() => {
    const end = addDays(weekStart, 6);
    const opts = { month: "short", day: "numeric" };
    return `${weekStart.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }, [weekStart]);

  async function togglePersonal(d, h) {
    const key = `${d}-${h}`;
    const next = new Set(personalBusy);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setPersonalBusy(next);
    try {
      await patchProfile({ personalBusy: [...next] });
      await refreshUser();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <main className="page page--wide">
      <Link to="/dashboard" className="back-link">
        ← App home
      </Link>

      <div className="page-head">
        <div>
          <h1 className="page-title">Check availability</h1>
          <p className="lede lede--tight">
            Blue = scheduled meeting. Striped = personal “busy”. Click empty cells to block time
            (saved to your profile).
          </p>
        </div>
        <div className="week-nav">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setWeekOffset((w) => w - 1)}>
            Previous week
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setWeekOffset(0)}>
            This week
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Next week
          </button>
        </div>
      </div>

      <p className="week-label">{label}</p>

      <div className="avail-wrap">
        <div className="avail-grid" role="grid" aria-label="Weekly availability">
          <div className="avail-corner" />
          {DAYS.map((d, i) => (
            <div key={d} className="avail-head">
              {d}
              <span className="avail-sub">{addDays(weekStart, i).toLocaleDateString(undefined, { day: "numeric" })}</span>
            </div>
          ))}
          {HOURS.map((h) => (
            <Fragment key={h}>
              <div className="avail-time">
                {h}:00
              </div>
              {DAYS.map((_, d) => {
                const fromMeeting = slotBusyMeeting(meetings, weekStart, d, h);
                const key = `${d}-${h}`;
                const fromPersonal = personalBusy.has(key);
                let cellClass = "avail-cell";
                if (fromMeeting) cellClass += " avail-cell--meeting";
                else if (fromPersonal) cellClass += " avail-cell--personal";
                return (
                  <button
                    key={`${d}-${h}`}
                    type="button"
                    className={cellClass}
                    onClick={() => !fromMeeting && togglePersonal(d, h)}
                    disabled={fromMeeting}
                    title={
                      fromMeeting
                        ? "Busy — meeting scheduled"
                        : fromPersonal
                          ? "Personal busy — click to clear"
                          : "Click to mark busy"
                    }
                    aria-label={`${DAYS[d]} ${h}:00`}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}

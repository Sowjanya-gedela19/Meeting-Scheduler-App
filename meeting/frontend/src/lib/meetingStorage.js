export const MEETINGS_KEY = "msa-meetings-v1";

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function migrateMeeting(m) {
  return {
    ...m,
    timeZone:
      m.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: m.status || "scheduled",
  };
}

export function loadMeetings() {
  try {
    const raw = localStorage.getItem(MEETINGS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(migrateMeeting) : [];
  } catch {
    return [];
  }
}

function persist(meetings) {
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
}

export function saveMeetings(meetings) {
  persist(meetings);
}

/** Overlapping scheduled (non-cancelled) meetings in [startISO, endISO). */
export function findSchedulingConflicts(startISO, endISO, excludeMeetingId) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return loadMeetings().filter((m) => {
    if (m.status === "cancelled") return false;
    if (excludeMeetingId && m.id === excludeMeetingId) return false;
    const ms = new Date(m.startISO).getTime();
    const me = new Date(m.endISO).getTime();
    return ms < end && me > start;
  });
}

export function createMeeting({
  title,
  startISO,
  durationMinutes,
  invitees,
  reminderMinutesBefore,
  timeZone,
}) {
  const meetings = loadMeetings();
  const usedCodes = new Set(meetings.map((m) => m.code));
  let code = randomCode();
  for (let n = 0; n < 100 && usedCodes.has(code); n += 1) {
    code = randomCode();
  }

  const start = new Date(startISO);
  const end = new Date(start.getTime() + Number(durationMinutes) * 60_000);
  const meeting = {
    id: crypto.randomUUID(),
    title: title.trim(),
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    invitees: Array.isArray(invitees) ? invitees : [],
    reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
    timeZone:
      timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "scheduled",
    code,
    createdAt: new Date().toISOString(),
  };
  meetings.push(meeting);
  persist(meetings);
  return meeting;
}

export function updateMeeting(id, patch) {
  const meetings = loadMeetings();
  const i = meetings.findIndex((m) => m.id === id);
  if (i === -1) return null;
  meetings[i] = { ...meetings[i], ...patch };
  persist(meetings);
  return meetings[i];
}

export function appendInvitees(id, emails) {
  const m = loadMeetings().find((x) => x.id === id);
  if (!m) return null;
  const set = new Set(
    [...(m.invitees || []), ...emails].map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  return updateMeeting(id, { invitees: [...set] });
}

export function cancelMeeting(id) {
  return updateMeeting(id, {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
}

export function restoreMeeting(id) {
  return updateMeeting(id, {
    status: "scheduled",
    cancelledAt: null,
  });
}

export function deleteMeeting(id) {
  const meetings = loadMeetings().filter((m) => m.id !== id);
  persist(meetings);
}

export function getMeetingById(id) {
  return loadMeetings().find((m) => m.id === id) || null;
}

export function getMeetingByCode(code) {
  const c = String(code || "")
    .trim()
    .toUpperCase();
  return loadMeetings().find((m) => m.code === c) || null;
}

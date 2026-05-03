const KEY = "msa-email-log-v1";
const MAX = 200;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
}

export function getEmailLog() {
  return load();
}

export function appendEmailEntry(entry) {
  const entries = [
    {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry,
    },
    ...load(),
  ];
  persist(entries);
  return entries[0];
}

export function logMeetingInvite(meeting, joinUrl) {
  const subject = `Invitation: ${meeting.title}`;
  const body = `You are invited to "${meeting.title}".\n\nJoin link: ${joinUrl}\nMeeting code: ${meeting.code}\nStarts: ${meeting.startISO}`;
  for (const to of meeting.invitees || []) {
    appendEmailEntry({
      type: "invite",
      meetingId: meeting.id,
      to,
      subject,
      body,
    });
  }
}

export function logMeetingUpdate(meeting, joinUrl, note) {
  const subject = `Updated: ${meeting.title}`;
  const body = `${note}\n\nJoin link: ${joinUrl}`;
  const list = meeting.invitees || [];
  if (!list.length) {
    appendEmailEntry({
      type: "update",
      meetingId: meeting.id,
      to: "(no-invitees)",
      subject,
      body,
    });
    return;
  }
  for (const to of list) {
    appendEmailEntry({
      type: "update",
      meetingId: meeting.id,
      to,
      subject,
      body,
    });
  }
}

export function logMeetingCancelled(meeting) {
  const subject = `Cancelled: ${meeting.title}`;
  const body = "This meeting has been cancelled.";
  const list = meeting.invitees || [];
  if (!list.length) {
    appendEmailEntry({
      type: "cancel",
      meetingId: meeting.id,
      to: "(no-invitees)",
      subject,
      body,
    });
    return;
  }
  for (const to of list) {
    appendEmailEntry({
      type: "cancel",
      meetingId: meeting.id,
      to,
      subject,
      body,
    });
  }
}

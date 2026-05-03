export function isCancelled(meeting) {
  return meeting?.status === "cancelled";
}

export function isActiveMeeting(meeting) {
  return meeting && !isCancelled(meeting);
}

/** Format instant in a specific IANA zone (for display). */
export function formatInTimeZone(iso, timeZone, options) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      timeZone: timeZone || "UTC",
      ...options,
    });
  } catch {
    return new Date(iso).toLocaleString();
  }
}

export function formatRangeTz(startISO, endISO, timeZone) {
  const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const a = formatInTimeZone(startISO, tz, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const b = formatInTimeZone(endISO, tz, { hour: "2-digit", minute: "2-digit" });
  return `${a} → ${b}`;
}

/** Curated IANA zones for selects (extend as needed). */
export const COMMON_TIME_ZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export function ensureZoneInList(tz) {
  if (!tz) return COMMON_TIME_ZONES;
  if (COMMON_TIME_ZONES.includes(tz)) return COMMON_TIME_ZONES;
  return [tz, ...COMMON_TIME_ZONES];
}

const KEY = "msa-user-settings-v1";

const defaultSettings = () => ({
  displayTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  simulateEmail: true,
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(partial) {
  const next = { ...loadSettings(), ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

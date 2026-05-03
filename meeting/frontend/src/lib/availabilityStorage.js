const KEY = "msa-personal-busy-v1";

/** @returns {Set<string>} keys "d-h" Monday=0..Sunday=6, hour 8-17 */
export function loadPersonalBusy() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function savePersonalBusy(set) {
  localStorage.setItem(KEY, JSON.stringify([...set]));
}

export function togglePersonalBusyKey(key, set) {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  savePersonalBusy(next);
  return next;
}

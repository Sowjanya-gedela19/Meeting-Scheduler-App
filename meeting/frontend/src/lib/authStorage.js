const USERS_KEY = "msa-users-v1";
const SESSION_KEY = "msa-session-v1";

function hashPassword(password) {
  let h = 0;
  const s = String(password);
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return `h${(h >>> 0).toString(16)}`;
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId: user.id, email: user.email })
  );
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function signup(email, password) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { error: "Email and password are required." };
  }
  const users = loadUsers();
  if (users.some((u) => u.email === normalized)) {
    return { error: "That email is already registered." };
  }
  const user = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setSession({ id: user.id, email: user.email });
  return { user: { id: user.id, email: user.email } };
}

export function login(email, password) {
  const normalized = email.trim().toLowerCase();
  const user = loadUsers().find((u) => u.email === normalized);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { error: "Invalid email or password." };
  }
  setSession({ id: user.id, email: user.email });
  return { user: { id: user.id, email: user.email } };
}

export function logout() {
  clearSession();
}

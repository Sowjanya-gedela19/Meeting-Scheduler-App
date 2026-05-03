import { api, setAccessToken } from "./client";

export async function registerRequest(email, password) {
  const { data } = await api.post("/auth/register", { email, password });
  setAccessToken(data.token);
  return data.user;
}

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  setAccessToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export function logoutClient() {
  setAccessToken(null);
}

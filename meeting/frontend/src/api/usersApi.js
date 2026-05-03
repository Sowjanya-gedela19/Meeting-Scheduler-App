import { api } from "./client";

export async function patchProfile(body) {
  const { data } = await api.patch("/users/me", body);
  return data.user;
}

export async function fetchEmailLogs() {
  const { data } = await api.get("/users/me/email-logs");
  return data.logs;
}

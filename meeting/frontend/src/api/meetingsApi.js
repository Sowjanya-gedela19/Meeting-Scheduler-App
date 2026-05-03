import { api } from "./client";

export async function fetchMeetings() {
  const { data } = await api.get("/meetings");
  return data.meetings;
}

export async function fetchConflicts({ startISO, endISO, excludeId }) {
  const { data } = await api.get("/meetings/conflicts", {
    params: { startISO, endISO, excludeId },
  });
  return data.conflicts;
}

export async function createMeetingRequest(body) {
  const { data } = await api.post("/meetings", body);
  return data.meeting;
}

export async function updateMeetingRequest(id, body) {
  const { data } = await api.patch(`/meetings/${id}`, body);
  return data.meeting;
}

export async function appendInviteesRequest(id, emails) {
  const { data } = await api.post(`/meetings/${id}/invitees`, { emails });
  return data.meeting;
}

export async function cancelMeetingRequest(id) {
  const { data } = await api.post(`/meetings/${id}/cancel`);
  return data.meeting;
}

export async function restoreMeetingRequest(id) {
  const { data } = await api.post(`/meetings/${id}/restore`);
  return data.meeting;
}

export async function deleteMeetingRequest(id) {
  await api.delete(`/meetings/${id}`);
}

export async function fetchPublicMeetingByCode(code) {
  const { data } = await api.get(`/public/meetings/${encodeURIComponent(code)}`);
  return data.meeting;
}

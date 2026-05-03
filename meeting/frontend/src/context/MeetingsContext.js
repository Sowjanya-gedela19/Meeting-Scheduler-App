import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as meetingsApi from "../api/meetingsApi";
import { useAuth } from "./AuthContext";

const MeetingsContext = createContext(null);

function checkDueReminders(meetings) {
  const list = meetings || [];
  const now = Date.now();
  for (const m of list) {
    if (m.status === "cancelled") continue;
    const start = new Date(m.startISO).getTime();
    const minutes = Number(m.reminderMinutesBefore) || 15;
    const fireAt = start - minutes * 60_000;
    const key = `msa-reminder-fired-${m.id}`;
    if (now >= fireAt && now < start && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(`Reminder: ${m.title}`, {
          body: `Starts at ${new Date(m.startISO).toLocaleString()}`,
        });
      }
    }
  }
}

export function MeetingsProvider({ children }) {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      setMeetings([]);
      return;
    }
    try {
      const list = await meetingsApi.fetchMeetings();
      setMeetings(list);
    } catch (e) {
      console.error(e);
      setMeetings([]);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    checkDueReminders(meetings);
    const id = window.setInterval(() => checkDueReminders(meetings), 15_000);
    return () => window.clearInterval(id);
  }, [meetings]);

  const createMeeting = useCallback(
    async (payload) => {
      const body = {
        title: payload.title,
        startISO: payload.startISO,
        durationMinutes: Number(payload.durationMinutes) || 60,
        invitees: payload.invitees || [],
        reminderMinutesBefore: Number(payload.reminderMinutesBefore) || 15,
        timeZone: payload.timeZone,
      };
      const m = await meetingsApi.createMeetingRequest(body);
      await refresh();
      return m;
    },
    [refresh]
  );

  const editMeeting = useCallback(
    async (id, patch) => {
      const m = await meetingsApi.updateMeetingRequest(id, patch);
      await refresh();
      return m;
    },
    [refresh]
  );

  const updateMeeting = useCallback(
    async (id, patch) => {
      const m = await meetingsApi.updateMeetingRequest(id, patch);
      await refresh();
      return m;
    },
    [refresh]
  );

  const addInvitees = useCallback(
    async (id, emails) => {
      const m = await meetingsApi.appendInviteesRequest(id, emails);
      await refresh();
      return m;
    },
    [refresh]
  );

  const cancelMeeting = useCallback(
    async (id) => {
      await meetingsApi.cancelMeetingRequest(id);
      await refresh();
    },
    [refresh]
  );

  const restoreMeeting = useCallback(
    async (id) => {
      await meetingsApi.restoreMeetingRequest(id);
      await refresh();
    },
    [refresh]
  );

  const removeMeeting = useCallback(
    async (id) => {
      await meetingsApi.deleteMeetingRequest(id);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      meetings,
      refresh,
      createMeeting,
      editMeeting,
      updateMeeting,
      addInvitees,
      cancelMeeting,
      restoreMeeting,
      removeMeeting,
      toast,
      showToast,
    }),
    [
      meetings,
      refresh,
      createMeeting,
      editMeeting,
      updateMeeting,
      addInvitees,
      cancelMeeting,
      restoreMeeting,
      removeMeeting,
      toast,
      showToast,
    ]
  );

  return (
    <MeetingsContext.Provider value={value}>
      {children}
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </MeetingsContext.Provider>
  );
}

export function useMeetings() {
  const ctx = useContext(MeetingsContext);
  if (!ctx) {
    throw new Error("useMeetings must be used within MeetingsProvider");
  }
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { patchProfile } from "../api/usersApi";
import { useAuth } from "./AuthContext";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const { user, refreshUser } = useAuth();

  const displayTimeZone =
    user?.displayTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const simulateEmail = user?.simulateEmail !== false;

  const setDisplayTimeZone = useCallback(
    async (tz) => {
      if (!user) return;
      await patchProfile({ displayTimeZone: tz });
      await refreshUser();
    },
    [user, refreshUser]
  );

  const setSimulateEmail = useCallback(
    async (value) => {
      if (!user) return;
      await patchProfile({ simulateEmail: Boolean(value) });
      await refreshUser();
    },
    [user, refreshUser]
  );

  const value = useMemo(
    () => ({
      displayTimeZone,
      simulateEmail,
      setDisplayTimeZone,
      setSimulateEmail,
    }),
    [displayTimeZone, simulateEmail, setDisplayTimeZone, setSimulateEmail]
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

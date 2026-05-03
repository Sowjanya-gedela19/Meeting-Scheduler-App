import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchMe,
  loginRequest,
  logoutClient,
  registerRequest,
} from "../api/authApi";
import { getAccessToken } from "../api/client";

const AuthContext = createContext(null);

function apiErrorMessage(err, fallback) {
  if (err.response?.data?.error) return err.response.data.error;
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Cannot reach the server. Start the backend API (and MongoDB), then try again.";
  }
  return fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const u = await fetchMe();
      setUser(u);
      return u;
    } catch {
      logoutClient();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) setBootstrapped(true);
        return;
      }
      try {
        const u = await fetchMe();
        if (!cancelled) setUser(u);
      } catch {
        logoutClient();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener("msa-auth-expired", onExpired);
    return () => window.removeEventListener("msa-auth-expired", onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const u = await loginRequest(email, password);
      setUser(u);
      return { user: u };
    } catch (err) {
      return { error: apiErrorMessage(err, "Login failed") };
    }
  }, []);

  const signup = useCallback(async (email, password) => {
    try {
      const u = await registerRequest(email, password);
      setUser(u);
      return { user: u };
    } catch (err) {
      return { error: apiErrorMessage(err, "Signup failed") };
    }
  }, []);

  const logout = useCallback(() => {
    logoutClient();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      bootstrapped,
      login,
      signup,
      logout,
      refreshUser,
      isAuthenticated: !!user,
    }),
    [user, bootstrapped, login, signup, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

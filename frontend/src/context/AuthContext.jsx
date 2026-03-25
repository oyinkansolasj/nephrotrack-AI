import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'nephrotrack_token';
const USER_KEY    = 'nephrotrack_user';
const LOGIN_TIME  = 'nephrotrack_login_time';
const SESSION_MAX = 8 * 60 * 60 * 1000; // 8 hours in ms

function isSessionValid() {
  const loginTime = localStorage.getItem(LOGIN_TIME);
  if (!loginTime) return false;
  return Date.now() - parseInt(loginTime, 10) < SESSION_MAX;
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LOGIN_TIME);
}

export function AuthProvider({ children }) {
  // Restore session from localStorage — only if not expired
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      if (!isSessionValid()) {
        clearSession();
        return null;
      }
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Check session expiry periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && !isSessionValid()) {
        clearSession();
        setCurrentUser(null);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // ── login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || 'Login failed' };
      }

      // Persist token + user + login time in localStorage
      localStorage.setItem(TOKEN_KEY,  data.token);
      localStorage.setItem(USER_KEY,   JSON.stringify(data.user));
      localStorage.setItem(LOGIN_TIME, String(Date.now()));
      setCurrentUser(data.user);

      return { success: true };
    } catch (err) {
      return { success: false, message: 'Could not reach the server. Is the backend running?' };
    }
  };

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    // Fire-and-forget — JWT is stateless, just clear client storage
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        fetch(`${API_BASE}/auth/logout`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* ignore network errors on logout */ }

    clearSession();
    setCurrentUser(null);
  };

  // ── helper: get stored token (used by API calls throughout the app) ────────
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


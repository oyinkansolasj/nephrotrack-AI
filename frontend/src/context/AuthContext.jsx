import { createContext, useContext, useState } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'nephrotrack_token';
const USER_KEY  = 'nephrotrack_user';

export function AuthProvider({ children }) {
  // Restore session from localStorage on page refresh
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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

      // Persist token + user in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
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

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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


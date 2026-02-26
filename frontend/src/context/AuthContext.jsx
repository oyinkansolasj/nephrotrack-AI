import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'nephrotrack_user_id';

// ─── Demo accounts (UI only — will be replaced by real API auth) ──────────────
const DEMO_USERS = {
  U001: { id: 'U001', name: 'Dr. Amara Nwosu',  email: 'amara@nephrotrack.ng',  password: 'demo123', role: 'clinician' },
  U002: { id: 'U002', name: 'Tunde Adeyemi',    email: 'tunde@nephrotrack.ng',  password: 'demo123', role: 'admin' },
  U003: { id: 'U003', name: 'Ngozi Okafor',     email: 'ngozi@nephrotrack.ng',  password: 'demo123', role: 'records_officer' },
  U004: { id: 'U004', name: 'Emeka Chukwu',     email: 'emeka@nephrotrack.ng',  password: 'demo123', role: 'billing' },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    return savedId ? (DEMO_USERS[savedId] ?? null) : null;
  });

  const login = (email, password) => {
    // TODO: Replace with real API call → POST /api/auth/login
    const user = Object.values(DEMO_USERS).find(
      (u) => u.email === email && u.password === password
    );
    if (!user) return { success: false, message: 'Invalid email or password.' };
    const { password: _, ...safeUser } = user; // strip password from state
    setCurrentUser(safeUser);
    localStorage.setItem(STORAGE_KEY, safeUser.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // TODO: Call POST /api/auth/logout to invalidate server session
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ─── Demo email hints (for the Login page quick-access buttons) ───────────────
export const DEMO_ACCOUNTS = [
  { role: 'clinician',       email: 'amara@nephrotrack.ng' },
  { role: 'admin',           email: 'tunde@nephrotrack.ng' },
  { role: 'records_officer', email: 'ngozi@nephrotrack.ng' },
  { role: 'billing',         email: 'emeka@nephrotrack.ng' },
];

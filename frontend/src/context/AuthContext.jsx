import { createContext, useContext, useState } from 'react';
import { users, demoAccounts } from '../data/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'nephrotrack_user_id';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    return savedId ? (users.find((u) => u.id === savedId) ?? null) : null;
  });

  const login = (email, password) => {
    const account = Object.values(demoAccounts).find(
      (a) => a.email === email && a.password === password
    );
    if (!account) return { success: false, message: 'Invalid email or password.' };
    const user = users.find((u) => u.id === account.userId);
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, user.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

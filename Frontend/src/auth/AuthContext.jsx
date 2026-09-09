import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_ACCOUNTS } from '../data/mock';

const STORAGE_KEY = 'urbansight.session';
const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession());

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* private mode — session simply won't persist */
    }
  }, [user]);

  /**
   * Mock sign-in. Resolves after a short delay so the loading state is real.
   * @returns {Promise<{ok:boolean, error?:string}>}
   */
  const login = useCallback((role, email, password) => {
    const account = DEMO_ACCOUNTS[role];
    return new Promise((resolve) => {
      setTimeout(() => {
        const emailOk = email.trim().toLowerCase() === account.email;
        const passOk = password === account.password;
        if (!emailOk && !passOk) {
          resolve({ ok: false, error: 'We could not find an account with those credentials.' });
        } else if (!emailOk) {
          resolve({ ok: false, error: `No ${role === 'admin' ? 'authority' : 'citizen'} account matches that email address.` });
        } else if (!passOk) {
          resolve({ ok: false, error: 'Incorrect password. Please try again.' });
        } else {
          const { password: _pw, ...safe } = account;
          setUser(safe);
          resolve({ ok: true });
        }
      }, 650);
    });
  }, []);

  /** One-click sign-in used by the demo view switch. */
  const loginAs = useCallback((role) => {
    const { password: _pw, ...safe } = DEMO_ACCOUNTS[role];
    setUser(safe);
    return safe;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, login, loginAs, logout, isAdmin: user?.role === 'admin', isCitizen: user?.role === 'citizen' }),
    [user, login, loginAs, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_ACCOUNTS } from '../data/mock';

const STORAGE_KEY = 'urbansight.session';
const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && (parsed.name?.includes('Bhuvaneswari') || parsed.initials === 'KB')) {
      parsed.name = 'City Administrator';
      parsed.initials = 'AD';
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch { /* ignore */ }
    }
    return parsed;
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
  const login = useCallback((role, email = '', password = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const base = DEMO_ACCOUNTS[role] || (role === 'admin' ? DEMO_ACCOUNTS.admin : DEMO_ACCOUNTS.citizen);
        let name = base.name;
        let initials = base.initials;
        const cleanEmail = email.trim();
        if (cleanEmail) {
          const prefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          if (prefix.trim()) {
            name = prefix.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            initials = prefix.split(' ').filter(Boolean).map((w) => w[0].toUpperCase()).slice(0, 2).join('') || 'US';
          }
        }
        const userObj = {
          ...base,
          role,
          email: cleanEmail || base.email,
          name: name || base.name,
          initials: initials || base.initials,
        };
        setUser(userObj);
        resolve({ ok: true });
      }, 200);
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

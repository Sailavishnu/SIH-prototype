import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cx } from '../../lib/format';
import { IconShield, IconUser } from '../../lib/icons';

/**
 * Demo-only switch between the two experiences.
 * It signs into the matching demo account so the guarded routes still apply —
 * the real /login and /admin/login screens keep working unchanged.
 */
export default function ViewSwitch({ compact = false }) {
  const { user, loginAs } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = pathname.startsWith('/admin') ? 'admin' : 'citizen';

  const go = (role) => {
    if (role === current) return;
    if (!user || user.role !== role) loginAs(role);
    navigate(role === 'admin' ? '/admin' : '/app');
  };

  return (
    <div className="view-switch" role="group" aria-label="Switch experience" title="Demo switch — jumps between the citizen and authority experiences">
      <button className={cx(current === 'citizen' && 'active')} onClick={() => go('citizen')} aria-pressed={current === 'citizen'}>
        <IconUser size={14} />
        {!compact && 'Citizen'}
      </button>
      <button className={cx(current === 'admin' && 'active')} onClick={() => go('admin')} aria-pressed={current === 'admin'}>
        <IconShield size={14} />
        {!compact && 'Admin'}
      </button>
    </div>
  );
}

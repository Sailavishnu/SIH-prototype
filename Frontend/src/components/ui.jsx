/* ============================================================
   Shared UI kit — hand-built, no component library.
   Every screen composes from exactly these pieces.
   ============================================================ */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cx, formatDateTime, formatNumber, timeAgo } from '../lib/format';
import { STATUSES, SEVERITIES, PRIORITIES } from '../data/mock';
import {
  IconArrowDown, IconArrowUp, IconCamera, IconCheck, IconChevronLeft, IconChevronRight,
  IconInbox, IconSearch, IconSparkle, IconX, IconAlert, IconMinus,
} from '../lib/icons';

/* ---------------- Card ---------------- */
export function Card({ children, className, interactive, selected, as: Tag = 'div', ...rest }) {
  return (
    <Tag className={cx('card', interactive && 'interactive', selected && 'selected', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHead({ title, subtitle, action, icon }) {
  return (
    <div className="card-head">
      <div className="row g12" style={{ minWidth: 0 }}>
        {icon && <span style={{ color: 'var(--text-3)', display: 'flex' }}>{icon}</span>}
        <div style={{ minWidth: 0 }}>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="meta" style={{ marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ children, action, sub }) {
  return (
    <div className="between" style={{ marginBottom: 12 }}>
      <div>
        <h2 className="section-title">{children}</h2>
        {sub && <p className="meta" style={{ marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Badges ---------------- */
export function Badge({ tone = 'neutral', children, dot = false, className, ...rest }) {
  return (
    <span className={cx('badge', `badge-${tone}`, className)} {...rest}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export const StatusBadge = ({ status }) => {
  const s = STATUSES[status] || { label: status, tone: 'neutral' };
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
};

export const SeverityBadge = ({ severity }) => {
  const s = SEVERITIES[severity] || { label: severity, tone: 'neutral' };
  return <Badge tone={s.tone}>{s.label}</Badge>;
};

export const PriorityBadge = ({ priority }) => {
  const p = PRIORITIES[priority] || { label: priority, tone: 'neutral' };
  return <Badge tone={p.tone}>{p.label}</Badge>;
};

export const CategoryDot = ({ color, size = 8 }) => (
  <span style={{ width: size, height: size, borderRadius: '50%', background: color, flex: 'none', display: 'inline-block' }} />
);

/** The consistent AI marker used everywhere model output appears. */
export function AiTag({ children = 'AI DETECTED', confidence, icon = true }) {
  return (
    <span className="ai-tag">
      {icon && <IconSparkle size={12} sw={2} />}
      {children}
      {confidence !== undefined && <span style={{ opacity: 0.75 }}>· {confidence}%</span>}
    </span>
  );
}

export function ConfidenceBar({ value, label = 'AI confidence' }) {
  const tone = value >= 90 ? 'var(--success)' : value >= 80 ? 'var(--ai)' : 'var(--warning)';
  return (
    <div className="stack g8">
      <div className="between">
        <span className="meta">{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700 }} className="mono">{value}%</span>
      </div>
      <div className="meter"><span style={{ width: `${value}%`, background: tone }} /></div>
    </div>
  );
}

export function TrendPill({ value, invert = false, suffix = '%' }) {
  if (value === 0 || value === undefined || value === null) {
    return <span className="trend flat"><IconMinus size={13} sw={2.4} />0{suffix}</span>;
  }
  const rising = value > 0;
  // for defect counts, "up" is bad; invert for metrics where up is good
  const good = invert ? rising : !rising;
  return (
    <span className={cx('trend', good ? 'down' : 'up')}>
      {rising ? <IconArrowUp size={13} sw={2.4} /> : <IconArrowDown size={13} sw={2.4} />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

/* ---------------- KPI ---------------- */
export function KpiCard({ label, value, sub, delta, deltaInvert, deltaSuffix, icon, tone = 'brand', onClick }) {
  const toneColor = {
    brand: 'var(--brand)', ai: 'var(--ai)', success: 'var(--success)',
    warning: 'var(--warning)', critical: 'var(--critical)', neutral: 'var(--text-3)',
  }[tone];
  return (
    <Card className="card-pad" interactive={!!onClick} onClick={onClick} as={onClick ? 'button' : 'div'}
      style={onClick ? { textAlign: 'left', width: '100%', font: 'inherit' } : undefined}>
      <div className="between" style={{ marginBottom: 10 }}>
        <span className="eyebrow">{label}</span>
        {icon && (
          <span style={{ width: 30, height: 30, borderRadius: 8, display: 'grid', placeItems: 'center', background: `color-mix(in srgb, ${toneColor} 12%, #fff)`, color: toneColor }}>
            {icon}
          </span>
        )}
      </div>
      <div className="metric">{typeof value === 'number' ? formatNumber(value) : value}</div>
      <div className="row g8" style={{ marginTop: 6 }}>
        {delta !== undefined && <TrendPill value={delta} invert={deltaInvert} suffix={deltaSuffix ?? '%'} />}
        {sub && <span className="meta">{sub}</span>}
      </div>
    </Card>
  );
}

/* ---------------- Chips ---------------- */
export function Chip({ active, onClick, color, count, children }) {
  return (
    <button type="button" className={cx('chip', active && 'active')} onClick={onClick} aria-pressed={!!active}>
      {color && <span className="chip-dot" style={{ background: active ? '#fff' : color }} />}
      {children}
      {count !== undefined && <span className="chip-count">{count}</span>}
    </button>
  );
}

export const ChipRow = ({ children }) => <div className="row wrap g8">{children}</div>;

/* ---------------- Tabs / segmented ---------------- */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} role="tab" aria-selected={value === t.key}
          className={cx('tab', value === t.key && 'active')} onClick={() => onChange(t.key)}>
          {t.label}
          {t.count !== undefined && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ options, value, onChange, size }) {
  return (
    <div className="segmented" style={size === 'sm' ? { padding: 2 } : undefined}>
      {options.map((o) => (
        <button key={o.key} type="button" className={cx(value === o.key && 'active')} onClick={() => onChange(o.key)}>
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Inputs ---------------- */
export function Field({ label, hint, children, required }) {
  return (
    <label className="field">
      {label && (
        <span className="label">
          {label}
          {required && <span style={{ color: 'var(--critical)' }}> *</span>}
        </span>
      )}
      {children}
      {hint && <span className="meta">{hint}</span>}
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', style }) {
  return (
    <div className="search" style={style}>
      <IconSearch size={16} />
      <input className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Select({ value, onChange, options, style, ariaLabel }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)} style={style} aria-label={ariaLabel}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/* ---------------- States ---------------- */
export const Skeleton = ({ w = '100%', h = 14, r, style }) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />
);

export function SkeletonCard({ lines = 3 }) {
  return (
    <Card className="card-pad stack g12">
      <Skeleton w="40%" h={12} />
      <Skeleton w="70%" h={24} />
      {Array.from({ length: lines }).map((_, i) => <Skeleton key={i} w={`${90 - i * 14}%`} h={10} />)}
    </Card>
  );
}

export function SkeletonRows({ rows = 6 }) {
  return (
    <div className="stack">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="row g16" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Skeleton w={70} h={12} />
          <Skeleton w="24%" h={12} />
          <Skeleton w="16%" h={12} />
          <Skeleton w={70} h={20} r={999} />
          <div className="grow" />
          <Skeleton w={54} h={12} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, icon, action }) {
  return (
    <div className="state">
      <span className="state-icon">{icon || <IconInbox size={20} />}</span>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state">
      <span className="state-icon" style={{ background: 'var(--critical-soft)', color: 'var(--critical)' }}>
        <IconAlert size={20} />
      </span>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

/** Fakes an initial fetch so loading skeletons are visible, once per mount. */
export function useMockLoading(ms = 480) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/* ---------------- Evidence photo placeholder ---------------- */
export function Photo({ height = 200, label = 'Camera evidence frame', tag, tagRight, bbox, plate, caption, style }) {
  return (
    <div className="photo" style={{ height, ...style }}>
      <div className="photo-label">
        <IconCamera size={22} />
        <span>{label}</span>
        {caption && <span className="meta" style={{ fontSize: 11 }}>{caption}</span>}
      </div>
      {tag && <div className="photo-tag">{tag}</div>}
      {tagRight && <div className="photo-tag-r">{tagRight}</div>}
      {bbox && (
        <div className="bbox" style={{ left: bbox.x, top: bbox.y, width: bbox.w, height: bbox.h }}>
          <span>{bbox.label}</span>
        </div>
      )}
      {plate && (
        <div style={{
          position: 'absolute', zIndex: 3, bottom: 14, left: '50%', transform: 'translateX(-50%)',
          background: '#fff', border: '2px solid var(--ai)', borderRadius: 6, padding: '5px 14px',
          fontWeight: 800, letterSpacing: '0.06em', fontSize: 15, boxShadow: 'var(--sh-md)',
        }}>
          {plate}
        </div>
      )}
    </div>
  );
}

/* ---------------- Drawer ---------------- */
export function Drawer({ open, onClose, title, subtitle, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} style={width ? { width } : undefined}>
        <div className="drawer-head">
          <div style={{ minWidth: 0 }}>
            <h3 className="card-title">{title}</h3>
            {subtitle && <p className="meta" style={{ marginTop: 2 }}>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close panel"><IconX size={18} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </>
  );
}

/* ---------------- Key/value ---------------- */
export function KeyValue({ items }) {
  return (
    <dl className="kv">
      {items.filter(Boolean).map((it) => (
        <React.Fragment key={it.label}>
          <dt>{it.label}</dt>
          <dd>{it.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/* ---------------- Timeline / stepper ---------------- */
export function StatusTimeline({ steps }) {
  return (
    <div className="timeline">
      {steps.map((s) => (
        <div key={s.key} className={cx('tl-item', s.done && 'done', s.current && 'current', !s.done && !s.current && 'pending')}>
          <span className="tl-dot">{s.done && <IconCheck size={10} sw={3} />}</span>
          <h5>{s.label}</h5>
          <p className="meta" style={{ marginTop: 2 }}>{s.at ? formatDateTime(s.at) : 'Pending'}</p>
          {(s.done || s.current) && s.note && <p className="body" style={{ marginTop: 4, fontSize: 13 }}>{s.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function Stepper({ steps, activeIndex }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.key} className={cx('step', i < activeIndex && 'done', i === activeIndex && 'current')}>
          <span className="step-dot">{i < activeIndex ? <IconCheck size={13} sw={3} /> : i + 1}</span>
          <span className="step-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Data table ---------------- */
export function DataTable({
  columns, rows, rowKey = (r) => r.id, onRowClick, activeKey,
  pageSize = 10, initialSort, empty, loading, footerNote,
}) {
  const [sort, setSort] = useState(initialSort || { key: null, dir: 'desc' });
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [rows.length, sort.key, sort.dir]);

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const get = col?.sortValue || ((r) => r[sort.key]);
    return [...rows].sort((a, b) => {
      const av = get(a); const bv = get(b);
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sort.dir === 'asc' ? res : -res;
    });
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const view = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));

  if (loading) return <SkeletonRows rows={pageSize > 8 ? 8 : pageSize} />;
  if (!rows.length) return empty || <EmptyState title="No matching records" message="Try widening the filters or clearing the search." />;

  const pages = [];
  const span = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= current - span && i <= current + span)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cx(c.sortable !== false && 'sortable')}
                  style={{ textAlign: c.align || 'left', width: c.width }}
                  onClick={c.sortable !== false ? () => toggleSort(c.key) : undefined}>
                  <span className="th-in">
                    {c.label}
                    {sort.key === c.key && (sort.dir === 'asc' ? <IconArrowUp size={12} sw={2.6} /> : <IconArrowDown size={12} sw={2.6} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={rowKey(r)}
                className={cx(onRowClick && 'clickable', activeKey === rowKey(r) && 'active')}
                onClick={onRowClick ? () => onRowClick(r) : undefined}>
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align || 'left' }}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span className="meta">
          {footerNote || `Showing ${(current - 1) * pageSize + 1}–${Math.min(current * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <div className="row g4">
          <button className="page-btn" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
            <IconChevronLeft size={14} />
          </button>
          {pages.map((p, i) =>
            p === '…'
              ? <span key={`gap${i}`} className="meta" style={{ padding: '0 4px' }}>…</span>
              : <button key={p} className={cx('page-btn', p === current && 'active')} onClick={() => setPage(p)}>{p}</button>,
          )}
          <button className="page-btn" disabled={current === totalPages} onClick={() => setPage(current + 1)} aria-label="Next page">
            <IconChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, tone = 'default') => {
    setToast({ message, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span style={{ color: toast.tone === 'error' ? 'var(--critical)' : 'var(--ai)', display: 'flex' }}>
            {toast.tone === 'error' ? <IconAlert size={16} /> : <IconCheck size={16} sw={2.6} />}
          </span>
          {toast.message}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ---------------- Activity row ---------------- */
export function ActivityItem({ item }) {
  const tone = { critical: 'var(--critical)', success: 'var(--success)', warning: 'var(--warning)', info: 'var(--brand)' }[item.tone];
  return (
    <li className="row g12" style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone, marginTop: 6, flex: 'none' }} />
      <div className="grow">
        <p style={{ fontSize: 14, fontWeight: 500 }}>{item.text}</p>
        <p className="meta" style={{ marginTop: 2 }}>{item.meta}</p>
      </div>
      <span className="meta" style={{ whiteSpace: 'nowrap' }}>{timeAgo(item.at)}</span>
    </li>
  );
}

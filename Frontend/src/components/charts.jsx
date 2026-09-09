/* ============================================================
   Shared Recharts styling — one look for every chart in the app.
   ============================================================ */
import React from 'react';
import { formatNumber } from '../lib/format';

export const CHART = {
  grid: '#EAECF0',
  axis: '#98A2B3',
  brand: '#155EEF',
  brandDark: '#0B3B8C',
  ai: '#14B8A6',
  success: '#12B76A',
  warning: '#F79009',
  critical: '#F04438',
  violet: '#7A5AF8',
  muted: '#D7DBE0',
};

/** Categorical series colours — distinct in order, safe on white. */
export const SERIES = ['#155EEF', '#14B8A6', '#F79009', '#7A5AF8', '#12B76A', '#EE46BC', '#0BA5EC', '#98A2B3'];

export const axisProps = {
  stroke: CHART.axis,
  tick: { fill: CHART.axis, fontSize: 11.5 },
  tickLine: false,
  axisLine: { stroke: CHART.grid },
};

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: '0',
  vertical: false,
};

/** Consistent tooltip card — matches the surface/border tokens. */
export function ChartTooltip({ active, payload, label, unit = '', labelFormatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #EAECF0',
        borderRadius: 8,
        boxShadow: '0 4px 10px rgba(16,24,40,.08)',
        padding: '9px 12px',
        fontSize: 12.5,
        minWidth: 120,
      }}
    >
      <div style={{ fontWeight: 600, color: '#101828', marginBottom: 6 }}>
        {labelFormatter ? labelFormatter(label) : label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey ?? p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475467', marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill, flex: 'none' }} />
          <span style={{ flex: 1 }}>{p.name}</span>
          <strong style={{ color: '#101828', fontVariantNumeric: 'tabular-nums' }}>
            {typeof p.value === 'number' ? formatNumber(p.value) : p.value}{unit}
          </strong>
        </div>
      ))}
    </div>
  );
}

/** Legend rendered as our own pill row rather than the Recharts default. */
export function ChartLegend({ items }) {
  return (
    <div className="row wrap g16" style={{ gap: 16, marginTop: 8 }}>
      {items.map((it) => (
        <span key={it.label} className="row g8" style={{ fontSize: 12.5, color: 'var(--text-2)' }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: it.color }} />
          {it.label}
          {it.value !== undefined && <strong className="mono" style={{ color: 'var(--text)' }}>{it.value}</strong>}
        </span>
      ))}
    </div>
  );
}

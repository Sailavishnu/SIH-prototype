import React, { useMemo, useState } from 'react';
import { IssueMarkers, MapCanvas, useCategoryLegend } from '../../components/maps';
import { Badge, Card, CardHead, Chip, ChipRow, TrendPill, useMockLoading } from '../../components/ui';
import { useAdminFilters } from '../../components/layout/AdminLayout';
import { useOverrides } from '../../data/overrides';
import { CATEGORIES, affectedZones, aiInsights, infraCards, issues, repeatedLocations } from '../../data/mock';
import { formatNumber, timeAgo } from '../../lib/format';
import { IconSparkle, IconRoad, IconRefresh } from '../../lib/icons';

export default function Infrastructure() {
  const f = useAdminFilters();
  const loading = useMockLoading(400);
  const { withIssues } = useOverrides();
  const [focus, setFocus] = useState('all');

  const infra = useMemo(
    () => withIssues(f.apply(issues)).filter((i) => i.group === 'road' || i.group === 'infrastructure'),
    [f, withIssues],
  );

  const mapped = useMemo(
    () => (focus === 'all' ? infra : infra.filter((i) => i.category === focus)),
    [infra, focus],
  );
  const legend = useCategoryLegend(mapped);

  return (
    <div className="admin-page stack g16">
      {/* asset category cards */}
      <div className="grid-6">
        {infraCards.map((c) => (
          <Card key={c.key} className="card-pad interactive"
            style={{ cursor: 'pointer', borderColor: focus === c.key ? c.color : undefined }}
            onClick={() => setFocus(focus === c.key ? 'all' : c.key)}>
            <div className="row g8" style={{ marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flex: 'none' }} />
              <span className="eyebrow" style={{ fontSize: 10 }}>{c.label}</span>
            </div>
            <div className="metric" style={{ fontSize: 26 }}>{loading ? '—' : formatNumber(c.value)}</div>
            <div className="row g8" style={{ marginTop: 6 }}>
              <TrendPill value={c.delta} />
              <span className="meta">{c.open} open</span>
            </div>
          </Card>
        ))}
      </div>

      {/* AI insight */}
      <div className="callout">
        <span className="callout-icon"><IconSparkle size={17} /></span>
        <div>
          <div className="row g8" style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 14 }}>AI insight</strong>
            <Badge tone="ai">Generated from 30-day window</Badge>
          </div>
          <p className="body" style={{ lineHeight: 1.6, color: 'var(--text)' }}>{aiInsights[0]}</p>
        </div>
      </div>

      {/* map + rankings */}
      <div className="split-2">
        <Card>
          <CardHead
            title="Infrastructure defect map"
            subtitle={`${mapped.length} defect${mapped.length === 1 ? '' : 's'} in the selected period`}
            action={focus !== 'all' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFocus('all')}>
                <IconRefresh size={14} /> Clear focus
              </button>
            )}
          />
          <div style={{ padding: '12px 20px 0' }}>
            <ChipRow>
              <Chip active={focus === 'all'} onClick={() => setFocus('all')}>All defects</Chip>
              {infraCards.map((c) => (
                <Chip key={c.key} active={focus === c.key} color={c.color} onClick={() => setFocus(c.key)} count={c.value}>
                  {CATEGORIES[c.key].short}
                </Chip>
              ))}
            </ChipRow>
          </div>
          <div style={{ padding: 20 }}>
            <MapCanvas height={420} zoom={11} legend={legend}>
              <IssueMarkers issues={mapped} />
            </MapCanvas>
          </div>
        </Card>

        <div className="stack g16">
          <Card>
            <CardHead title="Most affected zones" subtitle="Share of all infrastructure defects" icon={<IconRoad size={18} />} />
            <ul className="rank-list">
              {affectedZones.map((z, i) => (
                <li key={z.name}>
                  <span className="rank-num">{i + 1}</span>
                  <span className="grow stack" style={{ gap: 3 }}>
                    <span style={{ fontWeight: 500 }}>{z.name}</span>
                    <span className="meter" style={{ maxWidth: 160 }}>
                      <span style={{ width: `${(z.value / affectedZones[0].value) * 100}%` }} />
                    </span>
                  </span>
                  <span className="stack" style={{ alignItems: 'flex-end', gap: 1 }}>
                    <strong className="mono">{z.value}</strong>
                    <span className="meta">{z.share}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHead title="Repeated issue locations" subtitle="Same defect detected again after closure" />
            <ul className="rank-list">
              {repeatedLocations.map((r) => (
                <li key={`${r.area}-${r.road}`}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIES[r.category].color, flex: 'none' }} />
                  <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{r.road}</span>
                    <span className="meta">{r.area} · {CATEGORIES[r.category].short} · last {timeAgo(r.lastSeen)}</span>
                  </span>
                  <Badge tone={r.count >= 7 ? 'critical' : 'warning'}>{r.count}×</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="card-pad stack g12">
            <span className="eyebrow">More insights</span>
            {aiInsights.slice(1).map((t) => (
              <p key={t} className="body" style={{ fontSize: 13.5, lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid var(--ai)' }}>
                {t}
              </p>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

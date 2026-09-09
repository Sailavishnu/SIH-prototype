import React, { useMemo, useState } from 'react';
import {
  Badge, Card, CardHead, EmptyState, Field, KeyValue, StatusBadge, useToast,
} from '../../components/ui';
import { useOverrides } from '../../data/overrides';
import { CATEGORIES, departments, issues } from '../../data/mock';
import { formatDate } from '../../lib/format';
import {
  IconUsers, IconRoad, IconTraffic, IconBuilding, IconWater, IconShield,
  IconCheckCircle, IconInbox,
} from '../../lib/icons';

const DEPT_ICON = {
  road: IconRoad,
  traffic: IconTraffic,
  municipal: IconBuilding,
  water: IconWater,
  safety: IconShield,
};

export default function Teams() {
  const toast = useToast();
  const { withIssues, setDepartment, setStatus } = useOverrides();

  const all = useMemo(() => withIssues(issues), [withIssues]);

  const queue = useMemo(
    () => all.filter((i) => ['open', 'verified'].includes(i.status)).slice(0, 40),
    [all],
  );

  const [issueId, setIssueId] = useState('');
  const [deptName, setDeptName] = useState(departments[0].name);

  const selected = all.find((i) => i.id === issueId) || null;

  const stats = useMemo(
    () =>
      departments.map((d) => {
        const mine = all.filter((i) => i.department === d.name);
        return {
          ...d,
          active: mine.filter((i) => i.status !== 'resolved').length,
          resolved: mine.filter((i) => i.status === 'resolved').length,
          total: mine.length,
        };
      }),
    [all],
  );

  const confirm = () => {
    if (!selected) return;
    setDepartment(selected.id, deptName);
    setStatus(selected.id, 'assigned');
    toast(`${selected.id} assigned to ${deptName}`);
    setIssueId('');
  };

  return (
    <div className="admin-page stack g16">
      {/* department cards */}
      <div className="grid-3">
        {stats.map((d) => {
          const Icon = DEPT_ICON[d.key];
          const load = d.total ? Math.round((d.active / d.total) * 100) : 0;
          return (
            <Card key={d.key} className="dept-card">
              <div className="between">
                <span className="dept-ic" style={{ background: d.color }}><Icon size={20} /></span>
                <Badge tone={d.active > 18 ? 'critical' : d.active > 10 ? 'warning' : 'success'}>
                  {d.active} active
                </Badge>
              </div>

              <div>
                <h3 className="card-title">{d.name}</h3>
                <p className="meta" style={{ marginTop: 2 }}>{d.head} · {d.crews} field crews</p>
              </div>

              <div className="stack g8">
                <div className="between">
                  <span className="meta">Open workload</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{load}%</span>
                </div>
                <div className="meter">
                  <span style={{ width: `${load}%`, background: load > 60 ? 'var(--critical)' : load > 35 ? 'var(--warning)' : 'var(--success)' }} />
                </div>
              </div>

              <div className="row g16" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <Metric label="Total" value={d.total} />
                <Metric label="Resolved" value={d.resolved} />
                <Metric label="SLA met" value={`${d.slaPct}%`} />
              </div>

              <div className="row wrap g4" style={{ gap: 4 }}>
                {d.categories.map((c) => (
                  <Badge key={c} tone="neutral" style={{ background: `${CATEGORIES[c].color}14`, color: CATEGORIES[c].color }}>
                    {CATEGORIES[c].short}
                  </Badge>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* assignment */}
      <div className="split-2">
        <Card>
          <CardHead
            title="Unassigned queue"
            subtitle={`${queue.length} report${queue.length === 1 ? '' : 's'} waiting to be routed`}
            icon={<IconInbox size={18} />}
          />
          {queue.length === 0 ? (
            <EmptyState title="Queue is clear" message="Every open report has been routed to a department." />
          ) : (
            <ul className="rank-list scroll-y" style={{ maxHeight: 420 }}>
              {queue.map((i) => (
                <li key={i.id} style={{ cursor: 'pointer', background: issueId === i.id ? 'var(--brand-soft)' : undefined }}
                  onClick={() => { setIssueId(i.id); setDeptName(i.department); }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: i.color, flex: 'none' }} />
                  <span className="grow stack" style={{ gap: 2, minWidth: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.title}
                    </span>
                    <span className="meta">{i.id} · {i.area} · {formatDate(i.detectedAt)}</span>
                  </span>
                  <Badge tone={i.severity === 'critical' ? 'critical' : i.severity === 'high' ? 'warning' : 'neutral'}>
                    {i.priority}
                  </Badge>
                  <StatusBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHead title="Assign to a department" icon={<IconUsers size={18} />} />
          <div className="card-body stack g16">
            <Field label="Report" hint="Pick a row from the queue, or choose one here.">
              <select className="select" value={issueId} onChange={(e) => setIssueId(e.target.value)}>
                <option value="">Select a report…</option>
                {queue.map((i) => (
                  <option key={i.id} value={i.id}>{i.id} — {i.title} ({i.area})</option>
                ))}
              </select>
            </Field>

            <Field label="Department">
              <select className="select" value={deptName} onChange={(e) => setDeptName(e.target.value)}>
                {departments.map((d) => <option key={d.key} value={d.name}>{d.name}</option>)}
              </select>
            </Field>

            {selected ? (
              <div style={{ padding: '14px 16px', background: 'var(--surface-sunken)', borderRadius: 'var(--r-md)' }}>
                <KeyValue
                  items={[
                    { label: 'Report', value: <span className="mono">{selected.id}</span> },
                    { label: 'Issue', value: selected.title },
                    { label: 'Category', value: selected.categoryLabel },
                    { label: 'Location', value: `${selected.road}, ${selected.area}` },
                    { label: 'Priority', value: selected.priority },
                    { label: 'Current owner', value: selected.department },
                    { label: 'New owner', value: <strong style={{ color: 'var(--brand)' }}>{deptName}</strong> },
                  ]}
                />
              </div>
            ) : (
              <p className="meta">Select a report to see what will be assigned.</p>
            )}

            <button className="btn btn-primary btn-block" disabled={!selected} onClick={confirm}>
              <IconCheckCircle size={16} /> Confirm assignment
            </button>
            <p className="meta" style={{ textAlign: 'center' }}>
              The report moves to “Assigned” and appears in that department&apos;s workload.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <span className="stack" style={{ gap: 1 }}>
      <span className="meta">{label}</span>
      <strong className="mono" style={{ fontSize: 15 }}>{value}</strong>
    </span>
  );
}

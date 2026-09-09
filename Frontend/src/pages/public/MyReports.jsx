import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IssueCard from '../../components/IssueCard';
import { Card, EmptyState, KpiCard, Skeleton, Tabs, useMockLoading } from '../../components/ui';
import { useLocalReports } from '../../data/localReports';
import { issues } from '../../data/mock';
import {
  IconInbox, IconPen, IconCheckCircle, IconClock, IconAlert, IconSearch,
} from '../../lib/icons';

export default function MyReports() {
  const navigate = useNavigate();
  const loading = useMockLoading(380);
  const { reports: local } = useLocalReports();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  const allReports = useMemo(
    () => [...local, ...issues.filter((i) => i.mine)].sort((a, b) => b.detectedAt - a.detectedAt),
    [local],
  );

  const stats = useMemo(() => {
    const total = allReports.length;
    const active = allReports.filter((i) => i.status !== 'resolved').length;
    const resolved = allReports.filter((i) => i.status === 'resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { total, active, resolved, rate };
  }, [allReports]);

  const filtered = useMemo(() => {
    let list = allReports;
    if (tab === 'active') list = list.filter((i) => i.status !== 'resolved');
    else if (tab === 'resolved') list = list.filter((i) => i.status === 'resolved');

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (i) =>
          `${i.id} ${i.title || ''} ${i.area || ''} ${i.road || ''} ${i.categoryLabel || ''}`
            .toLowerCase()
            .includes(q),
      );
    }
    return list;
  }, [allReports, tab, query]);

  return (
    <div className="public-page stack g20" style={{ padding: '24px 32px' }}>
      {/* Header */}
      <div className="between wrap g16">
        <div>
          <h1 className="page-title">Reports Dashboard & History</h1>
          <p className="body" style={{ marginTop: 4 }}>
            Track your submitted civic issues, live field crew progress, and resolved history.
          </p>
        </div>
        <Link to="/app/report" className="btn btn-primary btn-md">
          <IconPen size={16} /> Report an Issue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid-4">
        <KpiCard
          label="Total Submitted"
          value={stats.total}
          icon={<IconInbox size={16} />}
          tone="brand"
          sub="All citizen reports filed"
        />
        <KpiCard
          label="Active & In Progress"
          value={stats.active}
          icon={<IconClock size={16} />}
          tone="warning"
          sub="Under department review"
        />
        <KpiCard
          label="Resolved"
          value={stats.resolved}
          icon={<IconCheckCircle size={16} />}
          tone="success"
          sub="Verified road repairs"
        />
        <KpiCard
          label="Resolution Rate"
          value={`${stats.rate}%`}
          icon={<IconAlert size={16} />}
          tone="ai"
          sub="Closure efficiency"
        />
      </div>

      {/* Reports Content Card */}
      <Card>
        <div
          className="between wrap g12"
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { key: 'all', label: 'All Reports', count: stats.total },
              { key: 'active', label: 'Active', count: stats.active },
              { key: 'resolved', label: 'Resolved', count: stats.resolved },
            ]}
          />

          <div className="search" style={{ width: 220 }}>
            <IconSearch size={14} />
            <input
              className="input"
              style={{ height: 34, fontSize: 13 }}
              placeholder="Search your reports…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card-body stack g12">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="row g12" style={{ padding: 12 }}>
                <Skeleton w={56} h={56} r={8} />
                <div className="stack g8 grow">
                  <Skeleton w="35%" h={10} />
                  <Skeleton w="70%" h={14} />
                  <Skeleton w="50%" h={10} />
                </div>
              </div>
            ))}

          {!loading && filtered.length === 0 && (
            <EmptyState
              icon={<IconInbox size={20} />}
              title={
                query
                  ? 'No reports match your search'
                  : tab === 'active'
                  ? 'No active reports right now'
                  : tab === 'resolved'
                  ? 'No resolved reports yet'
                  : 'No reports submitted yet'
              }
              message={
                tab === 'active'
                  ? 'When you report a road defect or civic issue, its live progress will show here.'
                  : 'Resolved reports will appear here once verified by the control room.'
              }
              action={
                <Link to="/app/report" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                  Report an issue
                </Link>
              }
            />
          )}

          {!loading &&
            filtered.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                showDistance={false}
                onClick={() => navigate(`/app/issue/${issue.id}`)}
              />
            ))}
        </div>
      </Card>
    </div>
  );
}

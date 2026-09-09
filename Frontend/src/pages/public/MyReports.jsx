import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IssueCard from '../../components/IssueCard';
import { Card, EmptyState, Skeleton, Tabs, useMockLoading } from '../../components/ui';
import { useLocalReports } from '../../data/localReports';
import { issues } from '../../data/mock';
import { IconInbox, IconPen } from '../../lib/icons';

export default function MyReports() {
  const navigate = useNavigate();
  const loading = useMockLoading(420);
  const { reports: local } = useLocalReports();
  const [tab, setTab] = useState('active');

  const all = useMemo(
    () => [...local, ...issues.filter((i) => i.mine)].sort((a, b) => b.detectedAt - a.detectedAt),
    [local],
  );

  const active = all.filter((i) => i.status !== 'resolved');
  const resolved = all.filter((i) => i.status === 'resolved');
  const list = tab === 'active' ? active : resolved;

  return (
    <div className="public-page">
      <div className="between wrap g16" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">My reports</h1>
          <p className="body" style={{ marginTop: 4 }}>
            Everything you have reported, and where each one has reached.
          </p>
        </div>
        <Link to="/app/report" className="btn btn-primary">
          <IconPen size={16} /> Report an Issue
        </Link>
      </div>

      <Card>
        <div style={{ padding: '0 20px' }}>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { key: 'active', label: 'Active', count: active.length },
              { key: 'resolved', label: 'Resolved', count: resolved.length },
            ]}
          />
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

          {!loading && list.length === 0 && (
            <EmptyState
              icon={<IconInbox size={20} />}
              title={tab === 'active' ? 'No active reports' : 'Nothing resolved yet'}
              message={
                tab === 'active'
                  ? 'When you report an issue it will appear here so you can follow it through to repair.'
                  : 'Reports move here once the responsible department closes them.'
              }
              action={
                tab === 'active' ? (
                  <Link to="/app/report" className="btn btn-primary btn-sm" style={{ marginTop: 6 }}>
                    Report an issue
                  </Link>
                ) : null
              }
            />
          )}

          {!loading &&
            list.map((issue) => (
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

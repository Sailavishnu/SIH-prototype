import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCanvas, IssueMarkers, Recenter, useCategoryLegend } from '../../components/maps';
import IssueCard from '../../components/IssueCard';
import { Chip, ChipRow, EmptyState, SearchInput, Skeleton, useMockLoading } from '../../components/ui';
import { CITY, GROUPS, issues } from '../../data/mock';
import { IconMap, IconLocate } from '../../lib/icons';

export default function CityMap() {
  const navigate = useNavigate();
  const loading = useMockLoading(500);
  const [group, setGroup] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues
      .filter((i) => (group === 'all' ? true : i.group === group))
      .filter((i) => (!q ? true : `${i.title} ${i.area} ${i.road} ${i.categoryLabel}`.toLowerCase().includes(q)))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [group, query]);

  const legend = useCategoryLegend(visible);
  const counts = useMemo(() => {
    const map = { all: issues.length };
    GROUPS.slice(1).forEach((g) => { map[g.key] = issues.filter((i) => i.group === g.key).length; });
    return map;
  }, []);

  const open = (issue) => navigate(`/app/issue/${issue.id}`);

  return (
    <div className="public-page flush" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* filter bar */}
      <div className="between wrap g12" style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flex: 'none' }}>
        <ChipRow>
          {GROUPS.map((g) => (
            <Chip key={g.key} active={group === g.key} onClick={() => setGroup(g.key)} count={counts[g.key]}>
              {g.label}
            </Chip>
          ))}
        </ChipRow>
        <SearchInput value={query} onChange={setQuery} placeholder="Search area or issue…" style={{ width: 260 }} />
      </div>

      {/* map + nearby list */}
      <div className="map-split">
        <div className="map-col">
          <MapCanvas
            height="100%"
            flush
            center={CITY.center}
            zoom={12}
            legend={legend}
            overlay={
              <div className="map-overlay-tr">
                <button className="btn btn-secondary btn-sm map-float" onClick={() => setSelected(null)}>
                  <IconLocate size={15} /> Recentre
                </button>
              </div>
            }
          >
            {selected && <Recenter center={[selected.lat, selected.lng]} zoom={16} />}
            <IssueMarkers issues={visible} onSelect={open} />
          </MapCanvas>
        </div>

        <aside className="map-side">
          <div className="map-side-head">
            <div className="between">
              <h2 className="card-title">Nearby issues</h2>
              <span className="badge badge-neutral">{visible.length}</span>
            </div>
            <p className="meta" style={{ marginTop: 3 }}>Sorted by distance from your location</p>
          </div>

          <div className="map-side-list">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="row g12" style={{ padding: 12 }}>
                  <Skeleton w={56} h={56} r={8} />
                  <div className="stack g8 grow">
                    <Skeleton w="45%" h={10} />
                    <Skeleton w="85%" h={14} />
                    <Skeleton w="60%" h={10} />
                  </div>
                </div>
              ))}

            {!loading && visible.length === 0 && (
              <EmptyState
                icon={<IconMap size={20} />}
                title="No issues match this filter"
                message="Try a different category, or clear the search to see everything reported across Chennai."
              />
            )}

            {!loading &&
              visible.slice(0, 40).map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  selected={selected?.id === issue.id}
                  onClick={() => { setSelected(issue); open(issue); }}
                />
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

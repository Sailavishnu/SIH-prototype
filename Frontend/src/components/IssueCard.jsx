import React from 'react';
import { CATEGORIES } from '../data/mock';
import { cx, timeAgo } from '../lib/format';
import { Badge, StatusBadge, PriorityBadge } from './ui';
import { IconCamera, IconPin, IconClock } from '../lib/icons';

/** Compact issue row used in the map side panel and in "My Reports". */
export default function IssueCard({ issue, selected, onClick, showDistance = true, showStatus = true }) {
  const cat = CATEGORIES[issue.category];
  return (
    <button type="button" className={cx('issue-card', selected && 'selected')} onClick={onClick}>
      <span className="issue-thumb" style={{ background: cat.color }}>
        <IconCamera size={20} />
      </span>

      <span className="grow stack g4" style={{ minWidth: 0 }}>
        <span className="row g8 wrap" style={{ gap: 6 }}>
          <Badge tone="neutral" style={{ background: `${cat.color}14`, color: cat.color }}>{cat.short}</Badge>
          <PriorityBadge priority={issue.priority} />
          {showStatus && <StatusBadge status={issue.status} />}
        </span>

        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{issue.title}</span>

        <span className="row g12 wrap meta" style={{ gap: 12 }}>
          <span className="row g4"><IconPin size={12} />{issue.area}</span>
          <span className="row g4"><IconClock size={12} />{timeAgo(issue.detectedAt)}</span>
          {showDistance && <span className="mono">{issue.distanceKm} km away</span>}
        </span>
      </span>
    </button>
  );
}

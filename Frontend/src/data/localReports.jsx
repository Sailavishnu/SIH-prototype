/* ============================================================
   Reports submitted during this session.
   Kept in localStorage so a freshly filed report really does show
   up in "My Reports" and on its own detail page — still no backend.
   ============================================================ */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CATEGORIES } from './mock';

const KEY = 'urbansight.myreports';
const Ctx = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function LocalReportsProvider({ children }) {
  const [reports, setReports] = useState(read);

  useEffect(() => {
    try {
      // object URLs die with the page, so they are never persisted —
      // a reloaded report falls back to the evidence placeholder.
      localStorage.setItem(KEY, JSON.stringify(reports.map(({ photo, ...r }) => r)));
    } catch {
      /* storage unavailable — reports simply live for this page view */
    }
  }, [reports]);

  const addReport = useCallback((draft) => {
    const cat = CATEGORIES[draft.category] || CATEGORIES.pothole;
    const now = Date.now();
    const id = `URB-C${String(Math.floor(1000 + Math.random() * 8999))}`;
    const report = {
      id,
      title: draft.title || cat.label,
      category: draft.category,
      categoryLabel: cat.label,
      group: cat.group,
      color: cat.color,
      description: draft.description || 'Reported by a citizen through the UrbanSight AI app.',
      area: draft.area || 'Chennai',
      road: draft.address || 'Location pinned on map',
      zone: 'Central Zone',
      district: 'Chennai',
      state: 'Tamil Nadu',
      lat: draft.lat,
      lng: draft.lng,
      severity: 'medium',
      priority: 'P2',
      status: 'open',
      confidence: Number((88 + Math.random() * 9).toFixed(1)),
      detectedAt: now,
      updatedAt: now,
      source: 'Citizen',
      busId: null,
      route: null,
      department: cat.dept,
      assignedTo: null,
      passes: 1,
      distanceKm: 0.2,
      mine: true,
      photo: draft.photo || null,
      timeline: [
        { key: 'open', label: 'Detected', note: 'Report submitted by you and queued for review.', at: now, done: false, current: true },
        { key: 'verified', label: 'Verified', note: 'Control room confirms the report against camera footage.', at: null, done: false, current: false },
        { key: 'assigned', label: 'Assigned', note: 'Work order raised and routed to the responsible department.', at: null, done: false, current: false },
        { key: 'in_progress', label: 'Work Started', note: 'Field crew mobilised, repair work underway at site.', at: null, done: false, current: false },
        { key: 'resolved', label: 'Resolved', note: 'Repair completed and verified by a follow-up bus pass.', at: null, done: false, current: false },
      ],
    };
    setReports((prev) => [report, ...prev]);
    return report;
  }, []);

  const value = useMemo(() => ({ reports, addReport }), [reports, addReport]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocalReports() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLocalReports must be used inside <LocalReportsProvider>');
  return ctx;
}

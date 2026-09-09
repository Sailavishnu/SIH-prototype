/* ============================================================
   Session-level overrides for the admin actions.
   Buttons like "Mark Verified" or "Assign" are UI-only, but the
   change has to be visible and consistent across every screen —
   so the new value is held here for the life of the session.
   ============================================================ */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const Ctx = createContext(null);

export function OverridesProvider({ children }) {
  const [issueStatus, setIssueStatus] = useState({});      // id -> status
  const [issueDept, setIssueDept] = useState({});          // id -> department name
  const [incidentStep, setIncidentStep] = useState({});    // id -> step index

  const value = useMemo(
    () => ({
      /** Apply any overrides to a raw issue record. */
      withIssue: (issue) => ({
        ...issue,
        status: issueStatus[issue.id] ?? issue.status,
        department: issueDept[issue.id] ?? issue.department,
        overridden: issue.id in issueStatus || issue.id in issueDept,
      }),
      withIssues: (list) =>
        list.map((issue) => ({
          ...issue,
          status: issueStatus[issue.id] ?? issue.status,
          department: issueDept[issue.id] ?? issue.department,
          overridden: issue.id in issueStatus || issue.id in issueDept,
        })),
      withIncident: (inc) => ({
        ...inc,
        stepIndex: incidentStep[inc.id] ?? inc.stepIndex,
      }),
      withIncidents: (list) => list.map((inc) => ({ ...inc, stepIndex: incidentStep[inc.id] ?? inc.stepIndex })),
      setStatus: (id, status) => setIssueStatus((s) => ({ ...s, [id]: status })),
      setDepartment: (id, dept) => setIssueDept((s) => ({ ...s, [id]: dept })),
      setIncidentStep: (id, step) => setIncidentStep((s) => ({ ...s, [id]: step })),
      changeCount: Object.keys(issueStatus).length + Object.keys(issueDept).length + Object.keys(incidentStep).length,
    }),
    [issueStatus, issueDept, incidentStep],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOverrides() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOverrides must be used inside <OverridesProvider>');
  return ctx;
}

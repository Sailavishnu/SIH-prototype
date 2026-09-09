import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import RequireAuth from './auth/RequireAuth';
import { LocalReportsProvider } from './data/localReports';
import { OverridesProvider } from './data/overrides';
import { ToastProvider } from './components/ui';

import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

import Landing from './pages/public/Landing';
import { CitizenLogin, AdminLogin } from './pages/auth/LoginPages';
import CitizenHome from './pages/public/CitizenHome';
import CityMap from './pages/public/CityMap';
import IssueDetail from './pages/public/IssueDetail';
import ReportIssue from './pages/public/ReportIssue';
import MyReports from './pages/public/MyReports';
import CityInsights from './pages/public/CityInsights';

import Dashboard from './pages/admin/Dashboard';
import GisMap from './pages/admin/GisMap';
import ReportsTable from './pages/admin/ReportsTable';
import Incidents from './pages/admin/Incidents';
import IncidentDetail from './pages/admin/IncidentDetail';
import Traffic from './pages/admin/Traffic';
import Infrastructure from './pages/admin/Infrastructure';
import Fleet from './pages/admin/Fleet';
import FleetDetail from './pages/admin/FleetDetail';
import Analytics from './pages/admin/Analytics';
import ReportsExport from './pages/admin/ReportsExport';
import Teams from './pages/admin/Teams';

import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <LocalReportsProvider>
          <OverridesProvider>
            <BrowserRouter>
              <Routes>
                {/* public entry */}
                <Route path="/" element={<Landing />} />

                {/* the two logins, on separate routes */}
                <Route path="/login" element={<CitizenLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* citizen experience — requires a citizen session */}
                <Route element={<RequireAuth role="citizen" />}>
                  <Route path="/app" element={<PublicLayout />}>
                    <Route index element={<CitizenHome />} />
                    <Route path="map" element={<CityMap />} />
                    <Route path="issue/:id" element={<IssueDetail />} />
                    <Route path="report" element={<ReportIssue />} />
                    <Route path="my-reports" element={<MyReports />} />
                    <Route path="insights" element={<CityInsights />} />
                  </Route>
                </Route>

                {/* authority experience — requires an admin session */}
                <Route element={<RequireAuth role="admin" />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="map" element={<GisMap />} />
                    <Route path="reports" element={<ReportsTable />} />
                    <Route path="incidents" element={<Incidents />} />
                    <Route path="incidents/:id" element={<IncidentDetail />} />
                    <Route path="traffic" element={<Traffic />} />
                    <Route path="infrastructure" element={<Infrastructure />} />
                    <Route path="fleet" element={<Fleet />} />
                    <Route path="fleet/:id" element={<FleetDetail />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="exports" element={<ReportsExport />} />
                    <Route path="teams" element={<Teams />} />
                  </Route>
                </Route>

                {/* convenience redirects */}
                <Route path="/map" element={<Navigate to="/app/map" replace />} />
                <Route path="/report" element={<Navigate to="/app/report" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </OverridesProvider>
        </LocalReportsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

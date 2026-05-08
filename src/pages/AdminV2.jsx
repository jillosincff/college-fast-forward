import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import NorthStarBanner from '@/components/adminv2/NorthStarBanner';
import SignupTiles from '@/components/adminv2/SignupTiles';
import SchoolTable from '@/components/adminv2/SchoolTable';
import EngagementPanel from '@/components/adminv2/EngagementPanel';
import MessageStatsPanel from '@/components/adminv2/MessageStatsPanel';
import WeeklyLog from '@/components/adminv2/WeeklyLog';
import Phase2Placeholders from '@/components/adminv2/Phase2Placeholders';
import AdminUtilities from '@/components/adminv2/AdminUtilities';
import EmailStatsPanel from '@/components/adminv2/EmailStatsPanel';
import FastIQTrialPanel from '@/components/adminv2/FastIQTrialPanel';

export default function AdminV2() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      const isAdmin = u?.role === 'admin' || u?.roles?.includes('admin');
      if (!isAdmin) {
        setError('Admin access required.');
        setLoading(false);
        return;
      }
      loadData();
    }).catch(() => setLoading(false));
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('getAdminDashboardData', {});
      setData(res.data);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading dashboard…</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-red-400 text-lg font-semibold">Please log in to access this page.</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col gap-4">
      <p className="text-red-400">{error}</p>
      <button onClick={loadData} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">College Fast Forward · Phase 1</p>
        </div>
        <div className="flex gap-3">
          <a
            href="#/engagement-agent"
            style={{minHeight: 'auto'}}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium border border-orange-500 transition-colors"
          >
            📧 Engagement Agent
          </a>
          <button
            onClick={loadData}
            style={{minHeight: 'auto'}}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {data && (
        <>
          <NorthStarBanner data={data.northStar} />
          <SignupTiles data={data.signups} />
          <SchoolTable schools={data.schools} grandTotal={data.grandTotal} />
          <EngagementPanel data={data.engagement} />
          <MessageStatsPanel data={data.messages} />
          <EmailStatsPanel />
          <FastIQTrialPanel />
          <Phase2Placeholders />
          <WeeklyLog />
          <AdminUtilities />
        </>
      )}
    </div>
  );
}
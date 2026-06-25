import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw } from 'lucide-react';
import StatCard from '@/components/stats/StatCard';

const dm = "'DM Sans', system-ui, sans-serif";

// Safely count records for an entity; returns 0 on any failure (e.g. RLS).
async function safeCount(entityName, query) {
  try {
    const fn = query
      ? base44.entities[entityName].filter(query, '-created_date', 1000)
      : base44.entities[entityName].list('-created_date', 1000);
    const rows = await fn;
    return Array.isArray(rows) ? rows.length : 0;
  } catch {
    return 0;
  }
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authed' | 'guest'

  useEffect(() => {
    base44.auth.me()
      .then(() => setAuthState('authed'))
      .catch(() => setAuthState('guest'));
  }, []);

  const load = async () => {
    setLoading(true);
    const [pipeline, tailoredResumes, students] = await Promise.all([
      // Pipeline holds matched jobs + outreach status — pull once, derive from it
      (async () => { try { return await base44.entities.NetworkingPipeline.list('-created_date', 1000); } catch { return []; } })(),
      safeCount('TailoredResume'),
      safeCount('User', { persona: 'student' }),
    ]);

    const outreachStatuses = ['reached_out', 'messaged', 'replied', 'coffee_chat', 'intro_made', 'interview', 'offer'];
    const outreachSent = pipeline.filter(p => outreachStatuses.includes(p.status)).length;
    const interviews = pipeline.filter(p => p.status === 'interview' || p.status === 'offer').length;

    setStats({
      students,
      jobsMatched: pipeline.length,
      outreachSent,
      tailoredResumes,
      interviews,
    });
    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { if (authState === 'authed') load(); }, [authState]);

  const fmt = (n) => (n ?? 0).toLocaleString();

  // Auth gate — checking spinner / guest sign-in prompt
  if (authState !== 'authed') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        {authState === 'checking' ? (
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '40px 36px', textAlign: 'center', maxWidth: 380, width: '100%' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
            <h1 style={{ fontFamily: dm, fontSize: 22, fontWeight: 900, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Sign in to view your stats
            </h1>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              Log in to see your students, jobs matched, outreach sent, and more.
            </p>
            <a
              href="#/GatorAuth"
              style={{ display: 'inline-block', fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', background: '#6366f1', borderRadius: 10, padding: '12px 28px', textDecoration: 'none' }}
            >
              Sign in
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: '#0f172a', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>
            College Fast Forward
          </p>
          <h1 style={{ fontFamily: dm, fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Platform Stats
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontFamily: dm, fontSize: 11, color: '#64748b' }}>
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto' }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>
        {loading && !stats ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon="🎓" label="Students" value={fmt(stats?.students)} sub="On the platform" accent="#6366f1" />
              <StatCard icon="🎯" label="Jobs Matched" value={fmt(stats?.jobsMatched)} sub="In student pipelines" accent="#0ea5e9" />
              <StatCard icon="📤" label="Outreach Sent" value={fmt(stats?.outreachSent)} sub="Warm intros & messages" accent="#8b5cf6" />
              <StatCard icon="📄" label="Resumes Tailored" value={fmt(stats?.tailoredResumes)} sub="ATS-optimized versions" accent="#16a34a" />
              <StatCard icon="💼" label="Interviews & Offers" value={fmt(stats?.interviews)} sub="Reached interview stage+" accent="#f59e0b" />
            </div>

            <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
              Live counts pulled from the platform. Numbers update each time you refresh.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
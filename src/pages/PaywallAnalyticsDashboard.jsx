import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getPaywallAnalytics } from '@/functions/getPaywallAnalytics';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// ── Metric Tile ────────────────────────────────────────────────────
function Tile({ label, value, sub, accent, trend, hint }) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#ef4444' : '#94a3b8';

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 4,
      borderTop: `3px solid ${accent}`,
    }}>
      <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: dm, fontSize: 32, fontWeight: 900, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        {trend && (
          <TrendIcon size={16} color={trendColor} strokeWidth={2.5} />
        )}
      </div>
      {sub && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: 0 }}>{sub}</p>}
      {hint && (
        <p style={{ fontFamily: dm, fontSize: 10, color: '#9ca3af', margin: '4px 0 0', lineHeight: 1.5, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────
function SectionHeader({ emoji, title, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <p style={{ fontFamily: dm, fontSize: 15, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</p>
      </div>
      {sub && <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0 26px' }}>{sub}</p>}
    </div>
  );
}

// ── Funnel Bar ─────────────────────────────────────────────────────
function FunnelBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</span>
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#111827' }}>{value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function PaywallAnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const res = await getPaywallAnalytics({});
    const body = res?.data || res;
    if (body?.error) {
      setError(body.error);
    } else {
      setData(body);
      setLastRefresh(new Date());
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const s = data?.summary || {};
  const rf = data?.recentFunnel || {};
  const hourly = data?.hourlyTrend || [];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: dm }}>
      {/* Header */}
      <div style={{ background: '#0f172a', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>
            Admin · Paywall Analytics
          </p>
          <h1 style={{ fontFamily: dm, fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Conversion Intelligence Dashboard
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
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff',
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 8, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {error && (
        <div style={{ margin: '24px 32px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 18px' }}>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#dc2626', margin: 0 }}>⚠️ {error} — Admin access required.</p>
        </div>
      )}

      {loading && !data && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}

      {data && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 60px' }}>

          {/* ── 1. Downsell Recovery Yield ── */}
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              emoji="🎯"
              title="Downsell Recovery Yield"
              sub="Users who hit exit-intent or Back and converted on the $2.49/wk offer vs. bouncing entirely."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <Tile
                label="Exit Intents Fired"
                value={s.exitIntentFired}
                accent="#f59e0b"
                hint="Desktop top-boundary departures + back button intercepts"
              />
              <Tile
                label="Downsell Shown"
                value={s.downsellShown}
                accent="#f59e0b"
                hint="Users who saw the $2.49/wk offer"
              />
              <Tile
                label="Downsell Converted"
                value={s.downsellConverted}
                accent="#16a34a"
                trend={s.downsellConverted > 0 ? 'up' : null}
                hint="Users who paid after the downsell intercept"
              />
              <Tile
                label="Downsell Yield"
                value={s.downsellYield != null ? `${s.downsellYield}%` : '—'}
                sub="Conversion rate on $2.49/wk offer"
                accent="#6366f1"
                hint="Target: >15% recovery rate proves price sensitivity, not intent gap"
              />
              <Tile
                label="Downsell Bounced"
                value={s.downsellBounced}
                accent="#ef4444"
                trend={s.downsellBounced > s.downsellConverted ? 'down' : 'up'}
                hint="Left even after 50% off — true low-intent departures"
              />
            </div>
          </div>

          {/* ── 2. K-Factor / Viral Coefficient ── */}
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              emoji="🔗"
              title="K-Factor — Viral Coefficient"
              sub="Click-through rate on 'Text 3 Classmates' share payload. Self-sustaining loop target: K > 1."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <Tile
                label="Referral Share Clicks"
                value={s.referralShares}
                accent="#8b5cf6"
                hint="Users who tapped 'Text 3 Classmates' in the paywall"
              />
              <Tile
                label="Referral Link Clicks"
                value={s.referralLinkClicks}
                accent="#8b5cf6"
                hint="Total downstream clicks on shared links"
              />
              <Tile
                label="Referral Signups"
                value={s.referralSignups}
                accent="#16a34a"
                trend={s.referralSignups > 0 ? 'up' : null}
                hint="New users who completed sign-up via a referral link"
              />
              <Tile
                label="K-Factor"
                value={s.kFactor != null ? s.kFactor : '—'}
                sub="Signups per referral share"
                accent="#6366f1"
                hint="K > 1 = self-sustaining viral loop. K > 3 = exponential growth."
              />
              <Tile
                label="Viral Loop Score"
                value={s.viralLoop != null ? s.viralLoop : '—'}
                sub="Projected signups per 10 shares"
                accent="#3b82f6"
                hint="Based on 3-classmate target. Score ≥ 30 = loop is self-sustaining."
              />
            </div>
          </div>

          {/* ── 3. Bounce Horizon ── */}
          <div style={{ marginBottom: 36 }}>
            <SectionHeader
              emoji="📈"
              title="Bounce Horizon — Hard Gate Health"
              sub="Overall funnel conversion. Drop in session time is OK as long as checkout + referral loops move up."
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
              <Tile
                label="Paywall Shown"
                value={s.paywallShown}
                accent="#64748b"
                hint="Total users who hit the premium gate"
              />
              <Tile
                label="Direct Conversions"
                value={s.paywallConverted}
                accent="#16a34a"
                trend={s.paywallConverted > 0 ? 'up' : null}
                hint="Paid at full $4.99/wk on first prompt"
              />
              <Tile
                label="Overall CVR"
                value={s.overallConversionRate != null ? `${s.overallConversionRate}%` : '—'}
                sub="Full price + downsell combined"
                accent="#22c55e"
                hint="Target: >8% overall. Includes downsell recoveries."
              />
              <Tile
                label="Pure Bounced"
                value={s.paywallBounced > 0 ? s.paywallBounced : '—'}
                accent="#ef4444"
                trend={s.paywallBounced > s.paywallConverted ? 'down' : 'up'}
                hint="Left without paying or sharing — low-intent filter. Expected with hard gate."
              />
              <Tile
                label="New Signups (48h)"
                value={s.newSignups48h}
                accent="#0ea5e9"
                hint="Total new student registrations in the last 48 hours"
              />
            </div>
          </div>

          {/* ── Full Funnel (all time) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 36 }}>

            {/* All-time funnel */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px' }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 18px' }}>📊 All-Time Conversion Funnel</p>
              {s.paywallShown > 0 ? (
                <>
                  <FunnelBar label="Paywall Shown" value={s.paywallShown} max={s.paywallShown} color="#6366f1" />
                  <FunnelBar label="Downsell Triggered" value={s.downsellShown} max={s.paywallShown} color="#f59e0b" />
                  <FunnelBar label="Direct Converts ($4.99)" value={s.paywallConverted} max={s.paywallShown} color="#16a34a" />
                  <FunnelBar label="Downsell Converts ($2.49)" value={s.downsellConverted} max={s.paywallShown} color="#22c55e" />
                  <FunnelBar label="Referral Shares" value={s.referralShares} max={s.paywallShown} color="#8b5cf6" />
                </>
              ) : (
                <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No paywall events recorded yet.</p>
              )}
            </div>

            {/* Last 48h funnel */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px' }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 18px' }}>⏱️ Last 48 Hours</p>
              {rf.paywall_shown > 0 ? (
                <>
                  <FunnelBar label="Paywall Shown" value={rf.paywall_shown} max={rf.paywall_shown} color="#6366f1" />
                  <FunnelBar label="Downsell Shown" value={rf.downsell_shown} max={rf.paywall_shown} color="#f59e0b" />
                  <FunnelBar label="Direct Converts" value={rf.paywall_converted} max={rf.paywall_shown} color="#16a34a" />
                  <FunnelBar label="Downsell Converts" value={rf.downsell_converted} max={rf.paywall_shown} color="#22c55e" />
                  <FunnelBar label="Referral Shares" value={rf.referral_shares} max={rf.paywall_shown} color="#8b5cf6" />
                  <FunnelBar label="Exit Intents" value={rf.exit_intents} max={rf.paywall_shown} color="#ef4444" />
                </>
              ) : (
                <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '24px 0' }}>No events in the last 48 hours.</p>
              )}
            </div>
          </div>

          {/* ── Hourly Trend Chart ── */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '22px 24px', marginBottom: 24 }}>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: '0 0 20px' }}>
              📉 Hourly Activity — Last 24 Hours
            </p>
            {hourly.some(h => h.paywall_shown > 0 || h.conversions > 0 || h.referral_shares > 0) ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={hourly} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontFamily: dm, fontSize: 10, fill: '#94a3b8' }} interval={3} />
                  <YAxis tick={{ fontFamily: dm, fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ fontFamily: dm, fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    labelStyle={{ fontWeight: 700, color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: dm, fontSize: 11 }} />
                  <Line type="monotone" dataKey="paywall_shown" stroke="#6366f1" strokeWidth={2} dot={false} name="Paywall Shown" />
                  <Line type="monotone" dataKey="conversions" stroke="#16a34a" strokeWidth={2} dot={false} name="Conversions" />
                  <Line type="monotone" dataKey="referral_shares" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Referral Shares" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af' }}>Paywall events will populate here as they occur.</p>
              </div>
            )}
          </div>

          {/* ── Benchmark Guide ── */}
          <div style={{ background: '#0f172a', borderRadius: 16, padding: '22px 26px' }}>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>🎯 What to Watch — Next 24–48 Hours</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {[
                { label: 'Downsell Yield Target', target: '≥ 15%', note: 'Confirms price sensitivity, not intent gap. Users want the data.' },
                { label: 'K-Factor Target', target: '≥ 1.0', note: 'Every sign-up generates at least 1 new sign-up. ≥ 3 = exponential.' },
                { label: 'Overall CVR Target', target: '≥ 8%', note: 'Full-price + downsell combined. Hard gate filters looky-loos.' },
                { label: 'Viral Loop Score Target', target: '≥ 30', note: 'Per 10 shares → 30 new invites = self-sustaining organic loop.' },
              ].map(({ label, target, note }) => (
                <div key={label} style={{ background: '#1e293b', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 900, color: '#22c55e' }}>{target}</span>
                  </div>
                  <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{note}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
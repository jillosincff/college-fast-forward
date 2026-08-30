import { RefreshCw, AlertCircle } from 'lucide-react';
import { FONT, TEXT3, INDIGO_DIM } from '@/components/onboarding-flow/onboardingShared';

// Small status + refresh row above the jobs feed.
// Shows "Updated X ago" normally, a soft "couldn't refresh — retry" banner when
// the last fetch failed or served stale cached results, and a Refresh button.
export default function JobsRefreshBar({ lastUpdated, isStale, error, onRefresh, loading }) {
  const ago = lastUpdated ? timeAgo(lastUpdated) : '';
  const showRetry = error || isStale;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10, minHeight: 20 }}>
      <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: showRetry ? '#b45309' : TEXT3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {showRetry ? (
          <>
            <AlertCircle size={11} />
            {error ? 'Couldn’t refresh — showing earlier results' : 'Showing cached results'}
          </>
        ) : ago ? (
          <>Updated {ago}</>
        ) : null}
      </span>
      <button
        onClick={onRefresh}
        disabled={loading}
        style={{
          fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM,
          background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, minHeight: 'auto', opacity: loading ? 0.5 : 1,
        }}
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
      </button>
    </div>
  );
}

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}
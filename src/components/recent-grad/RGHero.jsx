import React from 'react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

function StatCard({ label, value, sub, isEmpty }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '18px 16px', minWidth: 0,
    }}>
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6,
      }}>{label}</p>
      <p style={{
        fontFamily: playfair, fontSize: 28, fontWeight: 700,
        color: isEmpty ? 'rgba(255,255,255,0.25)' : '#fff', marginBottom: 2,
      }}>
        {isEmpty ? '—' : value}
      </p>
      <p style={{
        fontFamily: dmSans, fontSize: 12, fontWeight: 400,
        color: isEmpty ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)', margin: 0,
      }}>{sub}</p>
    </div>
  );
}

export default function RGHero({
  karma, responseCount, activeRequestCount, matchCount,
  hasActiveRequest, onPostRequest, onScrollToRequest,
  liveActivity,
}) {
  return (
    <div style={{
      backgroundImage: 'linear-gradient(135deg, #0d1117 0%, #0a1a6e 50%, #0821A5 100%)',
      padding: '40px 20px 0',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: dmSans, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#E85D20', marginBottom: 12,
        }}>YOUR CAREER NETWORK</p>

        {/* H1 */}
        <h1 style={{
          fontFamily: playfair, fontWeight: 700, fontSize: 36, color: '#fff',
          lineHeight: 1.1, marginBottom: 8,
        }}>
          Your Network.
        </h1>

        {/* Subhead */}
        <p style={{
          fontFamily: dmSans, fontSize: 15, fontWeight: 400, color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.5, marginBottom: 28, maxWidth: 520,
        }}>
          Connect with parents and alumni who can help you land your next opportunity.
        </p>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }} className="flex-col sm:flex-row">
          <StatCard
            label="Karma"
            value={karma}
            sub="Higher karma = more visibility"
            isEmpty={!karma || karma === 0}
          />
          <StatCard
            label="Responses"
            value={responseCount}
            sub={activeRequestCount > 0 ? `${activeRequestCount} active request` : 'No active requests'}
            isEmpty={!responseCount || responseCount === 0}
          />
          <StatCard
            label="Matches"
            value={matchCount}
            sub="professionals who can help"
            isEmpty={!matchCount || matchCount === 0}
          />
        </div>

        {/* Status strip */}
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={hasActiveRequest ? onScrollToRequest : onPostRequest}
            style={{
              fontFamily: dmSans, fontSize: 13, fontWeight: 600,
              background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)',
              borderRadius: 999, padding: '10px 20px', color: '#E85D20',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              minHeight: 'auto', width: 'auto',
            }}
          >
            <span>✨</span>
            {hasActiveRequest
              ? 'Your request is live — parents and alumni are reviewing it →'
              : 'Post a request to get matched with professionals who can help →'
            }
          </button>
        </div>

        {/* Live activity ticker */}
        {liveActivity && liveActivity.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
            overflow: 'hidden',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              flexShrink: 0, animation: 'pulse 2s infinite',
            }} />
            <div style={{
              display: 'flex', gap: 24, overflow: 'hidden', whiteSpace: 'nowrap',
              animation: 'scrollTicker 30s linear infinite',
            }}>
              {liveActivity.concat(liveActivity).map((entry, i) => (
                <span key={i} style={{
                  fontFamily: dmSans, fontSize: 12, fontWeight: 500,
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  {entry}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
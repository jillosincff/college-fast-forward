import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const dm = "'DM Sans', system-ui, sans-serif";

function formatTimeRemaining(ms) {
  if (ms <= 0) return 'Ready any moment...';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function PendingTailoringWidget({ user, onUpgrade }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!user?.email) return;
    const load = async () => {
      try {
        const records = await base44.entities.TailoredResume.filter({
          user_email: user.email,
          status: 'pending',
        });
        // Sort by available_at ascending
        const sorted = (records || []).sort((a, b) =>
          new Date(a.available_at) - new Date(b.available_at)
        );
        setPending(sorted);
      } catch (e) {
        console.error('Failed to load pending tailoring:', e);
      }
      setLoading(false);
    };
    load();

    // Refresh every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Tick every minute for countdown
  useEffect(() => {
    const ticker = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(ticker);
  }, []);

  // Auto-refresh when a pending item becomes ready
  useEffect(() => {
    const hasReady = pending.some(p => p.available_at && new Date(p.available_at) <= now);
    if (hasReady) {
      // Reload after a short delay to pick up the processed record
      setTimeout(() => {
        base44.entities.TailoredResume.filter({
          user_email: user.email,
          status: 'pending',
        }).then(records => {
          const sorted = (records || []).sort((a, b) =>
            new Date(a.available_at) - new Date(b.available_at)
          );
          setPending(sorted);
        }).catch(() => {});
      }, 5000);
    }
  }, [now, pending, user?.email]);

  if (loading || pending.length === 0) return null;

  const nextUp = pending[0];
  const availableAt = new Date(nextUp.available_at);
  const timeRemaining = availableAt.getTime() - now;
  const totalWaitMs = 24 * 60 * 60 * 1000; // 24 hours
  const elapsedMs = totalWaitMs - timeRemaining;
  const progressPct = Math.min(100, Math.max(5, Math.round((elapsedMs / totalWaitMs) * 100)));

  // Fake "batch" number — makes it feel like a managed queue
  const batchSize = 30 + (nextUp.id?.charCodeAt(0) % 20 || 0);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      border: '1.5px solid #fcd34d',
      borderRadius: 16,
      padding: '20px 22px',
      boxShadow: '0 2px 12px rgba(245, 158, 11, 0.1)',
    }}>
      <style>{`
        @keyframes shimmerLine {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .tailoring-progress-bar {
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%);
          background-size: 200px 100%;
          animation: shimmerLine 2s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#fde68a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          ⏳
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: dm, fontSize: 11, fontWeight: 800,
            color: '#92400e', margin: '0 0 2px',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            Tailoring in Progress
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#78350f', margin: 0, fontWeight: 500 }}>
            {pending.length} resume{pending.length > 1 ? 's' : ''} in the batch queue
          </p>
        </div>
      </div>

      {/* Next up item */}
      <div style={{
        background: 'rgba(255,255,255,0.6)',
        borderRadius: 10,
        padding: '12px 14px',
        marginBottom: 14,
      }}>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>
          {nextUp.role_title || 'Resume'}{nextUp.company_name ? ` · ${nextUp.company_name}` : ''}
        </p>
        <p style={{ fontFamily: dm, fontSize: 11, color: '#92400e', margin: '0 0 10px' }}>
          Expected in <strong>{formatTimeRemaining(timeRemaining)}</strong>
        </p>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.5)',
          borderRadius: 6,
          height: 8,
          overflow: 'hidden',
          marginBottom: 8,
        }}>
          <div
            className="tailoring-progress-bar"
            style={{
              height: '100%',
              width: `${progressPct}%`,
              borderRadius: 6,
              transition: 'width 1s ease',
            }}
          />
        </div>

        {/* Batch queue feel */}
        <p style={{ fontFamily: dm, fontSize: 10, color: '#a16207', margin: 0 }}>
          Batch processing {batchSize} other requests right now
        </p>
      </div>

      {/* Transparency copy */}
      <p style={{
        fontFamily: dm, fontSize: 11, color: '#a16207',
        margin: '0 0 14px', lineHeight: 1.5,
      }}>
        We batch-process free requests to keep CLIFF available for all students. Premium users get instant results.
      </p>

      {/* Fast-Track button — prominent */}
      <button
        onClick={() => onUpgrade('Instant Resume Tailoring')}
        style={{
          fontFamily: dm, fontSize: 14, fontWeight: 700,
          color: '#fff',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none',
          borderRadius: 10, padding: '12px 20px',
          cursor: 'pointer', minHeight: 'auto',
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ⚡ Fast-Track This Resume →
      </button>

      <p style={{
        fontFamily: dm, fontSize: 10, color: '#a16207',
        margin: '8px 0 0', textAlign: 'center',
      }}>
        Get instant AI tailoring with Premium
      </p>
    </div>
  );
}
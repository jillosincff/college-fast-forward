import React from 'react';
import useCheckout from './useCheckout';
import { Loader2 } from 'lucide-react';

const dmSans = "'DM Sans', system-ui, sans-serif";
const mono = "'DM Mono', 'Courier New', monospace";
const ORANGE = '#E85D20';

export default function InvitationUpgradeScreen({ studentName, display, onInviteAnother, onSkip }) {
  const { startCheckout, loading, error } = useCheckout();
  const name = studentName || 'your student';

  return (
    <div style={{
      maxWidth: 660, margin: '0 auto', padding: '48px 24px 60px',
      fontFamily: dmSans,
    }}>

      {/* ── TOP CONFIRMATION ── */}
      <p style={{
        fontSize: 14, fontWeight: 400, color: '#888',
        textAlign: 'center', marginBottom: 4,
      }}>
        Invitation sent to {name} ✓
      </p>
      <p style={{
        fontSize: 13, fontWeight: 400, color: '#aaa',
        textAlign: 'center', marginBottom: 48,
      }}>
        {"We'll notify you when she joins."}
      </p>

      {/* ── HERO ── */}
      <h1 style={{
        fontSize: 'clamp(26px, 4.5vw, 36px)', fontWeight: 800, color: '#111',
        textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.02em',
        marginBottom: 16,
      }}>
        You just gave {name} a competitive advantage.
      </h1>
      <p style={{
        fontSize: 16, fontWeight: 400, color: '#666',
        textAlign: 'center', lineHeight: 1.7, marginBottom: 48,
      }}>
        Most students apply and hope.<br />
        She now has a more strategic path forward.
      </p>

      {/* ── VALUE SNAP ── */}
      <p style={{
        fontSize: 12, fontWeight: 700, color: '#999',
        textTransform: 'uppercase', letterSpacing: '0.12em',
        textAlign: 'center', marginBottom: 16,
      }}>
        What this unlocks:
      </p>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        {['Clarity on where to focus', 'Access to the right alumni', 'A path beyond cold applications'].map((item, i) => (
          <p key={i} style={{
            fontSize: 15, fontWeight: 500, color: '#333',
            lineHeight: 2.2, margin: 0,
          }}>
            {item}
          </p>
        ))}
      </div>

      {/* ── DIFFERENTIATOR ── */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{
          fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 700, color: '#111',
          lineHeight: 1.5, margin: 0,
        }}>
          Most students submit applications.
        </p>
        <p style={{
          fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 700, color: '#111',
          lineHeight: 1.5, margin: 0,
        }}>
          FastIQ students build connections.
        </p>
      </div>

      {/* ── PROOF POINT ── */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{
          fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 800, color: ORANGE,
          letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1,
        }}>
          10x
        </p>
        <p style={{
          fontSize: 16, fontWeight: 600, color: '#222',
          margin: '0 0 6px',
        }}>
          more likely to land interviews
        </p>
        <p style={{
          fontSize: 13, fontWeight: 400, color: '#999',
          margin: 0,
        }}>
          Students with warm introductions don't compete the same way.
        </p>
      </div>

      {/* ── DECISION MOMENT ── */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{
          fontSize: 14, fontWeight: 600, color: '#555',
          marginBottom: 20,
        }}>
          Now you have a choice:
        </p>

        <p style={{
          fontSize: 18, fontWeight: 700, color: '#111',
          marginBottom: 24,
        }}>
          Give {name} a competitive advantage
        </p>

        <p style={{
          fontSize: 13, fontWeight: 400, color: '#aaa',
          marginBottom: 4,
        }}>
          or
        </p>

        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 400, color: '#bbb', lineHeight: 1.8, margin: 0 }}>
            Let her be one of thousands in the pile.
          </p>
          <p style={{ fontSize: 14, fontWeight: 400, color: '#bbb', lineHeight: 1.8, margin: 0 }}>
            Just another resume.
          </p>
          <p style={{ fontSize: 14, fontWeight: 400, color: '#bbb', lineHeight: 1.8, margin: 0 }}>
            Hoping someone notices.
          </p>
        </div>
      </div>

      {/* ── URGENCY ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{
          fontSize: 11, fontWeight: 600, color: '#999',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: 6,
        }}>
          Founding rate expires in:
        </p>
        <p style={{
          fontFamily: mono, fontSize: 28, fontWeight: 700,
          color: ORANGE, letterSpacing: '0.06em', margin: 0,
        }}>
          {display}
        </p>
      </div>

      {/* ── CTA SECTION ── */}
      <div style={{ marginBottom: 12 }}>
        {error && (
          <p style={{ fontSize: 12, color: '#e53935', textAlign: 'center', marginBottom: 12 }}>
            {error}
          </p>
        )}

        <button onClick={() => startCheckout('fastiq_founding_annual')} disabled={loading} style={{
          width: '100%', padding: '16px 24px', borderRadius: 100,
          background: ORANGE, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 16, fontWeight: 700, color: '#fff',
          minHeight: 'auto', opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'opacity 0.2s',
        }}>
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
            : 'Secure Her Competitive Advantage →'
          }
        </button>

        <p style={{
          fontSize: 12, fontWeight: 500, color: '#888',
          textAlign: 'center', marginTop: 8, marginBottom: 16,
        }}>
          Lock in $187/year before pricing increases
        </p>

        <button onClick={() => startCheckout('fastiq_monthly')} disabled={loading} style={{
          width: '100%', padding: '14px 24px', borderRadius: 100,
          background: 'transparent', border: '1px solid #ddd',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 500, color: '#888',
          minHeight: 'auto', transition: 'border-color 0.2s',
        }}>
          Continue with Monthly — $29/mo
        </button>
        <p style={{
          fontSize: 11, fontWeight: 400, color: '#bbb',
          textAlign: 'center', marginTop: 6,
        }}>
          flexible, cancel anytime
        </p>
      </div>

      {/* ── FINAL CLOSE ── */}
      <div style={{ textAlign: 'center', marginTop: 48, marginBottom: 32 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 12 }}>
          A year from now, this will matter.
        </p>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#aaa', lineHeight: 1.8, margin: 0 }}>
          Some students will still be trying to break in.
        </p>
        <p style={{ fontSize: 13, fontWeight: 400, color: '#aaa', lineHeight: 1.8, margin: 0 }}>
          Others will already be inside.
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#555', marginTop: 12 }}>
          The difference is competitive advantage.
        </p>
      </div>

      {/* ── SECONDARY CTA ── */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onInviteAnother} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 500, color: ORANGE,
          minHeight: 'auto', padding: 0,
        }}>
          Invite Another Student →
        </button>
      </div>
    </div>
  );
}
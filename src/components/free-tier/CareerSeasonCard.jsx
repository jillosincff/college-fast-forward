import { useMemo, useState } from 'react';
import { deriveStudentProfile, getCareerIntelligence } from '@/lib/careerIntelligence/engine';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Career Season: CLIFF knows where the student is in their career journey and
// what this month is actually for — powered by the Career Intelligence Engine.
export default function CareerSeasonCard({ user }) {
  const [expanded, setExpanded] = useState(true);
  const ci = useMemo(() => {
    if (!user) return null;
    return getCareerIntelligence(deriveStudentProfile(user));
  }, [user]);

  if (!ci) return null;
  const { season, voice, monthName, monthlyFocus, canWait, upcomingSeason } = ci;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{season.emoji}</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Career Season</p>
            <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: '#111827', margin: 0 }}>{season.name}</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.55 }}>{season.why}</p>

      {expanded && (
        <>
          <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: '#111827', margin: '14px 0 8px', lineHeight: 1.5 }}>
            {voice}
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#6d28d9', margin: '0 0 8px' }}>
            This {monthName}, I'd focus on:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {monthlyFocus.map(rec => (
              <div key={rec.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '9px 12px' }}>
                <Check size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {rec.title} <span style={{ fontWeight: 600, color: '#9ca3af', fontSize: 11 }}>· {rec.estimated_time}</span>
                  </p>
                  <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0', lineHeight: 1.5 }}>{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
          {canWait && (
            <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#15803d', margin: '10px 0 0', lineHeight: 1.5 }}>
              🍃 {canWait}
            </p>
          )}
          {upcomingSeason && (
            <p style={{ fontFamily: dm, fontSize: 11.5, color: '#9ca3af', margin: '8px 0 0', lineHeight: 1.5 }}>
              📅 Up next: {upcomingSeason.emoji} {upcomingSeason.name} starts in {upcomingSeason.startsIn} — I'll shift your plan when it does.
            </p>
          )}
        </>
      )}
    </div>
  );
}
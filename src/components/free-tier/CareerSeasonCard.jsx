import { useMemo, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { deriveStudentProfile, getCareerIntelligence } from '@/lib/careerIntelligence/engine';
import YourPathForward from '@/components/trajectory/YourPathForward';
import { Check, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Career Season: CLIFF knows where the student is in their career journey and
// what this month is actually for — powered by the Career Intelligence Engine.
const YEAR_LABELS = {
  freshman: 'freshman', sophomore: 'sophomore', junior: 'junior',
  senior: 'senior', recent_grad: 'recent graduate',
};

export default function CareerSeasonCard({ user }) {
  const [expanded, setExpanded] = useState(true);
  const [showPath, setShowPath] = useState(false);

  // Timeline "Show my path" CTAs open the trajectory view here
  useEffect(() => {
    const open = () => setShowPath(true);
    window.addEventListener('cliff:showPath', open);
    try { base44.analytics.track({ eventName: 'monthly_focus_viewed' }); } catch {}
    return () => window.removeEventListener('cliff:showPath', open);
  }, []);
  const { ci, profile } = useMemo(() => {
    if (!user) return { ci: null, profile: null };
    const profile = deriveStudentProfile(user);
    return { ci: getCareerIntelligence(profile), profile };
  }, [user]);

  if (!ci) return null;
  const { season, voice, monthName, monthlyFocus, canWait, upcomingSeason } = ci;

  const yearLabel = YEAR_LABELS[profile.studentYear] || 'student';
  const whoYouAre = profile.studentYear === 'recent_grad'
    ? `You're a recent graduate${profile.major ? ` in ${profile.major}` : ''}.`
    : `You're a ${yearLabel}${profile.major ? ` ${profile.major}` : ''} student.`;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '18px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>📍</span>
          <div>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>This Month's Focus</p>
            <p style={{ fontFamily: dm, fontSize: 16, fontWeight: 900, color: '#111827', margin: 0 }}>{whoYouAre}</p>
            <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 600, color: '#9ca3af', margin: 0 }}>Where you should be right now</p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', padding: 4 }}>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <p style={{ fontFamily: dm, fontSize: 12.5, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.55 }}>
        <span style={{ fontWeight: 800, color: '#374151' }}>{season.emoji} {season.name}</span> — {season.why}
      </p>

      <p style={{ fontFamily: dm, fontSize: 12.5, fontWeight: 700, color: '#15803d', margin: '8px 0 0', lineHeight: 1.5 }}>
        🎯 You're right on time. Here's what this month is for:
      </p>

      {expanded && (
        <>
          <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 800, color: '#111827', margin: '14px 0 8px', lineHeight: 1.5 }}>
            {voice} This {monthName}, I'd focus on:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {monthlyFocus.slice(0, 3).map(rec => (
              <div key={rec.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '9px 12px' }}>
                <Check size={14} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>
                    {rec.title}
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
          <button onClick={() => {
            try { base44.analytics.track({ eventName: 'show_my_path_clicked' }); } catch {}
            setShowPath(true);
          }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: dm, fontSize: 12.5, fontWeight: 800, color: '#6d28d9', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: 999, padding: '9px 16px', cursor: 'pointer', marginTop: 12, minHeight: 44 }}>
            Show My Path <ArrowRight size={13} />
          </button>
        </>
      )}
      {showPath && <YourPathForward user={user} onClose={() => setShowPath(false)} />}
    </div>
  );
}
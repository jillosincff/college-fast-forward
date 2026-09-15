import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { daysSince, getStatusGroup } from '@/lib/simpleTracker';
import { INDIGO_DIM } from '@/components/onboarding-flow/onboardingShared';
import { ArrowRight } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";
const SEVEN_DAYS = 7;
const FOLLOW_UP_MIN_DAYS = 3;

// Quiet "Here's what happened last week" strip. Counts from the student's own
// NetworkingPipeline over the last 7 days: applied, follow-ups due, interviews.
// Hidden while loading or when all three are zero. Links to Application History.
export default function WeeklyActivityStrip({ user }) {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    base44.entities.NetworkingPipeline.filter({ user_email: user.email }, '-created_date', 200)
      .then(recs => setRecords(recs || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const counts = useMemo(() => {
    const within7 = (iso) => iso ? daysSince(iso) <= SEVEN_DAYS : false;
    let applied = 0, followUpsDue = 0, interviews = 0;
    for (const r of records) {
      const group = getStatusGroup(r.status);
      if (group === 'applied') {
        if (within7(r.status_date || r.created_date)) applied += 1;
        if (!r.reached_out_date && daysSince(r.created_date) >= FOLLOW_UP_MIN_DAYS) followUpsDue += 1;
      }
      if (group === 'interview' && within7(r.status_date || r.interview_date || r.created_date)) interviews += 1;
    }
    return { applied, followUpsDue, interviews };
  }, [records]);

  if (loading) return null;
  const total = counts.applied + counts.followUpsDue + counts.interviews;
  if (total === 0) return null;

  return (
    <div style={{ fontFamily: dm }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>📈</span>
        <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#111827', margin: 0, flex: 1, minWidth: 120 }}>
          Here's what happened last week
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {counts.applied > 0 && <Pill label="applied" value={counts.applied} />}
          {counts.followUpsDue > 0 && <Pill label="follow-ups due" value={counts.followUpsDue} />}
          {counts.interviews > 0 && <Pill label="interviews" value={counts.interviews} />}
        </div>
        <button onClick={() => navigate('/ApplicationTracker')} style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: INDIGO_DIM, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          View <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <span style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#4c1d95', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 999, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {value} {label}
    </span>
  );
}
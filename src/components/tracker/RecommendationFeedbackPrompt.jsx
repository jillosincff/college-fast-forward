import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { submitRecommendationFeedback } from '@/functions/submitRecommendationFeedback';

const REASONS = [
  ['resume_screen', 'Resume screen'],
  ['gpa_requirement', 'GPA requirement'],
  ['technical_interview', 'Technical interview'],
  ['position_filled', 'Position filled'],
  ['no_response', 'No response'],
  ['other', 'Other'],
];

// CLIFF Learning Engine: when a pursued recommendation was rejected without an
// interview, ask the student what happened — one card at a time.
export default function RecommendationFeedbackPrompt({ user }) {
  const [pending, setPending] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.RecommendationOutcome.filter({ user_email: user.email, rejected: true }, '-updated_date', 20)
      .then(rows => setPending((rows || []).filter(r => (r.pursued || r.applied) && !r.interview && !r.follow_up_completed)))
      .catch(() => {});
  }, [user?.email]);

  const current = pending[0];
  if (!current) return null;

  const answer = async (key) => {
    setSaving(true);
    try { await submitRecommendationFeedback({ outcome_id: current.id, student_feedback: key }); } catch {}
    setPending(p => p.slice(1));
    setSaving(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderLeft: '4px solid #7c3aed', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
        What happened with {current.company_name}?
      </p>
      <p style={{ fontSize: 12.5, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
        This helps CLIFF make smarter recommendations for you — and every student after you.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {REASONS.map(([key, label]) => (
          <button
            key={key}
            disabled={saving}
            onClick={() => answer(key)}
            style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#5b21b6', borderRadius: 100, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', minHeight: 'auto', opacity: saving ? 0.6 : 1 }}
          >
            {label}
          </button>
        ))}
        <button
          disabled={saving}
          onClick={() => setPending(p => p.slice(1))}
          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', minWidth: 'auto' }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
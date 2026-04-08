import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function TrialUsageRecap({ user }) {
  const [stats, setStats] = useState(null);

  const isTrialActive = user?.trial_status === 'active' || user?.fastiq_trial_active === true;
  const isPaying = user?.subscription_status === 'active' || user?.membership_tier === 'fastiq';

  useEffect(() => {
    if (!isTrialActive || isPaying || !user?.email) return;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    Promise.all([
      base44.entities.OutreachDraft.filter({ created_by: user.email }).catch(() => []),
      base44.entities.TailoredResume.filter({ user_email: user.email }).catch(() => []),
    ]).then(([drafts, resumes]) => {
      const weeklyDrafts = drafts.filter(d => d.created_date > weekAgo).length;
      const weeklyResumes = resumes.filter(r => r.created_date > weekAgo).length;
      const alumniSearchCount = user?.alumni_search_used ? 1 : 0;

      setStats({
        alumni: alumniSearchCount,
        drafts: weeklyDrafts,
        resumes: weeklyResumes,
      });
    });
  }, [user?.email, isTrialActive, isPaying]);

  if (!isTrialActive || isPaying || !stats) return null;
  if (stats.alumni === 0 && stats.drafts === 0 && stats.resumes === 0) return null;

  const parts = [];
  if (stats.alumni > 0) parts.push(`ran ${stats.alumni} alumni search${stats.alumni !== 1 ? 'es' : ''}`);
  if (stats.drafts > 0) parts.push(`drafted ${stats.drafts} message${stats.drafts !== 1 ? 's' : ''}`);
  if (stats.resumes > 0) parts.push(`scored your resume ${stats.resumes} time${stats.resumes !== 1 ? 's' : ''}`);

  const sentence = parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];

  return (
    <div style={{
      background: 'rgba(232, 93, 32, 0.08)',
      border: '1px solid rgba(232, 93, 32, 0.2)',
      borderRadius: 12,
      padding: '12px 18px',
      margin: '0 24px 16px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      color: '#1A1A1A',
      lineHeight: 1.5,
    }}>
      ⚡ This week you've {sentence}. Keep going — your trial is still active.
    </div>
  );
}
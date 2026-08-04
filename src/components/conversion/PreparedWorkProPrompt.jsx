import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useProPrompt } from '@/components/conversion/useProPrompt';
import ProTriggerPrompt from '@/components/conversion/ProTriggerPrompt';

// Highest-intent Pro trigger: a free student has a completed overnight package
// waiting for them. Only fires when a recent NightlyBrief exists with prepared
// work. Frequency, suppression, and Pro/excluded gating are handled by the
// conversion engine via useProPrompt.
export default function PreparedWorkProPrompt({ user, onUpgrade }) {
  const [brief, setBrief] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.NightlyBrief.filter({ user_email: user.email }, '-created_date', 1)
      .then(rows => {
        const b = rows?.[0];
        if (!b || !b.prepared_company || b.status === 'actioned') return;
        // Only recent work counts — a week-old brief is stale, not "waiting"
        const ageDays = (Date.now() - new Date(b.created_date).getTime()) / 86400000;
        if (ageDays <= 3) setBrief(b);
      })
      .catch(() => {});
  }, [user?.email]);

  const { eligible, dismiss, clickCta } = useProPrompt({
    user,
    trigger: 'prepared_work_waiting',
    active: !!brief,
    context: { company_name: brief?.prepared_company, job_title: brief?.prepared_role },
  });

  if (!eligible || !brief) return null;

  return (
    <ProTriggerPrompt
      trigger="prepared_work_waiting"
      detail={`CLIFF prepared your ${brief.prepared_company}${brief.prepared_role ? ` (${brief.prepared_role})` : ''} application overnight. Unlock it — and CLIFF keeps preparing one every night.`}
      onCta={() => { clickCta(); onUpgrade?.('CLIFF Pro', 'prepared_work_waiting'); }}
      onDismiss={() => dismiss(false)}
    />
  );
}
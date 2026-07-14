import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getPlan, PLAN_PRO } from '@/lib/entitlements';

// Reads the canonical UserAccessPlan record for the signed-in user.
// Drives plan-based UI states: magic moment availability + prompt exclusion.
export default function useAccessPlan(user) {
  const [accessPlan, setAccessPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    base44.entities.UserAccessPlan.filter({ user_id: user.id })
      .then(r => { if (mounted) setAccessPlan(r?.[0] || null); })
      .catch(() => { if (mounted) setAccessPlan(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user?.id]);

  const isPro = getPlan(user) === PLAN_PRO;
  const magicMomentCompleted = accessPlan?.magic_moment_status === 'completed';
  const magicMomentAvailable = !isPro && !magicMomentCompleted && accessPlan?.magic_moment_eligible !== false;
  // Never show upgrade prompts to Pro users or excluded (internal/test) accounts
  const excludePrompts = isPro || accessPlan?.exclude_upgrade_prompts === true;

  return { accessPlan, loading, isPro, magicMomentAvailable, magicMomentCompleted, excludePrompts };
}
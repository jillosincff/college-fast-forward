import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getPlan, PLAN_PRO } from '@/lib/entitlements';

// Reads the canonical UserAccessPlan record for the signed-in user.
// Drives plan-based UI states: magic moment availability + prompt exclusion.
//
// loadError distinguishes "the record genuinely doesn't exist" (new user, still
// eligible for the Magic Moment) from "the fetch failed" (network/timeout). On
// a failed fetch we must NOT default to "available" — otherwise a transient
// error makes the FirstApplicationPackageCard render for a student who has
// already completed the Magic Moment, conflicting with the Pro conversion card.
export default function useAccessPlan(user) {
  const [accessPlan, setAccessPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    base44.entities.UserAccessPlan.filter({ user_id: user.id })
      .then(r => { if (mounted) { setAccessPlan(r?.[0] || null); setLoadError(false); } })
      .catch(() => { if (mounted) { setAccessPlan(null); setLoadError(true); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user?.id]);

  const isPro = getPlan(user) === PLAN_PRO;
  const magicMomentCompleted = accessPlan?.magic_moment_status === 'completed';
  // Only surface the Magic Moment when we actually confirmed eligibility — a
  // failed fetch (loadError) or a missing record must not default to available.
  const magicMomentAvailable = !loadError && !isPro && !magicMomentCompleted && accessPlan?.magic_moment_eligible !== false;
  // Never show upgrade prompts to Pro users or excluded (internal/test) accounts
  const excludePrompts = isPro || accessPlan?.exclude_upgrade_prompts === true;

  return { accessPlan, loading, loadError, isPro, magicMomentAvailable, magicMomentCompleted, excludePrompts };
}
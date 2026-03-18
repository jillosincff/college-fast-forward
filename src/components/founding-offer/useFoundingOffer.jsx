import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Computes founding member offer state from user record.
 * Offer starts when parent completes onboarding Screen 1 (founding_offer_started_at).
 * Expires 24h later. Never reappears once expired or dismissed.
 */
export default function useFoundingOffer(user) {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef(null);
  const expiredFlaggedRef = useRef(false);

  // Tick every second for live countdown
  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const startedAt = user?.founding_offer_started_at;
  const dismissed = user?.founding_offer_dismissed === true;
  const activated = user?.fastiq_active === true ||
    user?.subscription_status === 'active' ||
    user?.membership_tier === 'fastiq';
  const expired = user?.founding_offer_expired === true;

  if (!startedAt || dismissed || activated || expired) {
    return { active: false, remaining: 0, display: '00:00:00' };
  }

  const expiresAt = new Date(startedAt).getTime() + 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, expiresAt - now);

  // Auto-flag expired in backend (once)
  if (remaining <= 0 && !expiredFlaggedRef.current) {
    expiredFlaggedRef.current = true;
    base44.auth.updateMe({ founding_offer_expired: true }).catch(() => {});
    return { active: false, remaining: 0, display: '00:00:00' };
  }

  if (remaining <= 0) {
    return { active: false, remaining: 0, display: '00:00:00' };
  }

  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const display = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { active: true, remaining, display, expiresAt };
}
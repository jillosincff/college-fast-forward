import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const device = () => (window.innerWidth < 768 ? 'mobile' : 'desktop');

// One passive Pro prompt per page, max — module-level flag resets on navigation/reload
let promptShownOnPage = false;

// Frequency-controlled contextual Pro prompt hook.
// Rules enforced: never for Pro/excluded users (backend), never the same trigger
// twice per session, one passive prompt per page, 7-day suppression after
// "Continue with Free" (backend) — unless the student initiates a Pro-only action.
export function useProPrompt({ user, trigger, active = true, userInitiated = false, context = {} }) {
  const [eligible, setEligible] = useState(false);
  const contextRef = useRef(context);
  contextRef.current = context;

  useEffect(() => {
    if (!active || !user?.email || !trigger) return;
    if (!userInitiated) {
      if (promptShownOnPage) return;
      try { if (sessionStorage.getItem(`cff_prompt_${trigger}`)) return; } catch {}
    }
    let cancelled = false;
    base44.functions.invoke('conversionEngine', { action: 'promptCheck', trigger, user_initiated: userInitiated })
      .then(res => {
        const d = res?.data || res;
        if (cancelled || !d?.eligible) return;
        if (!userInitiated) {
          if (promptShownOnPage) return;
          promptShownOnPage = true;
          try { sessionStorage.setItem(`cff_prompt_${trigger}`, '1'); } catch {}
        }
        setEligible(true);
        base44.functions.invoke('conversionEngine', {
          action: 'promptAction', trigger, act: 'shown', device: device(), ...contextRef.current,
        }).catch(() => {});
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.email, trigger, active, userInitiated]);

  const dismiss = (explicitContinueFree = false) => {
    setEligible(false);
    base44.functions.invoke('conversionEngine', {
      action: 'promptAction', trigger, act: explicitContinueFree ? 'continue_free' : 'dismissed', device: device(),
    }).catch(() => {});
  };

  const clickCta = () => {
    setEligible(false);
    base44.functions.invoke('conversionEngine', {
      action: 'promptAction', trigger, act: 'cta_clicked', device: device(), ...contextRef.current,
    }).catch(() => {});
  };

  return { eligible, dismiss, clickCta };
}
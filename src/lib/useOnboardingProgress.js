import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const LOCAL_KEY = 'cff_onboarding_v2_progress';

const readLocal = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeLocal = (state) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    /* private browsing */
  }
};

const clearLocal = () => {
  try { localStorage.removeItem(LOCAL_KEY); } catch { /* ok */ }
};

/**
 * Persists onboarding progress (current screen index + collected answers) to
 * FastTrackProProfile so a student who quits mid-flow can resume on next launch.
 * Falls back to localStorage when offline / unauthenticated.
 *
 * Required FastTrackProProfile fields (add via Base44 admin):
 *   - onboarding_step: number
 *   - onboarding_answers: json
 */
export function useOnboardingProgress(user) {
  const [step, setStepState] = useState(0);
  const [answers, setAnswersState] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const profileIdRef = useRef(null);
  const writeTimerRef = useRef(null);

  // Hydrate from server (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      const local = readLocal();
      if (local) {
        if (!cancelled) {
          setStepState(local.step || 0);
          setAnswersState(local.answers || {});
        }
      }

      if (!user?.email) {
        if (!cancelled) setHydrated(true);
        return;
      }

      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
        const profile = profiles?.[0];
        if (profile) {
          profileIdRef.current = profile.id;
          // Server wins if it has progress (durable across devices).
          const serverStep = typeof profile.onboarding_step === 'number' ? profile.onboarding_step : null;
          const serverAnswers = profile.onboarding_answers && typeof profile.onboarding_answers === 'object'
            ? profile.onboarding_answers
            : null;
          if (!cancelled && serverStep !== null) setStepState(serverStep);
          if (!cancelled && serverAnswers) setAnswersState(serverAnswers);
        }
      } catch {
        /* offline / no profile yet — keep local */
      }

      if (!cancelled) setHydrated(true);
    };
    hydrate();
    return () => { cancelled = true; };
  }, [user?.email]);

  const persist = useCallback((nextStep, nextAnswers) => {
    writeLocal({ step: nextStep, answers: nextAnswers });

    if (!user?.email) return;

    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(async () => {
      const payload = {
        user_email: user.email,
        onboarding_step: nextStep,
        onboarding_answers: nextAnswers,
      };
      try {
        if (profileIdRef.current) {
          await base44.entities.FastTrackProProfile.update(profileIdRef.current, payload);
        } else {
          const created = await base44.entities.FastTrackProProfile.create(payload);
          if (created?.id) profileIdRef.current = created.id;
        }
      } catch {
        /* server write failed — local copy still kept */
      }
    }, 250);
  }, [user?.email]);

  const setStep = useCallback((next) => {
    setStepState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      persist(value, answersRef.current);
      return value;
    });
  }, [persist]);

  // Keep a ref of the latest answers so persist can read it inside setStep.
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const setAnswer = useCallback((key, value) => {
    setAnswersState((prev) => {
      const next = { ...prev, [key]: value };
      answersRef.current = next;
      persist(stepRef.current, next);
      return next;
    });
  }, [persist]);

  const stepRef = useRef(step);
  useEffect(() => { stepRef.current = step; }, [step]);

  const reset = useCallback(() => {
    setStepState(0);
    setAnswersState({});
    answersRef.current = {};
    stepRef.current = 0;
    clearLocal();
  }, []);

  return { step, answers, hydrated, setStep, setAnswer, reset };
}

export const ONBOARDING_LOCAL_KEY = LOCAL_KEY;

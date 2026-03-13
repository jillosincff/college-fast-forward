import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const FunnelContext = createContext(null);

export function useFunnel() {
  return useContext(FunnelContext);
}

export function FunnelProvider({ children, onClose }) {
  const [path, setPath] = useState(null); // 'known' | 'explorer' | null
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('entry'); // entry | quiz | teaser | score | paywall
  const [matchData, setMatchData] = useState(null);
  const phaseRef = useRef(phase);
  const stepRef = useRef(step);
  const pathRef = useRef(path);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { pathRef.current = path; }, [path]);

  // Track funnel_dropped when user leaves without completing checkout
  useEffect(() => {
    return () => {
      const p = phaseRef.current;
      if (p && p !== 'entry' && p !== 'paywall') {
        base44.analytics.track({
          eventName: 'funnel_dropped',
          properties: { phase: p, step: stepRef.current, path: pathRef.current || 'unknown' },
        });
      }
    };
  }, []);

  const updateAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => Math.max(0, s - 1));

  return (
    <FunnelContext.Provider value={{
      path, setPath,
      step, setStep, nextStep, prevStep,
      answers, updateAnswer,
      phase, setPhase,
      matchData, setMatchData,
      onClose,
    }}>
      {children}
    </FunnelContext.Provider>
  );
}
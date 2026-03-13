import React, { createContext, useContext, useState } from 'react';

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
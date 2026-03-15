import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { mockInterviewAI } from '@/functions/mockInterviewAI';

import InterviewSetup from '@/components/mock-interview/InterviewSetup';
import InterviewScreen from '@/components/mock-interview/InterviewScreen';
import InterviewResults from '@/components/mock-interview/InterviewResults';
import InterviewHistory from '@/components/mock-interview/InterviewHistory';

export default function MockInterview() {
  const { user } = useAuth();
  const [view, setView] = useState('setup'); // setup | loading | interview | results | history
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  // Check URL params for pre-fill
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const prefillCompany = params.get('company') || '';
  const prefillType = params.get('type') || '';

  const handleStart = async (config) => {
    setView('loading');
    setError(null);
    try {
      const res = await mockInterviewAI({
        action: 'generate',
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        companyName: config.companyName,
        jobTitle: config.jobTitle,
        questionCount: config.questionCount,
      });
      if (res.data?.success) {
        setSession(res.data.session);
        setView('interview');
      } else {
        setError(res.data?.error || 'Failed to start interview');
        setView('setup');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setView('setup');
    }
  };

  const handleComplete = async (updatedSession) => {
    setSession(updatedSession);
    setView('results');
  };

  const handleBackToSetup = () => {
    setView('setup');
    setSession(null);
    setError(null);
  };

  if (user === undefined) return null;
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#888' }}>Sign in to practice interviews</p>
    </div>
  );

  if (view === 'loading') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
        <style>{`@keyframes miBolt{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:0.7}}`}</style>
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ animation: 'miBolt 2s ease infinite', marginBottom: 16 }}>
          <path d="M26 2L6 30h20l-4 18L42 18H22l4-16z" stroke="#E85D20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.5)' }}>
          Preparing your interview questions...
        </p>
      </div>
    );
  }

  if (view === 'interview' && session) {
    return <InterviewScreen session={session} onComplete={handleComplete} onEnd={() => setView('setup')} userEmail={user.email} />;
  }

  if (view === 'results' && session) {
    return <InterviewResults session={session} onPracticeAgain={handleBackToSetup} onViewHistory={() => setView('history')} />;
  }

  if (view === 'history') {
    return <InterviewHistory userId={user.id} userEmail={user.email} onBack={handleBackToSetup} />;
  }

  return (
    <InterviewSetup
      onStart={handleStart}
      onViewHistory={() => setView('history')}
      error={error}
      prefillCompany={prefillCompany}
      prefillType={prefillType}
    />
  );
}
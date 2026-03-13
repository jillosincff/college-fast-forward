import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ProAssessment from '../components/fast-track-pro/ProAssessment';
import FastIQCommandCenter from '../components/fastiq/FastIQCommandCenter';
import ProAgentChat from '../components/fast-track-pro/ProAgentChat';
import ParentFastIQView from '../components/fasttrack/ParentFastIQView';

export default function FastIQ() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading');
  const [chatInitialMessage, setChatInitialMessage] = useState('');
  const { toast } = useToast();
  const onboardHandled = useRef(false);

  // Check for URL params
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const highlightAlerts = urlParams.get('view') === 'alerts';
  const isCheckoutSuccess = urlParams.get('checkout') === 'success';

  // Handle post-checkout quiz answer persistence
  useEffect(() => {
    if (!isCheckoutSuccess || onboardHandled.current || !user) return;
    onboardHandled.current = true;

    const stored = sessionStorage.getItem('fastiq_quiz_answers');
    if (!stored) return;

    (async () => {
      try {
        const { onboardFromQuiz } = await import('@/functions/onboardFromQuiz');
        await onboardFromQuiz({ quizAnswers: JSON.parse(stored) });
        sessionStorage.removeItem('fastiq_quiz_answers');
        toast({
          title: 'Welcome! Your profile is set up',
          description: 'Check your alumni matches — they\'re ready for you.',
        });
      } catch (err) {
        console.error('Post-checkout onboarding failed:', err);
      }
      // Clean up URL
      window.location.hash = 'FastIQ';
    })();
  }, [isCheckoutSuccess, user]);

  // P0 FIX: Only compute isParent when user is confirmed loaded (not undefined)
  const isParent = user ? (user.persona === 'parent' || user.roles?.includes('parent')) : false;

  useEffect(() => {
    if (user === undefined) return; // Auth still loading
    if (!user) { setLoading(false); return; }
    if (isParent) { setLoading(false); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
    if (profiles.length > 0 && profiles[0].assessment_complete) {
      setProfile(profiles[0]);
      setView('dashboard');
    } else {
      setView('assessment');
    }
    setLoading(false);
  };

  const handleAssessmentComplete = (newProfile, openChatWith) => {
    setProfile(newProfile);
    if (openChatWith) {
      setChatInitialMessage(openChatWith);
      setView('chat');
    } else {
      setView('dashboard');
    }
  };

  const handleOpenChat = (initialMessage) => {
    setChatInitialMessage(initialMessage || '');
    setView('chat');
  };

  const handleBackFromChat = () => {
    setChatInitialMessage('');
    setView('dashboard');
    loadProfile(); // Refresh profile data after chat session
  };

  // P2 FIX: Force command center data refetch after assessment re-run
  const handleAssessmentRerun = () => {
    setChatInitialMessage('');
    setView('assessment');
  };

  // P0 FIX: Show loading while auth is resolving (user === undefined)
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F172A' }}>
        <div className="text-center">
          <Zap className="w-10 h-10 text-orange-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2 tracking-tight">Sign in to access FASTIQ™</h2>
          <p className="text-slate-400 mb-5 text-sm">Your intelligent networking engine</p>
          <Button
            onClick={() => base44.auth.redirectToLogin()}
            className="text-white text-sm font-bold px-6"
            style={{ background: '#FA4616' }}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isParent) {
    return <ParentFastIQView user={user} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (view === 'assessment') {
    return <ProAssessment user={user} existingProfile={profile} onComplete={handleAssessmentComplete} />;
  }

  if (view === 'chat') {
    return (
      <ProAgentChat
        user={user}
        profile={profile}
        initialMessage={chatInitialMessage}
        onBack={handleBackFromChat}
        onRerunAssessment={handleAssessmentRerun}
      />
    );
  }

  return <FastIQCommandCenter user={user} profile={profile} onOpenChat={handleOpenChat} onProfileUpdated={setProfile} highlightAlerts={highlightAlerts} />;
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProAssessment from '../components/fast-track-pro/ProAssessment';
import FastTrackDashboard from '../components/fasttrack/FastTrackDashboard';
import ProAgentChat from '../components/fast-track-pro/ProAgentChat';

export default function FastTrackPro() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading');
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
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

  const handleAssessmentComplete = (newProfile) => {
    setProfile(newProfile);
    setView('dashboard');
  };

  const handleOpenChat = (initialMessage) => {
    setChatInitialMessage(initialMessage || '');
    setView('chat');
  };

  const handleBackFromChat = () => {
    setChatInitialMessage('');
    setView('dashboard');
    loadProfile();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #060A12 0%, #0C1624 100%)' }}>
        <div className="text-center">
          <Zap className="w-10 h-10 text-white/25 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white/90 mb-2 tracking-tight">Sign in to access FASTIQ™</h2>
          <p className="text-white/30 mb-5 text-sm">Your intelligent networking engine</p>
          <Button
            onClick={() => base44.auth.redirectToLogin()}
            className="text-white border text-sm font-medium px-6"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #060A12 0%, #0C1624 100%)' }}>
        <Loader2 className="w-7 h-7 text-white/25 animate-spin" />
      </div>
    );
  }

  if (view === 'assessment') {
    return <ProAssessment user={user} onComplete={handleAssessmentComplete} />;
  }

  if (view === 'chat') {
    return <ProAgentChat user={user} profile={profile} initialMessage={chatInitialMessage} onBack={handleBackFromChat} />;
  }

  return <FastTrackDashboard user={user} profile={profile} onOpenChat={handleOpenChat} />;
}
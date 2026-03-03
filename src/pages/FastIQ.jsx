import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProAssessment from '../components/fast-track-pro/ProAssessment';
import FastTrackDashboard from '../components/fasttrack/FastTrackDashboard';
import ProAgentChat from '../components/fast-track-pro/ProAgentChat';
import ParentFastIQView from '../components/fasttrack/ParentFastIQView';

export default function FastIQ() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading');
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  // Check for ?view=alerts URL param
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const highlightAlerts = urlParams.get('view') === 'alerts';

  const isParent = user?.persona === 'parent' || user?.roles?.includes('parent');

  useEffect(() => {
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
        onRerunAssessment={() => { setChatInitialMessage(''); setView('assessment'); }}
      />
    );
  }

  return <FastTrackDashboard user={user} profile={profile} onOpenChat={handleOpenChat} highlightAlerts={highlightAlerts} />;
}
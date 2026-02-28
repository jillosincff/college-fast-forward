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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Zap className="w-12 h-12 text-[#FA4616] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to access Fast Track Pro</h2>
          <p className="text-slate-600 mb-4">AI-powered career intelligence for UF Gators</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin" />
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
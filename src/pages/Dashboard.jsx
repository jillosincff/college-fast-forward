import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { getUserMessages } from '@/functions/getUserMessages';
import { Loader2 } from 'lucide-react';

import DashboardNav from '@/components/dashboard-v2/DashboardNav';
import DashboardHero from '@/components/dashboard-v2/DashboardHero';
import NextActionCard from '@/components/dashboard-v2/NextActionCard';
import MatchesSectionV2 from '@/components/dashboard-v2/MatchesSection';
import MessagesSectionV2 from '@/components/dashboard-v2/MessagesSection';
import KarmaStrip from '@/components/dashboard-v2/KarmaStrip';
import HelpRequestCard from '@/components/dashboard-v2/HelpRequestCard';
import ParentInviteCard from '@/components/dashboard-v2/ParentInviteCard';
import InviteParentModal from '@/components/dashboard/InviteParentModal';
import LogIntroModal from '@/components/challenge/LogIntroModal';
import NewUserWelcome from '@/components/dashboard/student/NewUserWelcome';

const dmSans = "'DM Sans', system-ui, sans-serif";

const FONT_LINK_ID = 'dash-v2-fonts';
function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(link);
}

const STYLE_ID = 'dash-v2-keyframes';
function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes dashFadeUp {
      from { opacity:0; transform:translateY(12px); }
      to { opacity:1; transform:translateY(0); }
    }
    .dash-fade { animation: dashFadeUp 0.4s ease both; }
  `;
  document.head.appendChild(s);
}

export default function Dashboard() {
  const { user, isLoading, refreshUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLogIntroModal, setShowLogIntroModal] = useState(false);
  const [helpRequest, setHelpRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [myActiveQuestions, setMyActiveQuestions] = useState(0);
  const [fastiqStats, setFastiqStats] = useState({ newOpportunities: 0, newAlumni: 0 });
  const [linkedParents, setLinkedParents] = useState([]);
  const loadStartedRef = useRef(false);

  useEffect(() => { ensureFonts(); ensureKeyframes(); }, []);

  // Route guards
  useEffect(() => {
    if (isLoading) return;
    if (!user) { navigate('LandingPage'); return; }
    if (user.persona === 'parent') { navigate('ParentDashboard'); return; }
    if (user.persona === 'alumni' || user.roles?.includes('alumni')) {
      navigate(user.alumni_intent === 'help_students' ? 'ParentDashboard' : 'AlumniDashboard');
      return;
    }
    if (user.roles?.includes('admin')) { navigate('AdminDashboard'); return; }
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    localStorage.setItem('cff:seenDashboard', 'true');
    loadDashboardData();
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    setLoadingData(true);

    // Help request
    let foundRequest = null;
    try {
      const jobRequests = await base44.entities.JobRequest.filter(
        { created_by: user.email, status: 'active' }, '-created_date', 1
      );
      if (jobRequests?.length > 0) foundRequest = jobRequests[0];
    } catch (e) { console.error('JobRequest filter failed:', e); }

    if (!foundRequest) {
      try {
        const all = await base44.entities.HelpRequest.list('-created_date', 50);
        const mine = (all || []).filter(r =>
          r.status === 'active' &&
          (r.student_email === user.email || r.created_by === user.email || r.student_id === user.id)
        );
        if (mine.length > 0) foundRequest = mine[0];
      } catch (e) { console.error('HelpRequest list failed:', e); }
    }
    setHelpRequest(foundRequest || null);

    // Count active questions
    let totalQ = 0;
    try {
      const jrs = await base44.entities.JobRequest.filter({ created_by: user.email, status: 'active' });
      totalQ += jrs?.length || 0;
      const jrsByPoster = await base44.entities.JobRequest.filter({ poster_email: user.email, status: 'active' });
      const ids = new Set((jrs || []).map(r => r.id));
      (jrsByPoster || []).forEach(r => { if (!ids.has(r.id)) totalQ++; });
      const hrs = await base44.entities.HelpRequest.filter({ student_email: user.email, status: 'active' });
      totalQ += hrs?.length || 0;
    } catch (e) { console.error('Count questions failed:', e); }
    setMyActiveQuestions(totalQ);

    try {
      // Messages
      try {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000));
        const { data: msgRes } = await Promise.race([getUserMessages(), timeout]);
        setMessages(msgRes?.messages || []);
      } catch (e) { setMessages([]); }

      // Matches
      let studentMatches = [];
      try {
        studentMatches = await base44.entities.Match.filter({ student_email: user.email }, '-match_score', 50);
        if ((!studentMatches || studentMatches.length === 0) && foundRequest) {
          studentMatches = await base44.entities.Match.filter({ help_request_id: foundRequest.id }, '-match_score', 50);
        }
        if (!studentMatches?.length) {
          studentMatches = await base44.entities.Match.filter({ student_id: user.id }, '-match_score', 50);
        }
      } catch (e) { studentMatches = []; }
      setMatches(studentMatches || []);

      // FASTIQ stats
      try {
        const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: user.email });
        const profile = profiles?.[0];
        if (profile) {
          setFastiqStats({
            newOpportunities: profile.new_alerts_count || 0,
            newAlumni: profile.alumni_discovered || 0,
          });
        }
      } catch (e) { /* non-critical */ }

      // Linked parents
      try {
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000));
        const result = await Promise.race([base44.functions.invoke('getLinkedParents', {}), timeout]);
        if (result.data?.parents) setLinkedParents(result.data.parents);
      } catch (e) { /* non-critical */ }
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setLoadingData(false);
      setInitialLoadComplete(true);
    }
  };

  if (isLoading || !user || !initialLoadComplete) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f2ee' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#E85D20', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isNewUser = !helpRequest && myActiveQuestions === 0;

  const onMessageMatch = (match) => {
    const name = match.parent_name || match.peer_name || 'Helper';
    const email = match.parent_email || match.peer_email;
    navigate(`MessageComposer?to=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&matchId=${match.id}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee' }}>
      {/* Nav */}
      <DashboardNav user={user} currentPage="Dashboard" />

      {/* Hero */}
      <div className="dash-fade" style={{ animationDelay: '0s' }}>
        <DashboardHero user={user} fastiqStats={fastiqStats} />
      </div>

      {/* Body */}
      <div className="dash-body" style={{ maxWidth: 860, margin: '0 auto', padding: '24px 24px 60px' }}>
        <style>{`
          @media(max-width:768px) {
            .dash-body { padding: 16px 16px 48px !important; }
          }
        `}</style>

        {/* New user welcome */}
        {isNewUser && (
          <div className="dash-fade" style={{ animationDelay: '0.08s', marginBottom: 20 }}>
            <NewUserWelcome user={user} />
          </div>
        )}

        {/* Section 1: Next Action */}
        {!isNewUser && (
          <div className="dash-fade" style={{ animationDelay: '0.06s', marginBottom: 20 }}>
            <NextActionCard messages={messages} matches={matches} />
          </div>
        )}

        {/* Section 2: Matches */}
        {matches.length > 0 && (
          <div className="dash-fade" style={{ animationDelay: '0.12s', marginBottom: 20 }}>
            <MatchesSectionV2 matches={matches} user={user} onMessageMatch={onMessageMatch} />
          </div>
        )}

        {/* Section 3: Help Request */}
        <div className="dash-fade" style={{ animationDelay: '0.18s', marginBottom: 20 }}>
          <HelpRequestCard helpRequest={helpRequest} user={user} />
        </div>

        {/* Section 4: Parent Invite */}
        <div className="dash-fade" style={{ animationDelay: '0.24s', marginBottom: 20 }}>
          <ParentInviteCard user={user} linkedParents={linkedParents} onInviteParent={() => setShowInviteModal(true)} />
        </div>

        {/* Section 5: Messages */}
        <div className="dash-fade" style={{ animationDelay: '0.30s', marginBottom: 20 }}>
          <MessagesSectionV2 messages={messages} />
        </div>

        {/* Section 6: Karma */}
        <div className="dash-fade" style={{ animationDelay: '0.36s', marginBottom: 20 }}>
          <KarmaStrip user={user} />
        </div>
      </div>

      {/* Modals */}
      <InviteParentModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={async () => {
          await refreshUser();
          loadStartedRef.current = false;
          await loadDashboardData();
        }}
      />
      {showLogIntroModal && (
        <LogIntroModal
          isOpen={showLogIntroModal}
          onClose={() => setShowLogIntroModal(false)}
          user={user}
          matches={matches}
          onSuccess={async () => {
            setShowLogIntroModal(false);
            await refreshUser();
            loadStartedRef.current = false;
            await loadDashboardData();
          }}
        />
      )}
    </div>
  );
}
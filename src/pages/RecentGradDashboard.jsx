import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

import RGNav from '../components/recent-grad/RGNav';
import RGHero from '../components/recent-grad/RGHero';
import RGParentNudge from '../components/recent-grad/RGParentNudge';
import RGProfileNudge from '../components/recent-grad/RGProfileNudge';
import RGActiveRequest from '../components/recent-grad/RGActiveRequest';
import RGMembersHelp from '../components/recent-grad/RGMembersHelp';
import RGRecentActivity from '../components/recent-grad/RGRecentActivity';

const dmSans = "'DM Sans', system-ui, sans-serif";

function getDisplayName(input) {
  if (!input) return 'Member';
  let name = input.trim();
  // Handle email addresses
  if (name.includes('@')) name = name.split('@')[0];
  // Handle usernames with dots or underscores — capitalize parts
  if (!name.includes(' ') && (name.includes('.') || name.includes('_'))) {
    const parts = name.split(/[._]+/).filter(Boolean);
    name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  // Handle single-word usernames (e.g. "lindseyosinoff") — try to capitalize
  if (!name.includes(' ')) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

export default function RecentGradDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [liveActivity, setLiveActivity] = useState([]);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showPostRequest, setShowPostRequest] = useState(false);

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('rg-dash-fonts')) {
      const link = document.createElement('link');
      link.id = 'rg-dash-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (user?.email) loadData();
  }, [user?.email]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobReqs, myAnswers, myMsgs, recentAnswers] = await Promise.all([
        base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 100),
        base44.entities.Answer.filter({ answerer_email: user.email }, '-created_date', 20),
        base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 10),
        base44.entities.Answer.filter({}, '-created_date', 30),
      ]);

      setAllRequests(jobReqs);
      setAnswers(myAnswers);
      setMessages(myMsgs);

      // My active requests
      const mine = jobReqs.filter(r => r.poster_email === user.email);
      setMyRequests(mine);

      // Build matches — fetch directory users
      let directoryUsers = [];
      try {
        const { getDirectoryUsers } = await import('@/functions/getDirectoryUsers');
        const res = await getDirectoryUsers();
        directoryUsers = res?.data?.data || [];
      } catch { }

      const alumniAndParents = directoryUsers.filter(u =>
        u.email !== user.email &&
        (u.persona === 'parent' || u.persona === 'alumni' || u.roles?.includes('parent') || u.roles?.includes('alumni'))
      );

      // Simple matching: filter those with expertise areas
      const matchedMembers = alumniAndParents
        .filter(u => (u.expertise_areas && u.expertise_areas.length > 0) || u.industry || u.job_title)
        .map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          displayName: getDisplayName(u.full_name),
          jobTitle: u.job_title || u.current_position || '',
          company: u.company || u.current_company || '',
          matchedCategories: (u.expertise_areas || []).slice(0, 3),
        }))
        .slice(0, 20);
      setMatches(matchedMembers);

      // Live activity from recent answers
      const tickerItems = recentAnswers.slice(0, 10).map(a => {
        const name = getDisplayName(a.answerer_name);
        return `${name} helped a student`;
      });
      setLiveActivity(tickerItems);

    } catch (err) {
      console.error('Failed to load recent grad dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Karma calculation
  const karma = useMemo(() => {
    const answerKarma = answers.reduce((total, a) => {
      let pts = 10;
      pts += (a.upvote_count || 0) * 5;
      if (a.is_best_answer) pts += 50;
      return total + pts;
    }, 0);
    return answerKarma + (user?.karma_points || 0);
  }, [answers, user?.karma_points]);

  // Response count for my requests
  const responseCount = useMemo(() => {
    return myRequests.reduce((sum, r) => sum + (r.answer_count || 0), 0);
  }, [myRequests]);

  // Queue position
  const queuePosition = useMemo(() => {
    if (myRequests.length === 0) return 0;
    const idx = allRequests.findIndex(r => r.id === myRequests[0]?.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [allRequests, myRequests]);

  // Profile completion
  const profilePercent = useMemo(() => {
    const fields = [user?.linkedin_url, user?.target_role, user?.bio, user?.profile_image, user?.industry];
    return fields.filter(Boolean).length * 20;
  }, [user]);

  // Parent linked?
  const parentLinked = !!(user?.linked_parent_id || user?.linked_parent_email);

  // Recent activity (messages sent)
  const recentActivities = useMemo(() => {
    return messages.slice(0, 5).map(m => ({
      recipientName: getDisplayName(m.recipient_name || m.recipient_email?.split('@')[0]),
      preview: m.body?.slice(0, 60) || m.subject || '',
      date: m.created_date,
      hasReply: m.reply_count > 0 || false,
      helpTag: m.post_title ? 'networking' : '',
    }));
  }, [messages]);

  // Help tags from user profile
  const helpTags = useMemo(() => {
    const tags = new Set();
    if (user?.help_types) user.help_types.forEach(t => tags.add(t));
    if (user?.expertise_areas) user.expertise_areas.forEach(t => tags.add(t));
    myRequests.forEach(r => (r.help_types || []).forEach(t => tags.add(t)));
    return [...tags].slice(0, 4);
  }, [user, myRequests]);

  const handleScrollToRequest = () => {
    document.getElementById('active-request-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePostRequest = () => navigate('PostRequest');
  const handleEditRequest = (req) => navigate('PostRequest', { edit: req.id });
  const handleInviteParent = () => navigate('GatorParentInvite');
  const handleMessage = (member) => navigate('MessageComposer', { to: member.email });

  if ((loading && !user) || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E85D20', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', fontFamily: dmSans }}>
      {/* Nav */}
      <RGNav user={user} currentPage="RecentGradDashboard" />

      {/* Hero */}
      <RGHero
        karma={karma}
        responseCount={responseCount}
        activeRequestCount={myRequests.length}
        matchCount={matches.length}
        hasActiveRequest={myRequests.length > 0}
        onPostRequest={handlePostRequest}
        onScrollToRequest={handleScrollToRequest}
        liveActivity={liveActivity}
      />

      {/* Body */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Section 2 — Parent nudge */}
        {!parentLinked && (
          <RGParentNudge onInviteParent={handleInviteParent} />
        )}

        {/* Section 3 — Profile nudge */}
        {profilePercent < 100 && (
          <RGProfileNudge percent={profilePercent} />
        )}

        {/* Section 4 — Active Request */}
        <RGActiveRequest
          request={myRequests[0] || null}
          queuePosition={queuePosition}
          responseCount={responseCount}
          onPostRequest={handlePostRequest}
          onEditRequest={handleEditRequest}
        />

        {/* Section 5 — Members who can help */}
        <RGMembersHelp
          members={matches}
          total={matches.length}
          helpTags={helpTags}
          onMessage={handleMessage}
          loading={loading}
        />

        {/* Section 6 — Recent activity */}
        {messages.length > 0 && (
          <RGRecentActivity activities={recentActivities} />
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: '#f4f2ee', borderTop: '1px solid #e5e7eb', padding: '32px 20px',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, color: '#aaa', marginBottom: 8 }}>
          © {new Date().getFullYear()} College Fast Forward. All Rights Reserved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <a href="#Terms" style={{ fontFamily: dmSans, fontSize: 12, color: '#aaa', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#Privacy" style={{ fontFamily: dmSans, fontSize: 12, color: '#aaa', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#CookiePolicy" style={{ fontFamily: dmSans, fontSize: 12, color: '#aaa', textDecoration: 'none' }}>Cookie Policy</a>
        </div>
      </footer>
    </div>
  );
}
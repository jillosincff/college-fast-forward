import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';

import AlumniHelperNav from '../components/alumni-helper/AlumniHelperNav';
import AlumniHelperHero from '../components/alumni-helper/AlumniHelperHero';
import AlumniProfileNudge from '../components/alumni-helper/AlumniProfileNudge';
import AlumniQuestionsFeed from '../components/alumni-helper/AlumniQuestionsFeed';
import AlumniRecentActivity from '../components/alumni-helper/AlumniRecentActivity';
import AlumniImpactSnapshot from '../components/alumni-helper/AlumniImpactSnapshot';

const dmSans = "'DM Sans', system-ui, sans-serif";

function getDisplayName(fullName) {
  if (!fullName) return 'Student';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0)}.`;
}

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myAnswers, setMyAnswers] = useState([]);
  const [studentQuestions, setStudentQuestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [introsMade, setIntrosMade] = useState(0);

  useEffect(() => {
    if (!document.getElementById('alumni-dash-fonts')) {
      const link = document.createElement('link');
      link.id = 'alumni-dash-fonts';
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
      const [jobReqs, answers, sentMsgs] = await Promise.all([
        base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 100),
        base44.entities.Answer.filter({ answerer_email: user.email }, '-created_date', 50),
        base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 20),
      ]);

      setMyAnswers(answers || []);
      setMessages(sentMsgs || []);

      // Student questions — match to alumni's industry
      const studentQs = (jobReqs || []).filter(r => !r.is_alumni_career_request && r.poster_type === 'student');
      const matched = matchQuestionsToAlumni(studentQs, user);
      setStudentQuestions(matched);

      // Count intros (messages that were intro_offer type or tied to a post)
      const introMessages = (sentMsgs || []).filter(m => m.message_type === 'intro_offer' || m.post_id);
      setIntrosMade(introMessages.length);
    } catch (err) {
      console.error('Failed to load alumni dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchQuestionsToAlumni = (questions, alumniUser) => {
    const alumniIndustry = (alumniUser.industry || '').toLowerCase();
    return questions.map(q => {
      let score = 0;
      let matchReason = null;
      if (q.target_industry?.toLowerCase() === alumniIndustry && alumniIndustry) {
        score += 50;
        matchReason = `Matches your ${alumniUser.industry} background`;
      }
      const hoursOld = (Date.now() - new Date(q.created_date).getTime()) / (1000 * 60 * 60);
      if (hoursOld < 6) score += 25;
      else if (hoursOld < 24) score += 20;
      else if (hoursOld < 48) score += 10;
      if ((q.answer_count || 0) === 0) score += 25;
      return { ...q, matchScore: score, matchReason };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  // Computed stats
  const karma = useMemo(() => {
    const answerKarma = myAnswers.reduce((total, a) => {
      let pts = 10;
      pts += (a.upvote_count || 0) * 5;
      if (a.is_best_answer) pts += 50;
      return total + pts;
    }, 0);
    return answerKarma + (user?.karma_points || 0);
  }, [myAnswers, user?.karma_points]);

  const studentsHelped = useMemo(() => {
    return myAnswers.filter(a => a.question_type !== 'alumni_request').length;
  }, [myAnswers]);

  const needAnswersCount = useMemo(() => {
    return studentQuestions.filter(q => (q.answer_count || 0) === 0).length;
  }, [studentQuestions]);

  const profilePercent = useMemo(() => {
    const fields = [user?.company || user?.current_company, user?.linkedin_url, user?.job_title || user?.current_position, user?.profile_image, user?.industry];
    return fields.filter(Boolean).length * 20;
  }, [user]);

  // Recent activity from sent messages
  const recentActivities = useMemo(() => {
    return (messages || []).slice(0, 5).map(m => ({
      recipientName: m.recipient_name || m.recipient_email?.split('@')[0] || 'Student',
      preview: m.body?.slice(0, 60) || m.subject || '',
      date: m.created_date,
      hasReply: false,
      helpTag: m.post_title || '',
    }));
  }, [messages]);

  const expertiseArea = user?.industry || (user?.expertise_areas?.[0]) || '';

  if (loading || !user) {
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
      <AlumniHelperNav user={user} currentPage="AlumniDashboard" />

      {/* Hero */}
      <AlumniHelperHero
        user={user}
        karma={karma}
        studentsHelped={studentsHelped}
        matchedQuestionsCount={studentQuestions.length}
        hasAnswered={myAnswers.length > 0}
        hasIntro={introsMade > 0}
        profileComplete={profilePercent >= 100}
      />

      {/* Body */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Section 2 — Profile nudge */}
        <AlumniProfileNudge percent={profilePercent} />

        {/* Section 3 — Student questions feed */}
        <AlumniQuestionsFeed
          questions={studentQuestions}
          totalCount={studentQuestions.length}
          needAnswersCount={needAnswersCount}
          expertiseArea={expertiseArea}
          pledgeCount={user?.weekly_pledge_count || 0}
        />

        {/* Section 4 — Recent activity */}
        <AlumniRecentActivity activities={recentActivities} />

        {/* Section 5 — Impact snapshot */}
        <AlumniImpactSnapshot
          studentsHelped={studentsHelped}
          answersGiven={myAnswers.length}
          introsMade={introsMade}
        />
      </div>

      {/* Footer rendered by layout */}
    </div>
  );
}
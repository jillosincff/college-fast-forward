import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import ImpactHero from '../components/impact/ImpactHero';
import ImpactStats from '../components/impact/ImpactStats';
import FamilyKarmaCard from '../components/impact/FamilyKarmaCard';
import ThisWeekCard from '../components/impact/ThisWeekCard';
import HelpCategoriesChart from '../components/impact/HelpCategoriesChart';
import MostHelpfulLeaderboard from '../components/impact/MostHelpfulLeaderboard';

const dmSans = "'DM Sans', system-ui, sans-serif";

function getDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function getFilterDays(filter) {
  if (filter === '1m') return 30;
  if (filter === '3m') return 90;
  if (filter === '6m') return 180;
  return 9999; // all
}

export default function MyImpact() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Raw data
  const [answers, setAnswers] = useState([]);
  const [jobAnswers, setJobAnswers] = useState([]);
  const [intros, setIntros] = useState([]);
  const [helpOffers, setHelpOffers] = useState([]);
  const [karmaData, setKarmaData] = useState(null);
  const [allKarmaFamilies, setAllKarmaFamilies] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);

  useEffect(() => {
    if (!document.getElementById('impact-fonts')) {
      const link = document.createElement('link');
      link.id = 'impact-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);

    const [
      answersRes,
      jobAnswersRes,
      introsRes,
      helpOffersRes,
      karmaRes,
      allKarmaRes,
      activeReqRes,
    ] = await Promise.all([
      base44.entities.Answer.filter({ answerer_email: user.email }, '-created_date', 500).catch(() => []),
      base44.entities.JobAnswer.filter({ responder_email: user.email }, '-created_date', 500).catch(() => []),
      base44.entities.Intro.filter({ helper_user_id: user.id }, '-created_date', 200).catch(() => []),
      base44.entities.HelpOffer.filter({ offerer_email: user.email }, '-created_date', 200).catch(() => []),
      user.family_group_id
        ? base44.entities.FamilyKarma.filter({ family_group_id: user.family_group_id }, undefined, 1).catch(() => [])
        : Promise.resolve([]),
      base44.entities.FamilyKarma.filter({}, '-this_month_karma', 20).catch(() => []),
      base44.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 500).catch(() => []),
    ]);

    setAnswers(answersRes || []);
    setJobAnswers(jobAnswersRes || []);
    setIntros(introsRes || []);
    setHelpOffers(helpOffersRes || []);
    setKarmaData((karmaRes || [])[0] || null);
    setAllKarmaFamilies(allKarmaRes || []);
    setActiveRequests(activeReqRes || []);
    setLoading(false);
  }, [user?.email, user?.id, user?.family_group_id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Listen for pull-to-refresh
  useEffect(() => {
    const handler = () => loadData();
    document.addEventListener('cff:pull-refresh', handler);
    return () => document.removeEventListener('cff:pull-refresh', handler);
  }, [loadData]);

  // Computed stats based on time filter
  const stats = useMemo(() => {
    const days = getFilterDays(timeFilter);
    const cutoff = getDaysAgo(days);
    const prevCutoff = getDaysAgo(days * 2);

    const allAnswers = [...answers, ...jobAnswers];
    const periodAnswers = allAnswers.filter(a => a.created_date >= cutoff);
    const prevAnswers = allAnswers.filter(a => a.created_date >= prevCutoff && a.created_date < cutoff);

    const periodIntros = intros.filter(i => i.created_date >= cutoff);
    const prevIntros = intros.filter(i => i.created_date >= prevCutoff && i.created_date < cutoff);

    const periodOffers = helpOffers.filter(o => o.created_date >= cutoff);
    const prevOffers = helpOffers.filter(o => o.created_date >= prevCutoff && o.created_date < cutoff);

    // Unique students helped = unique question IDs answered + unique students from intros
    const helpedIds = new Set([
      ...periodAnswers.map(a => a.question_id),
      ...periodIntros.map(i => i.student_id),
      ...periodOffers.map(o => o.job_request_id),
    ]);
    const prevHelpedIds = new Set([
      ...prevAnswers.map(a => a.question_id),
      ...prevIntros.map(i => i.student_id),
      ...prevOffers.map(o => o.job_request_id),
    ]);

    // Success rate: offers completed / total offers
    const completedOffers = periodOffers.filter(o => o.status === 'completed').length;
    const totalOffers = periodOffers.length;
    const prevCompleted = prevOffers.filter(o => o.status === 'completed').length;
    const prevTotal = prevOffers.length;

    const successRate = totalOffers > 0 ? Math.round((completedOffers / totalOffers) * 100) : 0;
    const prevSuccessRate = prevTotal > 0 ? Math.round((prevCompleted / prevTotal) * 100) : 0;

    return {
      studentsHelped: helpedIds.size,
      studentsHelpedDelta: helpedIds.size - prevHelpedIds.size,
      answersGiven: periodAnswers.length,
      answersGivenDelta: periodAnswers.length - prevAnswers.length,
      introsMade: periodIntros.length,
      introsMadeDelta: periodIntros.length - prevIntros.length,
      successRate: totalOffers > 0 ? successRate : 0,
      successRateDelta: (totalOffers > 0 && prevTotal > 0) ? successRate - prevSuccessRate : 0,
    };
  }, [answers, jobAnswers, intros, helpOffers, timeFilter]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const weekAgo = getDaysAgo(7);
    const allAnswers = [...answers, ...jobAnswers];
    
    // All parents' answers this week (we only have current user's, so approximate from all data)
    const thisWeekAnswers = allAnswers.filter(a => a.created_date >= weekAgo);
    const thisWeekIntros = intros.filter(i => i.created_date >= weekAgo);

    const studentsHelpedSet = new Set([
      ...thisWeekAnswers.map(a => a.question_id),
      ...thisWeekIntros.map(i => i.student_id),
    ]);

    // Active requests needing answers
    const unanswered = activeRequests.filter(r => (r.answer_count || 0) === 0);

    return {
      questionsAnswered: thisWeekAnswers.length,
      studentsHelped: studentsHelpedSet.size,
      studentsNeedHelp: unanswered.length,
    };
  }, [answers, jobAnswers, intros, activeRequests]);

  // Help categories distribution from active requests
  const helpCategories = useMemo(() => {
    const cats = { job_search: 0, networking: 0, career_path: 0, first_job: 0, career_direction: 0, industry_insights: 0 };
    
    const categoryMapping = {
      'internship_leads': 'job_search',
      'resume_review': 'job_search',
      'job_search': 'job_search',
      'networking_intros': 'networking',
      'networking': 'networking',
      'informational_interview': 'networking',
      'career_advice': 'career_path',
      'career_path': 'career_path',
      'interview_prep': 'first_job',
      'first_job': 'first_job',
      'direction': 'career_direction',
      'career_direction': 'career_direction',
      'industry_insights': 'industry_insights',
      'industry': 'industry_insights',
    };

    activeRequests.forEach(req => {
      const types = req.help_types || [];
      const category = req.category;
      
      types.forEach(t => {
        const mapped = categoryMapping[t];
        if (mapped && cats[mapped] !== undefined) cats[mapped]++;
      });
      
      if (category) {
        const mapped = categoryMapping[category];
        if (mapped && cats[mapped] !== undefined) cats[mapped]++;
      }

      // If no types matched, count as career_path
      if (types.length === 0 && !category) cats.career_path++;
    });

    return cats;
  }, [activeRequests]);

  // Leaderboard families
  const leaderboardFamilies = useMemo(() => {
    return (allKarmaFamilies || [])
      .filter(f => (f.this_month_karma || 0) > 0)
      .sort((a, b) => (b.this_month_karma || 0) - (a.this_month_karma || 0))
      .map((f, i) => ({
        id: f.id,
        displayName: `A Family`,
        karma: f.this_month_karma || 0,
        isCurrentUser: f.family_group_id === user?.family_group_id,
      }));
  }, [allKarmaFamilies, user?.family_group_id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 32, height: 32, border: '3px solid #E85D20',
          borderTop: '3px solid transparent', borderRadius: '50%',
          animation: 'impactSpin 0.8s linear infinite',
        }} />
        <style>{`@keyframes impactSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f2ee', display: 'flex', flexDirection: 'column' }}>
      {/* Section 1: Hero */}
      <ImpactHero user={user} />

      {/* Body */}
      <div style={{ maxWidth: 900, margin: '0 auto', width: '100%', padding: '24px 24px 60px' }}>
        {/* Section 2: Impact Stats */}
        <div style={{ marginBottom: 20, animation: 'impactFadeUp 0.4s ease 0.06s both' }}>
          <ImpactStats stats={stats} timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} />
        </div>

        {/* Section 3: Family Karma */}
        <div style={{ marginBottom: 20, animation: 'impactFadeUp 0.4s ease 0.12s both' }}>
          <FamilyKarmaCard karmaData={karmaData} />
        </div>

        {/* Section 4: This Week */}
        <div style={{ marginBottom: 20, animation: 'impactFadeUp 0.4s ease 0.18s both' }}>
          <ThisWeekCard weeklyStats={weeklyStats} />
        </div>

        {/* Section 5: Help Categories */}
        <div style={{ marginBottom: 20, animation: 'impactFadeUp 0.4s ease 0.24s both' }}>
          <HelpCategoriesChart categories={helpCategories} />
        </div>

        {/* Section 6: Leaderboard */}
        <div style={{ animation: 'impactFadeUp 0.4s ease 0.30s both' }}>
          <MostHelpfulLeaderboard families={leaderboardFamilies} />
        </div>
      </div>

      <style>{`
        @keyframes impactFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes impactSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
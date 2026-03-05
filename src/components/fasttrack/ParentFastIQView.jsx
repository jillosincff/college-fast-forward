import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import ParentFastIQSalesPage from './ParentFastIQSalesPage';
import ParentProgressRings from '../fastiq/parent/ParentProgressRings';
import ParentPipelineSummary from '../fastiq/parent/ParentPipelineSummary';
import ParentTargetCompanies from '../fastiq/parent/ParentTargetCompanies';
import ParentActivityFeed from '../fastiq/parent/ParentActivityFeed';
import ParentWeeklySummary from '../fastiq/parent/ParentWeeklySummary';
import ParentNudgeButton from '../fastiq/parent/ParentNudgeButton';
import moment from 'moment';

// ── Active student progress dashboard ──
function ActiveStudentView({ studentProfile, studentName, studentEmail, parentUser, pipelineCounts, intelCache, alumniCounts, activities, weeklyStats }) {
  return (
    <motion.div className="min-h-screen" style={{ background: '#0F172A' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-14 pb-12 sm:pt-20 sm:pb-16" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Active</span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-extrabold text-white mb-2 tracking-tight" style={{ lineHeight: 1.15 }}>
            FASTIQ is active for {studentName || 'your student'}
          </h1>
          <p className="text-[15px] text-white/55 max-w-md mx-auto leading-relaxed">
            {studentName || 'Your student'} is using their personal career center
          </p>
        </motion.div>
      </div>

      {/* Dashboard content */}
      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-8 pt-8">
        <ParentProgressRings profile={studentProfile} />
        <ParentPipelineSummary counts={pipelineCounts} studentName={studentName} />
        <ParentTargetCompanies
          companies={studentProfile.target_companies}
          intelCache={intelCache}
          alumniCounts={alumniCounts}
        />
        <ParentActivityFeed activities={activities} />
        <ParentWeeklySummary studentName={studentName} weeklyStats={weeklyStats} />
        <ParentNudgeButton studentName={studentName} studentEmail={studentEmail} parentUser={parentUser} />

        {/* Footer message */}
        <div className="rounded-xl p-5 text-center" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            FASTIQ is {studentName || 'your student'}'s personal career center. It works for them 24/7 — researching companies, finding alumni, and keeping them on track. The best thing you can do is encourage them to use it.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Activation upsell ──
function ActivateForStudentView({ user, studentName, familyId }) {
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const baseUrl = window.location.origin;
      const res = await base44.functions.invoke('createCheckoutSession', {
        priceId: 'price_1SUJ2g873TV7WMcTBYvmzGYU', // $19/month standard
        successUrl: `${baseUrl}/#FastIQ?checkout=success`,
        cancelUrl: `${baseUrl}/#FastIQ?checkout=cancel`,
        metadata: { subscriptionType: 'parent_fastiq', family_id: familyId }
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      setCheckingOut(false);
    }
  };

  return (
    <motion.div className="min-h-screen" style={{ background: '#0F172A' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="relative overflow-hidden px-4 pt-14 pb-12 sm:pt-20 sm:pb-16" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(250,70,22,0.08) 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-lg mx-auto text-center relative z-10">
          <Zap className="w-10 h-10 text-orange-400 mx-auto mb-5" />
          <h1 className="text-[26px] sm:text-[34px] font-extrabold text-white mb-3 tracking-tight" style={{ lineHeight: 1.15 }}>
            Give {studentName || 'your student'} the unfair advantage.
          </h1>
          <p className="text-[15px] text-white/55 max-w-md mx-auto leading-relaxed mb-8">
            FASTIQ finds UF alumni at their dream companies and helps them reach out — so they never have to cold apply again.
          </p>

          <motion.button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-[15px] font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
            style={{ background: '#FA4616', boxShadow: '0 0 30px rgba(250,70,22,0.35), 0 4px 15px rgba(250,70,22,0.25)', minHeight: 'auto' }}
          >
            {checkingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {checkingOut ? 'Redirecting...' : 'Activate FASTIQ for your family — $19/month'}
          </motion.button>
        </motion.div>
      </div>

      {/* Value prop below */}
      <div style={{ background: '#F8FAFC' }}>
        <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-6">
          {[
            { icon: Users, title: 'Find Insiders', desc: 'Identifies alumni at their dream companies before applications are reviewed.' },
            { icon: MessageSquare, title: 'Draft Outreach', desc: 'Crafts thoughtful introductions that get responses.' },
            { icon: Map, title: 'Map the Warm Path', desc: 'Strategic entry sequence: who first, what next, when to follow up.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-0.5">{title}</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── No student linked ──
function LinkStudentFirstView() {
  return (
    <motion.div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F172A' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="text-center max-w-sm">
        <UserPlus className="w-12 h-12 text-blue-400 mx-auto mb-5" />
        <h2 className="text-xl font-bold text-white mb-2">Link your student first to activate FASTIQ</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Once your student is connected to your family, you can activate FASTIQ to help them access insider opportunities.
        </p>
        <Button
          onClick={() => navigate('ParentDashboard')}
          className="text-white font-bold px-6"
          style={{ background: '#FA4616', minHeight: 'auto' }}
        >
          <ArrowRight className="w-4 h-4 mr-2" /> Go to Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

// ── Main parent component ──
export default function ParentFastIQView({ user }) {
  const [state, setState] = useState('loading'); // loading | active | upsell | no_student
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [pipelineCounts, setPipelineCounts] = useState({});
  const [intelCache, setIntelCache] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});
  const [activities, setActivities] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({});

  useEffect(() => {
    if (!user) return;
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    try {
      // Find family for this parent
      const families = await base44.entities.Family.filter({ primary_parent_id: user.id });
      let family = families[0];
      if (!family) {
        const allFamilies = await base44.entities.Family.filter({});
        family = allFamilies.find(f => f.parent_ids?.includes(user.id));
      }

      if (!family || (!family.student_ids?.length && !family.student_email)) {
        setState('no_student');
        return;
      }

      setFamilyId(family.id);

      // Find student user
      let sEmail = family.student_email;
      let sName = '';
      if (family.student_ids?.length > 0) {
        try {
          const students = await base44.entities.User.filter({ id: family.student_ids[0] });
          if (students.length > 0) {
            sEmail = students[0].email;
            const fullName = students[0].full_name || '';
            if (fullName.includes(',')) {
              sName = fullName.split(',')[1]?.trim().split(' ')[0] || '';
            } else {
              sName = fullName.split(' ')[0] || '';
            }
          }
        } catch (e) {
          console.log('Could not fetch student user, using student_email');
        }
      }

      setStudentName(sName);
      setStudentEmail(sEmail);

      if (!sEmail) {
        setState('no_student');
        return;
      }

      // Check if student has FASTIQ profile
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: sEmail });
      if (profiles.length > 0 && profiles[0].assessment_complete) {
        setStudentProfile(profiles[0]);
        // Load all supplementary data in parallel
        loadDashboardData(sEmail, profiles[0]);
        setState('active');
      } else {
        setState('upsell');
      }
    } catch (err) {
      console.error('Error loading parent FASTIQ data:', err);
      setState('no_student');
    }
  };

  const loadDashboardData = async (email, profile) => {
    try {
      const oneWeekAgo = moment().subtract(7, 'days').toISOString();

      // Parallel fetch all data
      const [pipeline, activityLogs, intelItems, alumniItems] = await Promise.all([
        base44.entities.NetworkingPipeline.filter({ user_email: email }),
        base44.entities.ProActivityLog.filter({ user_email: email }, '-timestamp', 10),
        profile.target_companies?.length > 0
          ? base44.entities.CompanyIntelCache.filter({})
          : Promise.resolve([]),
        profile.target_companies?.length > 0
          ? base44.entities.DiscoveredAlumni.filter({})
          : Promise.resolve([]),
      ]);

      // Pipeline counts
      const counts = {};
      pipeline.forEach(p => {
        const s = p.status || 'identified';
        counts[s] = (counts[s] || 0) + 1;
      });
      setPipelineCounts(counts);

      // Activities
      setActivities(activityLogs || []);

      // Weekly stats from activity logs
      const weekLogs = (activityLogs || []).filter(a => {
        const ts = a.timestamp || a.created_date;
        return ts && moment(ts).isAfter(oneWeekAgo);
      });
      setWeeklyStats({
        companies: weekLogs.filter(a => a.action_type === 'company_search').length,
        alumni: weekLogs.filter(a => a.action_type === 'alumni_view').length,
        messages: weekLogs.filter(a => a.action_type === 'message_draft').length,
      });

      // Intel cache by company name (lowercase)
      const ic = {};
      (intelItems || []).forEach(item => {
        if (item.company_name) ic[item.company_name.toLowerCase()] = item;
      });
      setIntelCache(ic);

      // Alumni counts by company name (lowercase)
      const ac = {};
      (alumniItems || []).forEach(item => {
        if (item.company) {
          const key = item.company.toLowerCase();
          ac[key] = (ac[key] || 0) + 1;
        }
      });
      setAlumniCounts(ac);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (state === 'active') {
    return (
      <ActiveStudentView
        studentProfile={studentProfile}
        studentName={studentName}
        studentEmail={studentEmail}
        parentUser={user}
        pipelineCounts={pipelineCounts}
        intelCache={intelCache}
        alumniCounts={alumniCounts}
        activities={activities}
        weeklyStats={weeklyStats}
      />
    );
  }

  if (state === 'upsell') {
    return <ParentFastIQSalesPage user={user} studentName={studentName} familyId={familyId} />;
  }

  return <LinkStudentFirstView />;
}
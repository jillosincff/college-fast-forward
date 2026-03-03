import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2, Users, Building2, MessageSquare, Map, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import AnimatedCounter from './AnimatedCounter';
import ProAgentChat from '../fast-track-pro/ProAgentChat';
import ParentFastIQSalesPage from './ParentFastIQSalesPage';

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const STAT_CONFIG = [
  { icon: Building2, label: 'TARGETS LOCKED', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { icon: Users, label: 'INSIDERS FOUND', color: '#FA4616', bg: 'rgba(250,70,22,0.12)' },
  { icon: MessageSquare, label: 'MESSAGES DEPLOYED', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  { icon: Map, label: 'WARM PATHS MAPPED', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
];

function ParentStatCard({ config, value, delay }) {
  const { icon: Icon, label, color, bg } = config;
  const hasValue = value > 0;
  return (
    <motion.div {...fade} transition={{ duration: 0.25, delay }}>
      <div className="rounded-lg p-4" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${color}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
            <Icon className="w-[18px] h-[18px]" style={{ color }} />
          </div>
          <div>
            <p className="text-[28px] font-bold tracking-tight leading-none mb-0.5" style={{ color: hasValue ? color : 'rgba(255,255,255,0.35)' }}>
              <AnimatedCounter value={value} />
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.12em] font-semibold">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Active student view ──
function ActiveStudentView({ studentProfile, studentName, onOpenChat }) {
  const statValues = [
    studentProfile.companies_researched || 0,
    studentProfile.alumni_discovered || 0,
    studentProfile.messages_drafted || 0,
    studentProfile.roadmaps_generated || 0,
  ];

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
            {studentName ? `${studentName}'s FASTIQ™ is active.` : "Your student's FASTIQ™ is active."}
          </h1>
          <p className="text-[15px] text-white/55 max-w-md mx-auto leading-relaxed mb-6">
            They're building insider access to their dream companies — here's their progress.
          </p>
          {onOpenChat && (
            <motion.button
              onClick={() => onOpenChat()}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#FA4616', boxShadow: '0 0 30px rgba(250,70,22,0.35)', minHeight: 'auto' }}
            >
              <Sparkles className="w-5 h-5" /> Try FASTIQ Chat
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-8 pt-8">
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3">Progress Dashboard</h2>
        <div className="grid grid-cols-2 gap-3">
          {STAT_CONFIG.map((cfg, i) => (
            <ParentStatCard key={cfg.label} config={cfg} value={statValues[i]} delay={0.1 + i * 0.05} />
          ))}
        </div>

        {/* Target companies */}
        {studentProfile.target_companies?.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3">Target Companies</h2>
            <div className="space-y-2">
              {studentProfile.target_companies.map(c => (
                <div key={c} className="rounded-lg p-4 flex items-center gap-3" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white capitalize">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {studentProfile.target_industry && (
          <div className="rounded-lg p-4" style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Target Industry</p>
            <p className="text-sm text-white font-medium capitalize">{studentProfile.target_industry}</p>
          </div>
        )}
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
        successUrl: `${baseUrl}/#FastTrackPro?checkout=success`,
        cancelUrl: `${baseUrl}/#FastTrackPro?checkout=cancel`,
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
  const [state, setState] = useState('loading'); // loading | active | upsell | no_student | chat
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [chatInitialMessage, setChatInitialMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    try {
      // Find family for this parent
      const families = await base44.entities.Family.filter({ primary_parent_id: user.id });
      // Also check parent_ids array (secondary parent)
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

      // Find student user(s)
      let studentEmail = family.student_email;
      if (family.student_ids?.length > 0) {
        try {
          const students = await base44.entities.User.filter({ id: family.student_ids[0] });
          if (students.length > 0) {
            studentEmail = students[0].email;
            // Handle "Last, First M." format from UF
            const fullName = students[0].full_name || '';
            let firstName = '';
            if (fullName.includes(',')) {
              // "Osinoff, Lindsey M." → "Lindsey"
              firstName = fullName.split(',')[1]?.trim().split(' ')[0] || '';
            } else {
              firstName = fullName.split(' ')[0] || '';
            }
            setStudentName(firstName);
          }
        } catch (e) {
          console.log('Could not fetch student user, using student_email');
        }
      }

      if (!studentEmail) {
        setState('no_student');
        return;
      }

      // Check if student has FASTIQ profile
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: studentEmail });
      if (profiles.length > 0 && profiles[0].assessment_complete) {
        setStudentProfile(profiles[0]);
        setState('active');
      } else {
        // Student doesn't have FASTIQ active — show sales page
        setState('upsell');
      }
    } catch (err) {
      console.error('Error loading parent FASTIQ data:', err);
      setState('no_student');
    }
  };

  const handleOpenChat = (initialMessage) => {
    setChatInitialMessage(initialMessage || '');
    setState('chat');
  };

  const handleBackFromChat = () => {
    setChatInitialMessage('');
    setState('active');
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (state === 'chat') {
    return <ProAgentChat user={user} profile={studentProfile} initialMessage={chatInitialMessage} onBack={handleBackFromChat} />;
  }

  if (state === 'active') {
    return <ActiveStudentView studentProfile={studentProfile} studentName={studentName} onOpenChat={handleOpenChat} />;
  }

  if (state === 'upsell') {
    return <ParentFastIQSalesPage user={user} studentName={studentName} familyId={familyId} />;
  }

  return <LinkStudentFirstView />;
}
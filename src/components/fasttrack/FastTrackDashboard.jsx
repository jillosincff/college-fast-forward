import React, { useState, useEffect } from 'react';
import { Building2, Users, MessageSquare, Map, Sparkles, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ProActivityFeed from './ProActivityFeed';
import AnimatedCounter from './AnimatedCounter';

const fade = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

const STAT_CONFIG = [
  { icon: Building2, label: 'TARGETS LOCKED', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  { icon: Users, label: 'INSIDERS FOUND', color: '#FA4616', bg: 'rgba(250,70,22,0.12)' },
  { icon: MessageSquare, label: 'MESSAGES DEPLOYED', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  { icon: Map, label: 'WARM PATHS MAPPED', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
];

function StatCard({ config, value, delay }) {
  const { icon: Icon, label, color, bg } = config;
  const hasValue = value > 0;
  return (
    <motion.div {...fade} transition={{ duration: 0.25, delay }}>
      <div
        className="rounded-lg p-4"
        style={{
          background: '#1E293B',
          border: '1px solid rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${color}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
            <Icon className="w-[18px] h-[18px]" style={{ color }} />
          </div>
          <div>
            <p
              className="text-[28px] sm:text-[32px] font-bold tracking-tight leading-none mb-0.5"
              style={{
                color: hasValue ? color : 'rgba(255,255,255,0.35)',
                textShadow: hasValue ? `0 0 20px ${color}40` : 'none',
              }}
            >
              <AnimatedCounter value={value} />
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-[0.12em] font-semibold">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ name, intel, alumniCount, onResearch, onView, onFindAlumni }) {
  const researched = !!intel;
  const score = intel?.hiring_score;
  const isHot = score && score >= 80;

  if (researched && alumniCount > 0) {
    // Fully complete: intel + alumni
    return (
      <div
        className="rounded-lg p-4 cursor-pointer transition-all duration-150 hover:border-green-500/30 group"
        style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={onView}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
            <div>
              <p className="font-semibold text-white text-sm flex items-center gap-2">
                {name}
                {isHot && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">🔥 HOT</span>}
              </p>
              <p className="text-[11px] text-slate-400">
                Hiring score: {score || '—'} • {alumniCount} UF alumni found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-400 opacity-60 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] font-semibold">View intel →</span>
          </div>
        </div>
      </div>
    );
  }

  if (researched && alumniCount === 0) {
    // Researched but no alumni scanned — incomplete mission
    return (
      <div
        className="rounded-lg overflow-hidden transition-all duration-150 hover:border-orange-500/30 group"
        style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="p-4 cursor-pointer" onClick={onView}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              <div>
                <p className="font-semibold text-white text-sm flex items-center gap-2">
                  {name}
                  {isHot && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">🔥 HOT</span>}
                </p>
                <p className="text-[11px] text-slate-400">
                  Hiring score: {score || '—'} • 0 UF alumni found
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[11px] font-semibold">View intel →</span>
            </div>
          </div>
        </div>
        {/* Urgency CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onFindAlumni(name); }}
          className="w-full px-4 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold text-orange-400 transition-all hover:text-orange-300 hover:bg-orange-500/5"
          style={{ borderTop: '1px solid rgba(250,70,22,0.15)', background: 'rgba(250,70,22,0.04)', minHeight: 'auto' }}
        >
          🔍 Alumni not scanned yet — Find insiders →
        </button>
      </div>
    );
  }

  // Not researched at all
  return (
    <div
      className="rounded-lg p-4 cursor-pointer transition-all duration-150 hover:border-orange-500/30 group"
      style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={() => onResearch(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-white text-sm">{name}</p>
            <p className="text-[11px] text-slate-500">Not researched yet</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-orange-400 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="text-[11px] font-semibold">⚡ Research now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: Search, label: 'Scan for Insiders', emoji: '🔍', prompt: 'Find UF alumni at my target companies', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { icon: MessageSquare, label: 'Draft Outreach', emoji: '✉️', prompt: 'Draft a LinkedIn message to a recruiter', color: '#FA4616', bg: 'rgba(250,70,22,0.15)' },
  { icon: Map, label: 'Map Warm Path', emoji: '🗺️', prompt: 'Create a 4-week career action plan for me', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  { icon: TrendingUp, label: 'Strategy Brief', emoji: '🧠', prompt: 'What company should I target next?', color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
];

function SectionLabel({ children }) {
  return <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-3">{children}</h2>;
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export default function FastTrackDashboard({ user, profile, onOpenChat }) {
  const [companyIntel, setCompanyIntel] = useState({});
  const [alumniCounts, setAlumniCounts] = useState({});

  // Fetch intel cache and alumni for target companies
  useEffect(() => {
    if (!profile?.target_companies?.length) return;

    const loadIntel = async () => {
      const companies = profile.target_companies.map(c => titleCase(c));

      // Fetch all cached intel
      const allIntel = await base44.entities.CompanyIntelCache.filter({}, '-created_date', 50);
      const intelMap = {};
      allIntel.forEach(item => {
        intelMap[item.company_name?.toLowerCase()] = item;
      });
      setCompanyIntel(intelMap);

      // Fetch all discovered alumni
      const allAlumni = await base44.entities.DiscoveredAlumni.filter({}, '-created_date', 100);
      const countMap = {};
      allAlumni.forEach(item => {
        const key = item.company?.toLowerCase();
        if (key) countMap[key] = (countMap[key] || 0) + 1;
      });
      setAlumniCounts(countMap);
    };

    loadIntel();
  }, [profile?.target_companies]);

  const statValues = [
    profile.companies_researched || 0,
    profile.alumni_discovered || 0,
    profile.messages_drafted || 0,
    profile.roadmaps_generated || 0,
  ];

  const handleResearchCompany = (company) => {
    onOpenChat(`Research ${company} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  const handleViewIntel = (company) => {
    onOpenChat(`Show me the latest intel on ${company} — hiring score, open roles, alumni connections, and interview tips.`);
  };

  const handleFindAlumni = (company) => {
    onOpenChat(`Find UF Gator alumni who work at ${company} — I need insider connections to get my foot in the door.`);
  };

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: '#0F172A' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden px-4 pt-14 pb-12 sm:pt-20 sm:pb-16"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0021A5 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(250,70,22,0.06) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center relative z-10"
        >
          <h2
            className="text-[28px] sm:text-[36px] font-extrabold text-white mb-1 tracking-tight"
            style={{ textShadow: '0 0 40px rgba(250,70,22,0.2)' }}
          >
            FASTIQ™
          </h2>
          <h1
            className="text-[28px] sm:text-[38px] font-bold text-white mb-4"
            style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Because applying isn't a strategy.
          </h1>
          <p className="text-[15px] text-white/70 max-w-md mx-auto mb-6 leading-relaxed">
            Move faster than the applicant pile.
          </p>

          {/* CTA with pulse */}
          <motion.button
            onClick={() => onOpenChat()}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: '#FA4616',
              boxShadow: '0 0 30px rgba(250,70,22,0.35), 0 4px 15px rgba(250,70,22,0.25)',
              minHeight: 'auto',
            }}
            animate={{
              scale: [1, 1.04, 1],
              boxShadow: [
                '0 0 20px rgba(250,70,22,0.25), 0 4px 15px rgba(250,70,22,0.2)',
                '0 0 40px rgba(250,70,22,0.5), 0 4px 20px rgba(250,70,22,0.35)',
                '0 0 20px rgba(250,70,22,0.25), 0 4px 15px rgba(250,70,22,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-5 h-5" /> Activate FASTIQ
          </motion.button>
          <p className="text-[10px] text-white/35 mt-3">Accelerate with precision.</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-10">

        {/* Stats */}
        <div className="pt-8">
          <SectionLabel>Your Progress</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {STAT_CONFIG.map((cfg, i) => (
              <StatCard key={cfg.label} config={cfg} value={statValues[i]} delay={0.1 + i * 0.05} />
            ))}
          </div>
        </div>

        {/* Target Companies */}
        {profile.target_companies?.length > 0 && (
          <div>
            <SectionLabel>Target Companies</SectionLabel>
            <div className="space-y-2">
              {profile.target_companies.map(c => {
                const key = c.toLowerCase();
                const intel = companyIntel[key] || null;
                const count = alumniCounts[key] || 0;
                return (
                  <CompanyCard
                    key={c}
                    name={titleCase(c)}
                    intel={intel}
                    alumniCount={count}
                    onResearch={handleResearchCompany}
                    onView={() => handleViewIntel(titleCase(c))}
                    onFindAlumni={handleFindAlumni}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <SectionLabel>Recent Activity</SectionLabel>
          <ProActivityFeed userEmail={user?.email} />
        </div>

        {/* Quick Actions */}
        <div>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, emoji, prompt, color, bg }) => (
              <button
                key={label}
                onClick={() => onOpenChat(prompt)}
                className="flex flex-col items-center gap-2.5 py-5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] group"
                style={{
                  background: '#1E293B',
                  border: '1px solid rgba(255,255,255,0.08)',
                  width: '100%',
                  minHeight: 'auto',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${color}25`; e.currentTarget.style.borderColor = `${color}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-shadow duration-200" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="text-[11px] font-semibold text-slate-300">{emoji} {label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
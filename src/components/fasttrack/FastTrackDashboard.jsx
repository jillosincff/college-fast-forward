import React from 'react';
import { Building2, Users, MessageSquare, Map, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProActivityFeed from './ProActivityFeed';
import AnimatedCounter from './AnimatedCounter';

const fade = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };
const rise = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, delay, highlight }) {
  return (
    <motion.div {...fade} transition={{ duration: 0.25, delay }}>
      <div
        className="rounded-lg p-4 bg-white"
        style={{
          border: highlight ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
          boxShadow: highlight
            ? '0 4px 20px rgba(37,99,235,0.10)'
            : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${highlight ? 'bg-blue-50' : 'bg-slate-50'}`}>
            <Icon className={`w-[18px] h-[18px] ${highlight ? 'text-blue-600' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="text-[24px] font-bold text-slate-900 tracking-tight leading-none mb-0.5">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em] font-medium">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ name, onResearch }) {
  return (
    <div
      className="rounded-lg p-4 bg-white cursor-pointer transition-all duration-150 hover:shadow-md hover:border-slate-300"
      style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      onClick={() => onResearch(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50">
            <Building2 className="w-[18px] h-[18px] text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">{name}</p>
            <p className="text-[11px] text-slate-400">Tap to map your warm path</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>
    </div>
  );
}

function SectionLabel({ children, sub }) {
  return (
    <div className="mb-3">
      <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{children}</h2>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export default function FastTrackDashboard({ user, profile, onOpenChat }) {
  const stats = [
    { icon: Building2, label: 'Targets Analyzed', value: profile.companies_researched || 0 },
    { icon: Users, label: 'Leverage Found', value: profile.alumni_discovered || 0 },
    { icon: MessageSquare, label: 'Outreach Deployed', value: profile.messages_drafted || 0 },
    { icon: Map, label: 'Warm Paths Created', value: profile.roadmaps_generated || 0, highlight: true },
  ];

  const handleResearchCompany = (company) => {
    onOpenChat(`Research ${company} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  return (
    <motion.div
      className="min-h-screen"
      style={{ background: '#F8FAFC' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hero */}
      <div className="px-4 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-5">
            FASTIQ™ by College Fast Forward
          </p>
          <h1
            className="text-[34px] sm:text-[46px] font-bold text-slate-900 mb-5"
            style={{ letterSpacing: '-0.035em', lineHeight: 1.08 }}
          >
            Because applying isn't a strategy.
          </h1>
          <p className="text-[15px] sm:text-base text-slate-600 max-w-lg mb-2.5 leading-relaxed">
            Move faster than the applicant pile.
          </p>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            FASTIQ analyzes targets, identifies alumni leverage, and gives you the next precise move.
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-10">

        {/* FASTIQ Feature Card — dark & dominant */}
        <motion.div {...rise} transition={{ duration: 0.35, delay: 0.08 }}>
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.5) 0%, rgba(37,99,235,0.2) 100%)' }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-semibold text-white text-[15px] tracking-tight">FASTIQ™</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-[0.1em] bg-white/10 text-white/50">
                    PRO
                  </span>
                </div>
                <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">
                  Target. Leverage. Execute.
                </p>
                <div>
                  <button
                    onClick={() => onOpenChat()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      boxShadow: '0 0 24px rgba(37,99,235,0.30)',
                      minHeight: 'auto',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 32px rgba(37,99,235,0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(37,99,235,0.30)'; }}
                  >
                    <Sparkles className="w-4 h-4" /> Activate FASTIQ
                  </button>
                  <p className="text-[10px] text-slate-500 mt-3">Accelerate with precision.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div>
          <SectionLabel sub="Warm paths outperform cold applications.">Your Progress</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={0.12 + i * 0.05} />
            ))}
          </div>
        </div>

        {/* Target Companies */}
        {profile.target_companies?.length > 0 && (
          <div>
            <SectionLabel>Target Companies</SectionLabel>
            <div className="space-y-2">
              {profile.target_companies.map(c => (
                <CompanyCard key={c} name={titleCase(c)} onResearch={handleResearchCompany} />
              ))}
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
            {[
              { icon: Users, label: 'Find Leverage', prompt: 'Find UF alumni at my target companies' },
              { icon: MessageSquare, label: 'Deploy Outreach', prompt: 'Draft a LinkedIn message to a recruiter' },
              { icon: Map, label: 'Map Warm Path', prompt: 'Create a 4-week career action plan for me' },
              { icon: TrendingUp, label: 'Strategy Check', prompt: 'What company should I target next?' },
            ].map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => onOpenChat(prompt)}
                className="flex flex-col items-center gap-2 py-5 rounded-lg bg-white transition-all duration-150 hover:shadow-md hover:border-slate-300 active:scale-[0.97]"
                style={{
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  width: '100%',
                  minHeight: 'auto',
                }}
              >
                <Icon className="w-[18px] h-[18px] text-slate-500" />
                <span className="text-[11px] font-medium text-slate-600">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
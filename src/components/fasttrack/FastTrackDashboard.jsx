import React from 'react';
import { Building2, Users, MessageSquare, Map, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProActivityFeed from './ProActivityFeed';
import AnimatedCounter from './AnimatedCounter';

const fade = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, delay, highlight }) {
  return (
    <motion.div {...fade} transition={{ duration: 0.25, delay }}>
      <div
        className="rounded-xl p-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: highlight ? '1px solid rgba(26,75,255,0.25)' : '1px solid rgba(255,255,255,0.07)',
          boxShadow: highlight ? '0 0 20px rgba(26,75,255,0.08)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Icon className="w-[18px] h-[18px] text-white/40" />
          </div>
          <div>
            <p className="text-[22px] font-bold text-white/95 tracking-tight leading-none mb-0.5">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.1em] font-medium">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ name, onResearch }) {
  return (
    <div
      className="rounded-xl p-4 cursor-pointer transition-all duration-150 hover:bg-white/[0.05]"
      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
      onClick={() => onResearch(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <Building2 className="w-[18px] h-[18px] text-white/40" />
          </div>
          <div>
            <p className="font-medium text-white/85 text-sm">{name}</p>
            <p className="text-[10px] text-white/25">Tap to map your warm path</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/15" />
      </div>
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
      style={{ background: 'linear-gradient(180deg, #060A12 0%, #0C1624 100%)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-14 pb-16 sm:pt-20 sm:pb-20">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 35%, rgba(26,75,255,0.08) 0%, transparent 70%)' }}
        />
        <motion.div {...fade} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto text-center relative z-10">
          <p className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.25em] mb-4">
            FASTIQ™ by College Fast Forward
          </p>
          <h1
            className="text-[28px] sm:text-[38px] font-bold text-white mb-4"
            style={{ letterSpacing: '-0.035em', lineHeight: 1.1 }}
          >
            Because applying isn't a strategy.
          </h1>
          <p className="text-white/50 text-sm sm:text-[15px] max-w-md mx-auto mb-2 leading-relaxed">
            Stop competing with 500 applicants. Enter through the warm path instead.
          </p>
          <p className="text-white/25 text-xs max-w-sm mx-auto leading-relaxed">
            FASTIQ analyzes targets, identifies alumni leverage, and gives you the exact next move.
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16 space-y-10">

        {/* FASTIQ Card */}
        <motion.div {...fade} transition={{ duration: 0.3, delay: 0.08 }}>
          <div
            className="rounded-[18px] p-6"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(26,75,255,0.5) 0%, rgba(26,75,255,0.2) 100%)' }}
              >
                <Sparkles className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-semibold text-white text-[15px] tracking-tight">FASTIQ™</h3>
                  <span
                    className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-[0.1em]"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}
                  >
                    PRO
                  </span>
                </div>
                <p className="text-[13px] text-white/35 mb-4 leading-relaxed">
                  Pick a target. Find leverage. Draft outreach. Move first.
                </p>
                <div>
                  <button
                    onClick={() => onOpenChat()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #1A4BFF 0%, #003BFF 100%)',
                      boxShadow: '0 0 30px rgba(0,75,255,0.3)',
                      minHeight: 'auto',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 36px rgba(0,75,255,0.45)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,75,255,0.3)'; }}
                  >
                    <Sparkles className="w-4 h-4" /> Activate FASTIQ
                  </button>
                  <p className="text-[10px] text-white/18 mt-2.5">Start with a company. FASTIQ maps the warm path.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em] mb-1">Your Progress</h2>
          <p className="text-[10px] text-white/15 mb-4">Warm paths outperform cold applications.</p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={0.12 + i * 0.05} />
            ))}
          </div>
        </div>

        {/* Target Companies */}
        {profile.target_companies?.length > 0 && (
          <div>
            <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em] mb-3">Target Companies</h2>
            <div className="space-y-2">
              {profile.target_companies.map(c => (
                <CompanyCard key={c} name={titleCase(c)} onResearch={handleResearchCompany} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em] mb-3">Recent Activity</h2>
          <ProActivityFeed userEmail={user?.email} darkMode />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em] mb-3">Quick Actions</h2>
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
                className="flex flex-col items-center gap-2 py-5 rounded-xl transition-all duration-150 hover:bg-white/[0.04] active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  width: '100%',
                  minHeight: 'auto',
                }}
              >
                <Icon className="w-[18px] h-[18px] text-white/30" />
                <span className="text-[11px] font-medium text-white/40">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
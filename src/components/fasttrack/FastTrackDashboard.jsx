import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Users, MessageSquare, Map, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import ProActivityFeed from './ProActivityFeed';
import AnimatedCounter from './AnimatedCounter';

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, delay }) {
  return (
    <motion.div {...fadeIn} transition={{ duration: 0.3, delay }}>
      <div className="rounded-2xl p-4 border border-white/10"
        style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
            <Icon className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white tracking-tight">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-[11px] text-white/40 tracking-wide">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ name, onResearch }) {
  return (
    <div
      className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:bg-white/[0.08] border border-white/10"
      style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}
      onClick={() => onResearch(name)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <p className="font-medium text-white/90 text-sm">{name}</p>
            <p className="text-[11px] text-white/35">Tap to map your warm path</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/25" />
      </div>
    </div>
  );
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

export default function FastTrackDashboard({ user, profile, onOpenChat }) {
  const rawName = user?.full_name || 'Gator';
  const firstName = rawName.includes(',')
    ? rawName.split(',')[1]?.trim().split(' ')[0]
    : rawName.split(' ')[0];

  const stats = [
    { icon: Building2, label: 'Targets Analyzed', value: profile.companies_researched || 0 },
    { icon: Users, label: 'Leverage Found', value: profile.alumni_discovered || 0 },
    { icon: MessageSquare, label: 'Outreach Deployed', value: profile.messages_drafted || 0 },
    { icon: Map, label: 'Warm Paths Created', value: profile.roadmaps_generated || 0 },
  ];

  const handleResearchCompany = (company) => {
    onOpenChat(`Research ${company} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0B1220 0%, #0E1A2B 50%, #111F33 100%)' }}>

      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,33,165,0.15) 0%, transparent 70%)' }} />
        <motion.div {...fadeIn} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto text-center relative z-10">
          <p className="text-white/35 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">FASTIQ™ by College Fast Forward</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3" style={{ letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            Because applying isn't a strategy.
          </h1>
          <p className="text-white/55 text-sm sm:text-base max-w-lg mx-auto mb-1.5 leading-relaxed">
            FASTIQ finds your inside lane into any company — and shows you the exact moves to make.
          </p>
          <p className="text-white/30 text-xs max-w-md mx-auto">
            Analyze targets, identify alumni leverage, and deploy outreach before you ever hit Apply.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 space-y-8">

        {/* FASTIQ Card */}
        <motion.div {...fadeIn} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="rounded-[20px] p-6 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,33,165,0.6), rgba(250,70,22,0.4))' }}>
                <Sparkles className="w-6 h-6 text-white/90" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h3 className="font-semibold text-white text-base tracking-tight">FASTIQ™</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-white/10 text-white/50">PRO</span>
                </div>
                <p className="text-sm text-white/45 mb-4 leading-relaxed">Pick a target. Find leverage. Draft outreach. Move first.</p>
                <div>
                  <button
                    onClick={() => onOpenChat()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, #1a3fbd 0%, #0021A5 100%)',
                      boxShadow: '0 4px 16px rgba(0,33,165,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                      minHeight: 'auto',
                    }}
                  >
                    <Sparkles className="w-4 h-4" /> Activate FASTIQ
                  </button>
                  <p className="text-[11px] text-white/25 mt-2.5">Start with a company. FASTIQ maps the warm path.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-1">Your Progress</h2>
          <p className="text-[11px] text-white/20 mb-4">Warm paths beat cold applications — every time.</p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => <StatCard key={s.label} {...s} delay={0.15 + i * 0.06} />)}
          </div>
        </div>

        {/* Target Companies */}
        {profile.target_companies?.length > 0 && (
          <div>
            <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">Target Companies</h2>
            <div className="space-y-2">
              {profile.target_companies.map(c => (
                <CompanyCard key={c} name={titleCase(c)} onResearch={handleResearchCompany} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">Recent Activity</h2>
          <ProActivityFeed userEmail={user?.email} darkMode />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: 'Find Leverage', prompt: 'Find UF alumni at my target companies', color: 'text-purple-400/70' },
              { icon: MessageSquare, label: 'Deploy Outreach', prompt: 'Draft a LinkedIn message to a recruiter', color: 'text-orange-400/70' },
              { icon: Map, label: 'Map Warm Path', prompt: 'Create a 4-week career action plan for me', color: 'text-emerald-400/70' },
              { icon: TrendingUp, label: 'Strategy Check', prompt: 'What company should I target next?', color: 'text-blue-400/70' },
            ].map(({ icon: Icon, label, prompt, color }) => (
              <button
                key={label}
                onClick={() => onOpenChat(prompt)}
                className="flex flex-col items-center gap-2.5 py-5 rounded-2xl border border-white/10 transition-all duration-150 hover:bg-white/[0.06] hover:border-white/15 active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.04)', width: '100%', minHeight: 'auto' }}
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-xs font-medium text-white/50">{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
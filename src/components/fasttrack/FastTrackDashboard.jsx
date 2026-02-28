import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, MessageSquare, Map, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-4 border-2 border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function CompanyCard({ name, onResearch }) {
  return (
    <Card className="p-4 border-2 border-slate-100 hover:border-[#0021A5]/30 transition-colors cursor-pointer" onClick={() => onResearch(name)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#0021A5]" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">Tap to get intel</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </Card>
  );
}

export default function FastTrackDashboard({ user, profile, onOpenChat }) {
  const firstName = user?.full_name?.split(' ')[0] || 'Gator';
  const stats = [
    { icon: Building2, label: 'Companies Researched', value: profile.companies_researched || 0, color: 'bg-blue-100 text-blue-600' },
    { icon: Users, label: 'Alumni Discovered', value: profile.alumni_discovered || 0, color: 'bg-purple-100 text-purple-600' },
    { icon: MessageSquare, label: 'Messages Drafted', value: profile.messages_drafted || 0, color: 'bg-orange-100 text-orange-600' },
    { icon: Map, label: 'Roadmaps Generated', value: profile.roadmaps_generated || 0, color: 'bg-green-100 text-green-600' },
  ];

  const handleResearchCompany = (company) => {
    onOpenChat(`Research ${company} for me — are they hiring? What roles, salary ranges, and interview process should I know about?`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#0A1045] text-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Fast Track Pro</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Welcome back, {firstName}</h1>
          <p className="text-white/70 text-sm">
            Targeting <span className="text-[#FA4616] font-semibold">{profile.dream_role || 'your dream role'}</span>
            {profile.target_companies?.length > 0 && ` at ${profile.target_companies.length} companies`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Chat CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 border-2 border-[#0021A5]/20 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-1">Your AI Career Agent</h3>
                <p className="text-sm text-slate-600 mb-3">Research companies, discover alumni, draft outreach, and build your roadmap — all in one conversation.</p>
                <Button onClick={() => onOpenChat()} className="bg-[#0021A5] hover:bg-[#001580]">
                  <Sparkles className="w-4 h-4 mr-2" /> Chat with Agent
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
        </div>

        {/* Target Companies */}
        {profile.target_companies?.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Companies</h2>
            <div className="space-y-2">
              {profile.target_companies.map(c => (
                <CompanyCard key={c} name={c} onResearch={handleResearchCompany} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => onOpenChat("Find UF alumni at my target companies")} className="h-auto py-4 flex-col gap-2 border-2" style={{ width: '100%' }}>
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-xs">Find Alumni</span>
            </Button>
            <Button variant="outline" onClick={() => onOpenChat("Draft a LinkedIn message to a recruiter")} className="h-auto py-4 flex-col gap-2 border-2" style={{ width: '100%' }}>
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span className="text-xs">Draft Message</span>
            </Button>
            <Button variant="outline" onClick={() => onOpenChat("Create a 4-week career action plan for me")} className="h-auto py-4 flex-col gap-2 border-2" style={{ width: '100%' }}>
              <Map className="w-5 h-5 text-green-600" />
              <span className="text-xs">Build Roadmap</span>
            </Button>
            <Button variant="outline" onClick={() => onOpenChat("What company should I target next?")} className="h-auto py-4 flex-col gap-2 border-2" style={{ width: '100%' }}>
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Get Advice</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
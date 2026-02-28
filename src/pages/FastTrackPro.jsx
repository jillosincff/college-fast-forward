import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { Zap, Building2, Users, MessageSquare, Map, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FastTrackHero from '../components/fasttrack/FastTrackHero';
import FastTrackQuickActions from '../components/fasttrack/FastTrackQuickActions';
import FastTrackChat from '../components/fasttrack/FastTrackChat';

export default function FastTrackPro() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'companies' | 'alumni' | 'roadmap'

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Zap className="w-12 h-12 text-[#FA4616] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to access Fast Track Pro</h2>
          <p className="text-slate-600 mb-4">AI-powered career intelligence for UF students</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>Sign In</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'AI Agent', icon: Sparkles },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'alumni', label: 'Alumni', icon: Users },
    { id: 'roadmap', label: 'Roadmap', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Hero Section */}
      <FastTrackHero user={user} />

      {/* Tab Navigation */}
      <div className="sticky top-16 md:top-24 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#0021A5] text-[#0021A5]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                  style={{ minHeight: 'auto', minWidth: 'auto', width: 'auto' }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'chat' && (
          <FastTrackChat user={user} />
        )}

        {activeTab === 'companies' && (
          <FastTrackComingSoon
            icon={Building2}
            title="Company Intelligence"
            description="Search any company to get real-time hiring signals, open roles, salary data, and interview tips — all synthesized by AI."
            features={[
              'Hiring health score (Hot / Warm / Cool)',
              'Current open roles and salary ranges',
              'Recent news and growth signals',
              'Interview process breakdown'
            ]}
          />
        )}

        {activeTab === 'alumni' && (
          <FastTrackComingSoon
            icon={Users}
            title="Alumni Discovery"
            description="Find UF alumni working at your target companies. Get match scores based on shared major, department, and seniority."
            features={[
              'Discover alumni at any company',
              'Relevance scoring (0-100)',
              'AI-generated outreach messages',
              'Direct connection suggestions'
            ]}
          />
        )}

        {activeTab === 'roadmap' && (
          <FastTrackComingSoon
            icon={Map}
            title="Career Roadmap"
            description="Get a personalized, week-by-week action plan tailored to your goals, timeline, and target companies."
            features={[
              'Week-by-week action items',
              'Application deadline tracking',
              'Networking milestones',
              'Progress tracking & nudges'
            ]}
          />
        )}
      </div>
    </div>
  );
}

function FastTrackComingSoon({ icon: Icon, title, description, features }) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-[#0021A5]/10 to-[#FA4616]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-[#0021A5]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-3">{title}</h2>
      <p className="text-slate-600 mb-8">{description}</p>
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-left mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">What's coming</h3>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs">✓</span>
              </span>
              <span className="text-slate-700 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0021A5]/5 to-[#FA4616]/5 border border-[#0021A5]/20 rounded-full px-5 py-2.5">
        <Zap className="w-4 h-4 text-[#FA4616]" />
        <span className="text-sm font-semibold text-[#0021A5]">Coming Soon</span>
      </div>
    </div>
  );
}
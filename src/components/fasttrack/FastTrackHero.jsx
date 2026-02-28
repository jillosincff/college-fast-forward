import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

export default function FastTrackHero({ user }) {
  const firstName = user?.full_name?.split(' ')[0] || 'Gator';

  return (
    <div className="bg-gradient-to-br from-[#0021A5] via-[#001580] to-[#0A1045] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#FA4616]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Fast Track Pro</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Hey {firstName} <span className="inline-block">👋</span>
        </h1>
        <p className="text-white/80 text-sm sm:text-base max-w-xl">
          Your AI career agent is ready. Search companies, discover alumni connections, and get personalized outreach — all powered by intelligence.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FA4616]" />
            Company Intel
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FA4616]" />
            Alumni Discovery
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FA4616]" />
            AI Outreach
          </div>
        </div>
      </div>
    </div>
  );
}
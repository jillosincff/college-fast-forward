import React from 'react';
import { Users, BrainCircuit } from 'lucide-react';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS, HERO_HEADING_CLASSES, HERO_SUBHEADING_CLASSES } from '@/components/home/HeroStyles';

export default function EmergingGatorsHero({ onBrowse }) {
  const scrollToHowItWorks = () => {
    console.log("Scroll to how it works section");
  };

  return (
    <div className="relative overflow-hidden text-white py-16 px-4" style={HERO_BG_GRADIENT}>
      {HERO_TEXTURE_OVERLAY}
      {HERO_GLOW_EFFECTS}

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          ✅ Gators find help every day through our network!
        </div>
        <h1 className={HERO_HEADING_CLASSES}>Students Seeking Your Help</h1>
        <p className={`${HERO_SUBHEADING_CLASSES} mb-8 mt-4`}>
          Your network could be their breakthrough
        </p>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <button 
            onClick={onBrowse} 
            className="bg-white text-[#0021A5] hover:bg-white/90 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            View All Requests
          </button>
          <button 
            onClick={scrollToHowItWorks} 
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-2 border-white/30 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
          >
            How It Works
          </button>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <span className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Users size={16} /> 3+ new requests this week
          </span>
          <span className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <BrainCircuit size={16} /> AI-matched by industry & goals
          </span>
        </div>
      </div>
    </div>
  );
}
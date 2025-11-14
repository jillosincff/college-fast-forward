import React from 'react';
import { Users, BrainCircuit } from 'lucide-react';

export default function EmergingGatorsHero({ onBrowse }) {
  const scrollToHowItWorks = () => {
    console.log("Scroll to how it works section");
  };

  return (
    <div className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] text-white py-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          ✅ 847 students found help today
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Students Seeking Your Help</h1>
        <p className="text-lg md:text-xl text-white opacity-90 mb-8 leading-relaxed">
          Real students, real dreams, real opportunities to make a difference. 
          <strong> Your network could be their breakthrough.</strong>
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
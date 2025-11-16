import React from 'react';
import { motion } from 'framer-motion';
import { HandHeart, Building, Users } from 'lucide-react';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS } from '@/components/home/HeroStyles';

const StatPill = ({ icon: Icon, value, label, color }) => (
  <div className="flex items-center gap-3">
    <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  </div>
);

export default function AlumniHero({ user, stats, isFirstLogin }) {
  return (
    <div className="relative text-white overflow-hidden" style={HERO_BG_GRADIENT}>
      {HERO_TEXTURE_OVERLAY}
      {HERO_GLOW_EFFECTS}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isFirstLogin ? `Welcome, ${user?.full_name?.split(' ')[0]}!` : `Welcome back, ${user?.full_name?.split(' ')[0]}!`}
        </motion.h1>
        <motion.p
          className="text-xl text-[#FA4616] font-semibold max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isFirstLogin ? "We're so glad you're here to help the next generation of Gators." : "Ready to make an impact today? Let's get started."}
        </motion.p>
        <motion.div 
          className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.2 }}
        >
          <StatPill icon={HandHeart} value={stats.studentsHelped || 0} label="Students Helped" color="text-green-300" />
          <StatPill icon={Building} value={stats.opportunitiesPosted || 0} label="Opportunities Posted" color="text-orange-300" />
          <StatPill icon={Users} value={stats.connectionsMade || 0} label="Connections Made" color="text-purple-300" />
        </motion.div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { getGreeting, displayName, isFirstTimeVisit } from '@/components/utils/greetingLogic';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import { HERO_BG_GRADIENT, HERO_TEXTURE_OVERLAY, HERO_GLOW_EFFECTS, HERO_HEADING_CLASSES, HERO_SUBHEADING_CLASSES, HERO_DESCRIPTION_CLASSES } from '@/components/home/HeroStyles';

export default function WelcomeHero({ user }) {
  const { greeting, firstName, isFirstTime } = getGreeting(user);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-3xl border p-6 md:p-8 shadow-sm relative overflow-hidden"
        style={HERO_BG_GRADIENT}
      >
        {HERO_TEXTURE_OVERLAY}
        {HERO_GLOW_EFFECTS}

        <div className="relative">
          {isFirstTime && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
              className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white mb-3"
            >
              <Sparkles className="w-4 h-4" />
              <span>Let's get started!</span>
            </motion.div>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {greeting}, <span className="text-white opacity-90">{firstName}</span>!
          </h1>
          <p className={`${HERO_DESCRIPTION_CLASSES} mt-2`}>
            {isFirstTime
              ? "Here's your starting point for connecting with the Gator network."
              : "Ready to make some connections and find opportunities?"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('Connections')}
              className="bg-white text-[#0021A5] hover:bg-white/90 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Browse Network <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('Profile')}
              variant="outline"
              className="rounded-xl border-white text-white hover:bg-white/10"
            >
              View My Profile
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
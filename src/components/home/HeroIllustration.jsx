import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Users, Star, Mail, Heart, Network } from 'lucide-react';

const FloatingIcon = ({ icon: Icon, className, delay = 0, amplitude = 20, ariaLabel }) => (
  <motion.div
    className={`absolute w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/25 shadow-lg ${className}`}
    initial={{ opacity: 0, scale: 0, y: amplitude }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      y: [amplitude, -amplitude, amplitude],
    }}
    transition={{ 
      opacity: { duration: 0.8, delay },
      scale: { duration: 0.6, delay },
      y: {
        duration: 4,
        delay: delay + 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }}
    role="img"
    aria-label={ariaLabel}
  >
    <Icon className="w-7 h-7 text-white drop-shadow-sm" aria-hidden="true" />
  </motion.div>
);

export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center" role="img" aria-label="University of Florida community network illustration">
      {/* Central Graduation Cap */}
      <motion.div 
        className="relative w-32 h-32 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl backdrop-blur-md z-20"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        role="img"
        aria-label="University of Florida graduation cap representing education"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-[var(--uf-orange)] to-[#E24B14] rounded-full flex items-center justify-center shadow-xl">
          <GraduationCap className="w-12 h-12 text-white drop-shadow-md" aria-hidden="true" />
        </div>
      </motion.div>

      {/* Orbiting UF-themed Icons */}
      <FloatingIcon 
        icon={Briefcase} 
        className="top-8 left-1/2 -translate-x-1/2" 
        delay={0.6}
        amplitude={15}
        ariaLabel="Career opportunities"
      />
      <FloatingIcon 
        icon={Users} 
        className="bottom-8 left-1/2 -translate-x-1/2" 
        delay={0.8}
        amplitude={18}
        ariaLabel="Community connections"
      />
      <FloatingIcon 
        icon={Star} 
        className="left-8 top-1/2 -translate-y-1/2" 
        delay={1.0}
        amplitude={12}
        ariaLabel="Featured opportunities"
      />
      <FloatingIcon 
        icon={Mail} 
        className="right-8 top-1/2 -translate-y-1/2" 
        delay={1.2}
        amplitude={16}
        ariaLabel="Communication and networking"
      />
      <FloatingIcon 
        icon={Heart} 
        className="top-16 right-16" 
        delay={1.4}
        amplitude={14}
        ariaLabel="Parent and family support"
      />
      <FloatingIcon 
        icon={Network} 
        className="top-16 left-16" 
        delay={1.5}
        amplitude={17}
        ariaLabel="Professional networking"
      />
      <FloatingIcon 
        icon={Users} 
        className="bottom-16 left-16" 
        delay={1.6}
        amplitude={20}
        ariaLabel="Alumni network"
      />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-[var(--uf-orange)]/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl" aria-hidden="true" />
      <div className="absolute bottom-1/3 left-1/4 w-16 h-16 bg-[var(--uf-orange)]/10 rounded-full blur-xl" aria-hidden="true" />
    </div>
  );
}
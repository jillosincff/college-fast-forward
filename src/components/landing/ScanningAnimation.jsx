import React from 'react';
import { motion } from 'framer-motion';

const companies = [
  { name: 'Nike', color: '#FA4616' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Goldman', color: '#7B6427' },
];

export default function ScanningAnimation() {
  return (
    <div className="relative mb-8">
      {/* Scanning text with animated dots */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {/* Animated radar ring */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FA4616]"
            animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FA4616]"
            animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
          <div className="w-2 h-2 rounded-full bg-[#FA4616]" style={{ boxShadow: '0 0 8px rgba(250,70,22,0.8)' }} />
        </div>

        <span className="text-[#FA4616] text-[13px] sm:text-sm font-bold tracking-[0.15em] uppercase">
          Scanning UF Alumni Network
        </span>

        {/* Trailing dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#FA4616]"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Pulsing connection line between cards */}
      <div className="relative h-1 max-w-xs mx-auto mb-4 rounded-full overflow-hidden" style={{ background: 'rgba(250,70,22,0.1)' }}>
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: '40%',
            background: 'linear-gradient(90deg, transparent, #FA4616, transparent)',
            boxShadow: '0 0 20px rgba(250,70,22,0.6)',
          }}
          animate={{ x: ['-40%', '280%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Company logo badges pulsing */}
      <div className="flex items-center justify-center gap-4">
        {companies.map((c, i) => (
          <motion.div
            key={c.name}
            className="px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
            style={{
              color: c.color,
              border: `1px solid ${c.color}33`,
              background: `${c.color}0D`,
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                `0 0 0px ${c.color}00`,
                `0 0 16px ${c.color}40`,
                `0 0 0px ${c.color}00`,
              ],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          >
            {c.name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
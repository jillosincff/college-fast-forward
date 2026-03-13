import React from 'react';
import { motion } from 'framer-motion';

const dots = [0, 1, 2, 3, 4];

export default function ScanningAnimation() {
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      <div className="flex items-center gap-1.5">
        {dots.map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#FA4616' }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.3, 0.8],
              boxShadow: [
                '0 0 0px rgba(250,70,22,0)',
                '0 0 8px rgba(250,70,22,0.6)',
                '0 0 0px rgba(250,70,22,0)',
              ],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span className="text-[#FA4616]/80 text-[11px] sm:text-xs font-semibold tracking-wide uppercase ml-1">
        Scanning UF alumni network…
      </span>
    </div>
  );
}
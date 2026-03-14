import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = ['Confirm profile', 'Target companies', 'Location & timeline', 'Resume'];

export default function FastIQSetupProgress({ currentStep }) {
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div style={{ padding: '24px 24px 12px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap className="w-5 h-5" style={{ color: '#E85D20' }} />
          <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: 'rgba(244,240,232,0.8)' }}>
            FASTIQ™ Setup
          </span>
        </div>
        <span style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 12, color: 'rgba(244,240,232,0.4)' }}>
          {currentStep + 1} of {STEPS.length}
        </span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: 'linear-gradient(90deg, #E85D20, #FF8A50)', borderRadius: 100 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
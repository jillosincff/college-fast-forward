import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function ParentWeeklySummary({ studentName, weeklyStats }) {
  const { companies = 0, alumni = 0, messages = 0 } = weeklyStats;
  const hasActivity = companies > 0 || alumni > 0 || messages > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
      <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em] mb-4">This Week</h2>
      <div
        className="rounded-xl p-5"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            {hasActivity ? (
              <p className="text-[14px] text-white leading-relaxed">
                📊 This week, <span className="font-bold">{studentName || 'your student'}</span> researched{' '}
                <span className="font-bold text-blue-400">{companies}</span> {companies === 1 ? 'company' : 'companies'}, found{' '}
                <span className="font-bold text-orange-400">{alumni}</span> alumni, and sent{' '}
                <span className="font-bold text-green-400">{messages}</span> outreach {messages === 1 ? 'message' : 'messages'}.
              </p>
            ) : (
              <p className="text-[14px] text-slate-400 leading-relaxed">
                📊 {studentName || 'Your student'} hasn't been active on FASTIQ this week yet. A gentle nudge might help!
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';

export default function AnswerSuccessState({ 
  studentName, 
  onDashboard, 
  onHelpAnother, 
  hasMoreQuestions = false 
}) {
  const initial = studentName?.charAt(0)?.toUpperCase() || '?';
  
  return (
    <div className="text-center py-12 px-8">
      {/* Celebration emoji with animation */}
      <motion.div 
        className="text-6xl mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        🎉
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your advice is on its way to {studentName}.
        </h1>
        
        {/* Student mini-card */}
        <div className="inline-flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2 my-6">
          <div className="w-10 h-10 rounded-full bg-[#0021A5] flex items-center justify-center text-white font-bold">
            {initial}
          </div>
          <p className="text-slate-600 text-sm">
            {studentName} will be notified and can reply directly.
          </p>
        </div>
        
        <p className="text-slate-600 mb-8">
          You just made a Gator's day.<br />
          Welcome to the College Fast Forward network.
        </p>
        
        {/* Primary CTA */}
        <button
          onClick={onDashboard}
          className="w-full max-w-xs mx-auto py-4 bg-[#0021A5] hover:bg-[#001580] text-white font-bold rounded-xl transition-colors shadow-lg"
        >
          Go to My Dashboard
        </button>
        
        {/* Optional: Help another */}
        {hasMoreQuestions && (
          <button
            onClick={onHelpAnother}
            className="mt-4 text-[#0021A5] hover:text-[#001580] text-sm font-medium"
          >
            Want to help another student?
          </button>
        )}
      </motion.div>
    </div>
  );
}
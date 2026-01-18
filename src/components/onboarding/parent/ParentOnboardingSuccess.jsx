import React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function ParentOnboardingSuccess({ 
  result,
  onComplete
}) {
  const { answeredQuestion, studentName, skippedAll, noQuestions, referredSomeone } = result || {};

  return (
    <div className="text-center py-8">
      {answeredQuestion ? (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            You just helped your first Gator! 🐊
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            {studentName || 'The student'} will be notified of your response. 
            Welcome to College Fast Forward.
          </p>
        </>
      ) : noQuestions ? (
        <>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#0021A5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            You're all set!
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            We don't have any questions matching your expertise right now. 
            We'll notify you when one comes in!
          </p>
        </>
      ) : skippedAll ? (
        <>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#0021A5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            No worries!
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            You can answer questions anytime from your dashboard. 
            We'll notify you when new questions match your expertise.
          </p>
        </>
      ) : (
        <>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#0021A5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome to College Fast Forward!
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            You're all set up and ready to help students.
          </p>
        </>
      )}

      <button
        onClick={onComplete}
        className="inline-flex items-center gap-2 py-4 px-8 rounded-xl font-bold text-lg bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl transition-all"
      >
        Go to My Dashboard
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
import React from 'react';

// Public success page after a School Year gift checkout. No Jill name/photo.
export default function ForParentsThanks() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="max-w-[440px] w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎁</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-slate-900 mb-2">Your gift is on its way</h1>
        <p className="text-[15px] text-slate-600 leading-relaxed mb-5">
          You just gave your student CLIFF Pro through August 2027. We've emailed them with everything they need. Pro is on through August 31, 2027, then it simply ends — no subscription to cancel.
        </p>
        <p className="text-[13px] text-slate-500 mb-6">
          Full refund within 14 days if they don't use it — just reply to your receipt email.
        </p>
        <a
          href="https://collegefastforward.com/#/ForParents"
          className="inline-block rounded-full border border-slate-300 text-slate-700 font-semibold text-[14px] px-6 py-3"
        >
          Back to CLIFF
        </a>
      </div>
    </div>
  );
}
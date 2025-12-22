import React from 'react';
import ProgressBar from './ProgressBar';

export default function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps,
  onBack,
  onNext,
  nextLabel = 'Continue →',
  nextDisabled = false,
  showBack = true,
  showSkip = false,
  onSkip
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Progress Bar - Fixed at top */}
      <div className="sticky top-0 z-10 bg-white pt-4 px-4 pb-2">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {children}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-4 safe-area-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          {showBack && currentStep > 1 && (
            <button 
              onClick={onBack}
              className="px-5 py-3.5 border-2 border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ← Back
            </button>
          )}
          
          {showSkip && (
            <button 
              onClick={onSkip}
              className="px-4 py-3.5 text-slate-500 font-medium hover:text-slate-700 transition-colors text-sm"
            >
              Skip
            </button>
          )}
          
          <button 
            onClick={onNext}
            disabled={nextDisabled}
            className={`
              flex-1 py-3.5 rounded-xl font-semibold text-base transition-all
              ${nextDisabled 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-[#0021A5] text-white hover:bg-[#001580]'
              }
            `}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
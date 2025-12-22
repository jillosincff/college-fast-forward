import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function WelcomeModal({ userName, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      localStorage.setItem('welcome_modal_seen', 'true');
      onClose();
    }, 200);
  };

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-opacity duration-200
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4
          transform transition-all duration-200
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🐊</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Welcome to College Fast Forward!
            </h2>
            {userName && (
              <p className="text-slate-500">Great to have you, {userName}!</p>
            )}
          </div>

          {/* How it works */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Here's how you can help today:
            </p>
            
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-[#0021A5] rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Connect with Your Gator</h3>
                  <p className="text-sm text-slate-500">Link your student's account to boost their profile</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-[#0021A5] rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Answer Student Questions</h3>
                  <p className="text-sm text-slate-500">Share your wisdom. Earn karma → your student gets boosted.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-[#0021A5] rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Share Job Opportunities</h3>
                  <p className="text-sm text-slate-500">Know of an opening? Post it for students to see.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Email notification note */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600">
              💡 <strong className="text-slate-700">We'll email you</strong> when a student reaches out for help.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClose}
            className="w-full py-4 bg-[#0021A5] hover:bg-[#001580] text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Let's Go! →
          </button>

        </div>
      </div>
    </div>
  );
}
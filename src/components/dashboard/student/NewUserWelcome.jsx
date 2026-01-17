import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight } from 'lucide-react';

const HELP_OPTIONS = [
  { id: 'job', label: 'Finding a job or internship', emoji: '💼' },
  { id: 'industry', label: 'Breaking into an industry', emoji: '🚀' },
  { id: 'resume', label: 'Resume or interview advice', emoji: '📝' },
  { id: 'networking', label: 'Networking tips', emoji: '🤝' },
  { id: 'other', label: 'Something else', emoji: '✨' },
];

export default function NewUserWelcome({ user }) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleGetStarted = () => {
    // Navigate to PostRequest with pre-selected category if applicable
    const params = selectedOption ? `?category=${selectedOption}` : '';
    navigate(`PostRequest${params}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
      <div className="p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          Welcome to the UF Network!
        </h2>
        <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
          Thousands of UF parents and alumni are ready to help with your career.
        </p>

        <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 text-left">
            What do you need help with?
          </h3>
          
          <div className="space-y-2">
            {HELP_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  selectedOption === option.id
                    ? 'border-[#0021A5] bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className="font-medium">{option.label}</span>
                {selectedOption === option.id && (
                  <span className="ml-auto text-[#0021A5]">✓</span>
                )}
              </button>
            ))}
          </div>

          <Button
            onClick={handleGetStarted}
            className="w-full mt-6 bg-[#0021A5] hover:bg-blue-800 text-white h-12 text-lg font-semibold"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
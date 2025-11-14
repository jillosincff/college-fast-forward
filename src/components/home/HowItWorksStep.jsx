import { memo } from 'react';

const HowItWorksStep = memo(({ icon: Icon, number, text, isHighlighted }) => {
  return (
    <div 
      className={`text-center transition-opacity duration-500 ${isHighlighted ? 'opacity-100' : 'opacity-75'}`} 
      role="listitem"
    >
      <div 
        className={`relative w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl ring-4 ring-white transition-all duration-300 shadow-lg ${
          isHighlighted 
            ? 'bg-[var(--uf-orange)] shadow-xl scale-105' 
            : 'bg-slate-400 hover:bg-slate-500'
        }`}
        aria-label={`Step ${number}`}
      >
        <Icon className="w-8 h-8 text-white" aria-hidden="true" />
        <span className="sr-only">Step {number}</span>
      </div>
      <h3 className="font-semibold text-slate-800 text-lg leading-tight">{text}</h3>
    </div>
  );
});

HowItWorksStep.displayName = 'HowItWorksStep';

export default HowItWorksStep;
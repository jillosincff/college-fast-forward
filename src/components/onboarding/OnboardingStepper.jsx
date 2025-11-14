import { motion } from 'framer-motion';

export default function OnboardingStepper({ steps, currentStep }) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between relative mb-3">
        {steps.map((step, index) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= step.id ? 'bg-[var(--uf-blue)] text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {currentStep > step.id ? '✔' : step.id}
            </div>
          </div>
        ))}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2">
          <motion.div 
            className="h-1 bg-[var(--uf-blue)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        {steps.map(step => (
           <p key={step.id} className={`text-sm w-1/3 text-center ${currentStep === step.id ? 'font-bold text-[var(--uf-blue)]' : 'text-slate-500'}`}>
             {step.label}
           </p>
        ))}
      </div>
    </div>
  );
}
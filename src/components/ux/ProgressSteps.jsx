import { Check } from 'lucide-react';

export default function ProgressSteps({ 
  steps, 
  currentStep, 
  completedSteps = [], 
  variant = 'default' 
}) {
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id || index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isCompleted 
                  ? 'bg-green-600 border-green-600 text-white' 
                  : isCurrent 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-500'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-3 flex-1">
                <div className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-600' : 
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 mx-4 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
        </p>
      </div>
    </div>
  );
}

// Usage example steps format:
export const onboardingSteps = [
  { id: 'profile', title: 'Profile Info', description: 'Basic information' },
  { id: 'interests', title: 'Your Interests', description: 'Tell us about yourself' },
  { id: 'review', title: 'Review', description: 'Confirm details' }
];
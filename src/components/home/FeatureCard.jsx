import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeatureCard = memo(({ 
  icon: Icon, 
  title, 
  description, 
  onExploreClick, 
  colorScheme
}) => {
  const cardColorSchemes = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600' }
  };

  const colors = cardColorSchemes[colorScheme] || cardColorSchemes.blue;

  return (
    <div 
      className={`p-6 ${colors.bg} rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col text-center justify-between h-80`}
    >
      <div>
        {Icon && (
          <div className="flex justify-center mb-4">
            <div className={`p-3 bg-white rounded-xl`}>
                <Icon className={`w-10 h-10 ${colors.icon}`} />
            </div>
          </div>
        )}
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div>
        <Button
          variant="ghost"
          onClick={onExploreClick}
          className={`${colors.icon} font-semibold mt-4 hover:bg-black/5`}
        >
          Explore <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default FeatureCard;
import { navigate } from '@/components/utils/navigation';
import { trackEvent } from '@/components/utils/analytics';

export default function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  to, 
  eventName, 
  iconBgColor, 
  onClick 
}) {
  const handleClick = () => {
    if (eventName) {
      trackEvent(eventName);
    }
    
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
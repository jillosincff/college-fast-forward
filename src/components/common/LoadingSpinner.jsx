import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'default', 
  text = 'Loading...', 
  className = '',
  variant = 'default' 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    default: 'text-blue-600',
    orange: 'text-orange-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${variants[variant]} animate-spin`} />
      {text && (
        <p className={`text-sm ${variant === 'white' ? 'text-white' : 'text-gray-600'} font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
}

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span className="text-sm">{text}</span>
  </div>
);

export const ButtonLoader = () => (
  <Loader2 className="w-4 h-4 animate-spin" />
);
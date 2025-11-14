import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ErrorState({
  title = "Something went wrong",
  message = "We're having trouble loading this page. Please try again.",
  showRetry = true,
  showHome = false,
  onRetry,
  variant = 'default'
}) {
  const variants = {
    default: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500'
  };

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        <AlertCircle className={`w-12 h-12 ${variants[variant]}`} />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      <div className="flex gap-3 justify-center">
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        {showHome && (
          <Button onClick={() => navigate('Dashboard')} className="bg-blue-600 hover:bg-blue-700">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// Pre-configured error states
export const NetworkError = ({ onRetry }) => (
  <ErrorState
    title="Connection Problem"
    message="Please check your internet connection and try again."
    onRetry={onRetry}
    showHome
  />
);

export const NotFoundError = () => (
  <ErrorState
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
    showRetry={false}
    showHome
    variant="warning"
  />
);

export const AuthError = () => (
  <ErrorState
    title="Please Sign In"
    message="You need to be signed in to access this page."
    showRetry={false}
    showHome
    variant="info"
  />
);
import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClass: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClass: 'text-blue-600'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-600'
  }
};

export default function Toast({ 
  type = 'info', 
  title, 
  message, 
  isVisible = true, 
  onClose,
  duration = 5000 
}) {
  const variant = toastVariants[type];
  const Icon = variant.icon;

  React.useEffect(() => {
    if (duration && isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg p-4 shadow-lg ${variant.className}`}
        >
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${variant.iconClass}`} />
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
              )}
              {message && (
                <p className="text-sm opacity-90">{message}</p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast hook for easy usage
export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = React.useMemo(() => ({
    success: (message, title) => addToast({ type: 'success', title, message }),
    error: (message, title) => addToast({ type: 'error', title, message }),
    info: (message, title) => addToast({ type: 'info', title, message }),
    warning: (message, title) => addToast({ type: 'warning', title, message })
  }), [addToast]);

  return { toast, toasts, removeToast };
}
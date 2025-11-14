/**
 * Global Error Handler - Catches ALL errors and handles them gracefully
 * Prevents app crashes and provides user feedback
 */

import { errorReporter } from './errorReporter';

let errorCount = 0;
const ERROR_THRESHOLD = 5; // Max errors before showing alert
const ERROR_WINDOW = 60000; // 1 minute

// Toast notification function
const showUserNotification = (message, type = 'error') => {
  // Use toast if available
  if (typeof window !== 'undefined' && window.__cff_toast) {
    window.__cff_toast({
      title: type === 'error' ? '⚠️ Something went wrong' : 'ℹ️ Notice',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  } else {
    // Fallback to console
    console.warn('User notification:', message);
  }
};

// Track errors over time
let recentErrors = [];

const trackError = (error) => {
  const now = Date.now();
  recentErrors.push(now);
  
  // Clean old errors outside the window
  recentErrors = recentErrors.filter(time => now - time < ERROR_WINDOW);
  
  // Check if we're getting too many errors
  if (recentErrors.length >= ERROR_THRESHOLD) {
    console.error('🚨 HIGH ERROR RATE DETECTED:', recentErrors.length, 'errors in last minute');
    showUserNotification(
      'We\'re experiencing some issues. Our team has been notified. Try refreshing the page.',
      'error'
    );
    // Reset counter to avoid spam
    recentErrors = [];
  }
};

// Main global error handler
export const initGlobalErrorHandler = () => {
  if (typeof window === 'undefined') return;

  console.log('🛡️ Global error handler initialized');

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    
    console.error('🔴 Uncaught Error:', {
      message: error.message,
      stack: error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });

    trackError(error);
    errorReporter.report(error, {
      type: 'uncaught_error',
      filename: event.filename,
      lineno: event.lineno
    });

    // Prevent default browser error handling
    event.preventDefault();
    return false;
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    console.error('🔴 Unhandled Promise Rejection:', {
      reason: reason,
      promise: event.promise
    });

    trackError(reason);
    errorReporter.report(reason, {
      type: 'unhandled_rejection'
    });

    showUserNotification(
      'An unexpected error occurred. Please try again or refresh the page.',
      'error'
    );

    // Prevent default
    event.preventDefault();
  });

  // Handle React errors (backup to ErrorBoundary)
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorString = args.join(' ');
    
    // Detect React errors
    if (errorString.includes('React') || errorString.includes('component')) {
      trackError(new Error(errorString));
    }
    
    originalConsoleError.apply(console, args);
  };

  console.log('✅ Global error handling active');
};

// Function to manually report errors
export const reportError = (error, context = {}) => {
  trackError(error);
  errorReporter.report(error, context);
};

// Function to check if app is healthy
export const healthCheck = () => {
  const now = Date.now();
  const recentErrorCount = recentErrors.filter(time => now - time < ERROR_WINDOW).length;
  
  return {
    healthy: recentErrorCount < ERROR_THRESHOLD,
    errorCount: recentErrorCount,
    message: recentErrorCount >= ERROR_THRESHOLD 
      ? '⚠️ High error rate detected' 
      : '✅ System healthy'
  };
};

export default {
  init: initGlobalErrorHandler,
  report: reportError,
  healthCheck
};
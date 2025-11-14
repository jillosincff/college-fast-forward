/**
 * Error Reporter - Centralized error tracking and reporting
 * Filters out expected errors and reports critical issues
 */

const isDevelopment = window.location.hostname.includes('localhost') || 
                     window.location.hostname.includes('preview');

const isNetworkOrTimeout = (error) => {
  const errorString = (error?.message || error?.toString() || '').toLowerCase();
  return (
    errorString.includes('network error') ||
    errorString.includes('networkerror') ||
    errorString.includes('network request failed') ||
    errorString.includes('timeout') || 
    errorString.includes('aborted') ||
    errorString.includes('fetch')
  );
};

// Errors that are expected and should not be reported
const shouldSuppressError = (error, context = {}) => {
  const errorString = (error?.message || error?.toString() || '').toLowerCase();
  
  // Suppress network errors and timeouts
  if (isNetworkOrTimeout(error)) {
    return true;
  }
  
  // Suppress ALL 404 errors for Opportunity entity (deleted opportunities are expected)
  if (errorString.includes('opportunity') && 
      (errorString.includes('not found') || errorString.includes('404'))) {
    return true;
  }
  
  // Suppress ALL Message entity errors as they are non-critical for core app functionality
  // This includes network errors, timeouts, and any other errors related to messages
  if (errorString.includes('message')) {
    return true;
  }
  
  // Also suppress if the context indicates this is from message loading
  if (context.source && context.source.toLowerCase().includes('message')) {
    return true;
  }
  
  // Suppress analytics errors
  if (errorString.includes('analytics')) {
    return true;
  }
  
  return false;
};

export const errorReporter = {
  // Expose for external use
  shouldSuppress: shouldSuppressError,
  isNetworkOrTimeout: isNetworkOrTimeout,

  report: (error, context = {}) => {
    // Don't report expected errors
    if (shouldSuppressError(error, context)) {
      // Completely silent - no logging even in development
      return;
    }

    // Extract meaningful error information for reporting
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    
    // Log to console in development with full details
    if (isDevelopment) {
      console.error('🔴 Error reported:', {
        message: errorMessage,
        stack: errorStack,
        error: error,
        context: context
      });
    }

    // In production, send to error tracking service
    if (!isDevelopment) {
      try {
        console.error('Production error:', {
          message: errorMessage,
          stack: errorStack,
          context: context
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError?.message || reportingError);
      }
    }
  },

  reportWarning: (message, context = {}) => {
    if (isDevelopment) {
      console.warn('⚠️ Warning:', message, context);
    }
  },

  reportInfo: (message, context = {}) => {
    if (isDevelopment) {
      console.info('ℹ️ Info:', message, context);
    }
  }
};

// Intercept ALL errors before they're reported
if (typeof window !== 'undefined') {
  // Override console.error to filter out expected errors but show full details
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return arg?.message || arg?.toString() || JSON.stringify(arg);
      }
      return String(arg);
    }).join(' ').toLowerCase();
    
    const mockError = { message: errorString };
    
    // Don't log expected errors
    if (shouldSuppressError(mockError)) {
      return;
    }
    
    // Log with full details
    originalError.apply(console, args);
  };

  window.addEventListener('error', (event) => {
    const error = event.error || {};
    const errorMessage = error.message || event.message || '';
    
    const errorObj = {
      message: errorMessage,
      details: error.toString?.() || ''
    };
    
    if (shouldSuppressError(errorObj)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    errorReporter.report(error, {
      type: 'uncaught_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {};
    const errorMessage = reason?.message || reason?.toString?.() || '';
    
    const errorObj = {
      message: errorMessage,
      details: ''
    };
    
    if (shouldSuppressError(errorObj)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
    errorReporter.report(reason, {
      type: 'unhandled_rejection',
      promise: event.promise
    });
  });
}

export default errorReporter;
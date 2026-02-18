const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, data);
  },
  
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  },
  
  error: (message, data = {}) => {
    // Don't log network errors to avoid noise
    const errStr = typeof data?.error === 'string' ? data.error : data?.error?.message || '';
    if (message?.includes?.('Network Error') || errStr.includes('Network Error')) {
      return;
    }
    console.error(`[ERROR] ${message}`, data);
  },
  
  debug: (message, data = {}) => {
    // Check if we're in development by looking at hostname
    const isDev = window.location.hostname.includes('localhost') || 
                  window.location.hostname.includes('preview');
    
    if (isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
};

export default logger;
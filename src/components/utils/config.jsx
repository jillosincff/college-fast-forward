
// Environment configuration management
const config = {
  // Detect environment safely without relying on `process`
  isDevelopment: (() => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || 
               hostname.includes('preview') ||
               hostname.includes('dev');
    }
    // Default to production behavior in non-browser envs
    return false;
  })(),

  // API configuration
  api: {
    baseUrl: 'https://base44.app/api',
    timeout: 10000, // 10 seconds
  },

  // Feature flags
  features: {
    enableAnalytics: (() => {
        if (typeof window !== 'undefined') {
            return !window.location.hostname.includes('localhost');
        }
        return true;
    })(),
    enableErrorReporting: (() => {
        if (typeof window !== 'undefined') {
            return !window.location.hostname.includes('localhost');
        }
        return true;
    })(),
    enableWebSockets: true,
    enablePushNotifications: false, // TODO: Enable after implementing
  },

  // Rate limiting (client-side hints)
  rateLimits: {
    emailSending: {
      maxPerMinute: 5,
      maxPerHour: 20,
    },
    accountCreation: {
      maxPerMinute: 2,
      maxPerHour: 10,
    },
    formSubmissions: {
      maxPerMinute: 10,
      maxPerHour: 100,
    },
  },

  // Security settings
  security: {
    csrfTokenName: 'cff-csrf-token',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxFileUploadSize: 5 * 1024 * 1024, // 5MB
  },

  // App metadata
  app: {
    name: 'College Fast Forward',
    version: 'v1.2.0',
    supportEmail: 'support@collegefastforward.com',
  },
};

export default config;

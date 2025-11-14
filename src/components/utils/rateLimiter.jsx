
// Client-side rate limiter with Base44-optimized settings
const requestLog = new Map();

export const rateLimiter = {
  canMakeRequest: (userId, action, limit = 10, windowMs = 60000) => {
    const key = `${userId}-${action}`;
    const now = Date.now();
    const requests = requestLog.get(key) || [];
    
    // Clean old requests outside the time window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((windowMs - (now - validRequests[0])) / 1000),
        remainingRequests: 0
      };
    }
    
    validRequests.push(now);
    requestLog.set(key, validRequests);
    return { 
      allowed: true, 
      remainingRequests: limit - validRequests.length 
    };
  },

  // Pre-configured rate limits based on security best practices
  limits: {
    login: { limit: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 min
    emailInvite: { limit: 10, window: 60 * 60 * 1000 }, // 10 per hour
    jobRequest: { limit: 3, window: 60 * 60 * 1000 }, // 3 requests per hour
    message: { limit: 20, window: 60 * 60 * 1000 }, // 20 messages per hour
    apiCall: { limit: 100, window: 60 * 1000 }, // 100 per minute (generous for good UX)
    accountCreation: { limit: 2, window: 60 * 60 * 1000 }, // 2 per hour
  },

  // Helper method to check specific action types
  checkAction: (userId, actionType) => {
    const config = rateLimiter.limits[actionType];
    if (!config) {
      console.warn(`Unknown rate limit action: ${actionType}`);
      return { allowed: true };
    }
    return rateLimiter.canMakeRequest(userId, actionType, config.limit, config.window);
  },

  // Clean up old entries periodically to prevent memory leaks
  cleanup: () => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, requests] of requestLog.entries()) {
      const validRequests = requests.filter(time => now - time < maxAge);
      if (validRequests.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, validRequests);
      }
    }
  },

  // Method to clear test logs for reliable testing
  clear: (userId, action) => {
    const key = `${userId}-${action}`;
    if (requestLog.has(key)) {
      requestLog.delete(key);
    }
  }
};

// Cleanup every hour
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000);

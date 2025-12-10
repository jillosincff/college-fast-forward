/**
 * Simple rate limiter for API calls
 * Queues requests and executes them with delays to avoid 429 errors
 */

class ApiRateLimiter {
  constructor(maxCallsPerSecond = 3) {
    this.maxCallsPerSecond = maxCallsPerSecond;
    this.queue = [];
    this.processing = false;
    this.callTimestamps = [];
    this.retryDelays = [1000, 2000, 4000]; // Exponential backoff
  }

  async execute(apiCall) {
    return new Promise((resolve, reject) => {
      this.queue.push({ apiCall, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      // Clean up old timestamps (older than 1 second)
      const now = Date.now();
      this.callTimestamps = this.callTimestamps.filter(ts => now - ts < 1000);

      // If we've hit the rate limit, wait
      if (this.callTimestamps.length >= this.maxCallsPerSecond) {
        const oldestCall = this.callTimestamps[0];
        const waitTime = 1000 - (now - oldestCall);
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        continue;
      }

      // Execute next call
      const { apiCall, resolve, reject, retryCount = 0 } = this.queue.shift();
      this.callTimestamps.push(Date.now());

      try {
        const result = await apiCall();
        resolve(result);
      } catch (error) {
        // If 429, retry with exponential backoff
        if ((error.message?.includes('429') || error.message?.includes('Rate limit')) && retryCount < 3) {
          const delay = this.retryDelays[retryCount] || 4000;
          console.log(`Rate limit hit, retrying after ${delay}ms (attempt ${retryCount + 1}/3)`);
          await new Promise(r => setTimeout(r, delay));
          this.queue.push({ apiCall, resolve, reject, retryCount: retryCount + 1 });
        } else {
          reject(error);
        }
      }

      // Longer delay between calls to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    this.processing = false;
  }
}

// Global instance - reduced to 3 calls/second to be more conservative
const rateLimiter = new ApiRateLimiter(3);

export default rateLimiter;
/**
 * API Retry Logic - Automatically retry failed API calls
 * Improves reliability and reduces user-facing errors
 */

const DEFAULT_RETRIES = 2;
const DEFAULT_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {number} retries - Number of retries (default: 2)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise} - Result of the function
 */
export const retryAsync = async (fn, retries = DEFAULT_RETRIES, delay = DEFAULT_DELAY) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.status === 401 || error.status === 403 || error.status === 404) {
        throw error;
      }
      
      // Don't retry if this is the last attempt
      if (attempt === retries) {
        throw error;
      }
      
      // Calculate backoff delay (exponential)
      const backoffDelay = delay * Math.pow(2, attempt);
      console.log(`⏳ Retry attempt ${attempt + 1}/${retries} after ${backoffDelay}ms...`);
      
      await sleep(backoffDelay);
    }
  }
  
  throw lastError;
};

/**
 * Wrap an API call with retry logic
 * Usage: const data = await withRetry(() => api.getData())
 */
export const withRetry = (fn, options = {}) => {
  const { retries = DEFAULT_RETRIES, delay = DEFAULT_DELAY, context = {} } = options;
  
  return retryAsync(async () => {
    try {
      return await fn();
    } catch (error) {
      console.error('API call failed:', {
        error: error.message,
        context,
        willRetry: true
      });
      throw error;
    }
  }, retries, delay);
};

export default {
  retryAsync,
  withRetry
};
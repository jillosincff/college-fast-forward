/**
 * Simple client-side data cache to reduce redundant API calls
 */

class DataCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now() + ttl);
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    
    // Check if expired
    if (timestamp && Date.now() > timestamp) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  has(key) {
    const value = this.get(key);
    return value !== null && value !== undefined;
  }

  invalidate(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  invalidateAll() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Get or fetch pattern
  async getOrFetch(key, fetchFn, ttl) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      console.log(`💾 Cache hit: ${key}`);
      return cached;
    }

    console.log(`🔄 Cache miss: ${key}, fetching...`);
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const dataCache = new DataCache();

// Cleanup expired cache entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => dataCache.cleanup(), 10 * 60 * 1000);
}
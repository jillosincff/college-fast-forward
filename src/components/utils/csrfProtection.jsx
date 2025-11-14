// CSRF Protection using LocalStorage for better iframe compatibility
export class CSRFProtection {
  constructor() {
    this.tokenName = 'cff-csrf-token'; // Header name
    this.storageKey = 'csrf-token';    // localStorage key
    this.sessionToken = null;          // In-memory cache for performance
  }

  _generateToken() {
    if (typeof window === 'undefined' || !window.crypto) return null;
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  _getTokenFromStorage() {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(this.storageKey);
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
      return null;
    }
  }

  _setTokenInStorage(token) {
    if (typeof window === 'undefined' || !token) return;
    try {
      localStorage.setItem(this.storageKey, token);
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  getToken() {
    if (typeof window === 'undefined') return null;

    // 1. Check in-memory cache first
    if (this.sessionToken) {
      return this.sessionToken;
    }

    // 2. Check localStorage
    const storedToken = this._getTokenFromStorage();
    if (storedToken) {
      this.sessionToken = storedToken; // Cache it for this session
      return storedToken;
    }

    // 3. Generate, store, and cache a new token if none exists
    const newToken = this._generateToken();
    if (newToken) {
      this._setTokenInStorage(newToken);
      this.sessionToken = newToken;
    }
    return newToken;
  }

  addToHeaders(headers = {}) {
    return {
      ...headers,
      [this.tokenName]: this.getToken(),
    };
  }

  rotateToken() {
    if (typeof window === 'undefined') return null;
    const newToken = this._generateToken();
    if (newToken) {
      this._setTokenInStorage(newToken);
      this.sessionToken = newToken; // Update the session cache
    }
    return newToken;
  }

  clearToken() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn("Could not remove from localStorage:", e);
    }
    this.sessionToken = null;
  }
}

export const csrf = new CSRFProtection();
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import logger from '@/components/utils/logger';

export const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = useCallback(async (retryCount = 0) => {
    setIsLoading(true);
    
    // Check both regular query params AND hash query params
    const urlParams = new URLSearchParams(window.location.search);
    const hashParts = window.location.hash.split('?');
    const hashParams = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();
    const hasOAuthParams = urlParams.has('token') || urlParams.has('access_token') || hashParams.has('token') || hashParams.has('access_token');
    
    // If OAuth callback and first attempt, reload to let SDK process
    if (hasOAuthParams && retryCount === 0) {
      const processed = sessionStorage.getItem('oauth_processed');
      if (!processed) {
        console.log('🔄 [AuthContext] OAuth callback - marking as processed and reloading...');
        sessionStorage.setItem('oauth_processed', 'true');
        window.location.reload();
        return;
      }
      console.log('🔄 [AuthContext] OAuth processed, checking auth...');
      sessionStorage.removeItem('oauth_processed');
    }
    
    try {
      const userData = await base44.auth.me();
      
      console.log('✅ [AuthContext] Authenticated:', userData.email);
      setUser(userData);

      // Clean URL after successful auth
      if (hasOAuthParams) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);
      }
    } catch (error) {
      if (error.status === 401) {
        // If OAuth callback failed, try one more reload
        if (hasOAuthParams && retryCount === 0) {
          console.log('🔄 [AuthContext] Auth failed with OAuth params, reloading once more...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          window.location.reload();
          return;
        }
        console.log('❌ [AuthContext] Authentication failed');
        logger.info('Not authenticated');
      } else {
        logger.error('Auth failed', { error });
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  const login = useCallback((redirectUrl = null) => {
    try {
      const callbackUrl = redirectUrl || window.location.origin + '/#Dashboard';
      console.log('🔐 [AuthContext] Redirecting to login with callback:', callbackUrl);
      base44.auth.redirectToLogin(callbackUrl);
    } catch (e) {
      logger.error('Login redirect failed', { error: e });
      base44.auth.redirectToLogin(window.location.origin);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cff:firstLogin');
        localStorage.removeItem('cff:seenDashboardTour');
        document.cookie = 'cff_new_user=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
      
      await base44.auth.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      logger.error('Logout error', { error });
      setUser(null);
      window.location.href = '/';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      logger.error('Failed to refresh user', { error });
      if (error.status !== 401) {
        setUser(null);
      }
    }
  }, []);

  const updateAuthContextUser = useCallback((newUserData) => {
    setUser(newUserData);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    refreshUser,
    updateAuthContextUser,
  }), [user, isLoading, login, logout, refreshUser, updateAuthContextUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
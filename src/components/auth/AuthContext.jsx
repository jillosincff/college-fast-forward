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
    
    // Check if we're in OAuth callback flow
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('token') || urlParams.has('code') || urlParams.has('access_token');
    
    // If OAuth callback, wait for SDK to process it
    if (hasOAuthParams && retryCount === 0) {
      console.log('🔄 OAuth callback detected with params, waiting 3s for SDK...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    try {
      const userData = await base44.auth.me();
      
      console.log('🔐 Auth check - User data:', {
        email: userData.email,
        persona: userData.persona,
        roles: userData.roles,
        onboarding_completed: userData.onboarding_completed
      });
      
      setUser(userData);

      if (urlParams.has('token')) {
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      }
    } catch (error) {
      if (error.status === 401 || error.message?.includes('401')) {
        // Retry up to 3 times if this is OAuth callback
        if (hasOAuthParams && retryCount < 3) {
          console.log(`🔄 Auth failed (attempt ${retryCount + 1}/3), retrying in 2s...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return checkAuthState(retryCount + 1);
        }
        logger.info('User not authenticated - staying on current page');
      } else {
        logger.error('Authentication check failed', { error, status: error.status });
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
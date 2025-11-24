import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import logger from '@/components/utils/logger';
import { registerUser } from '@/functions/registerUser';
import { sendMagicLink } from '@/functions/sendMagicLink';

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

  const checkAuthState = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me();
      
      console.log('🔐 Auth check - User data:', {
        email: userData.email,
        persona: userData.persona,
        roles: userData.roles,
        onboarding_completed: userData.onboarding_completed
      });
      
      setUser(userData);

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      if (error.status === 401 || error.message?.includes('401')) {
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

  const loginWithMagicLink = useCallback(async () => {
    try {
      const callbackUrl = window.location.href;
      base44.auth.redirectToLogin(callbackUrl);
    } catch (e) {
      logger.error('Magic link login failed', { error: e });
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

  const registerWithPassword = useCallback(async (email, password, fullName) => {
    console.log('🔵 [AuthContext] registerWithPassword called', { email, fullName });
    try {
      const response = await registerUser({
        email,
        password,
        full_name: fullName,
        persona: 'student'
      });
      
      console.log('✅ [AuthContext] Registration response:', response.data);
      
      if (response.data?.success) {
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Registration error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    console.log('🔵 [AuthContext] loginWithPassword called', { email });
    try {
      // For now, redirect to magic link flow
      // TODO: Implement password login
      await sendMagicLinkEmail(email);
      return { success: true, message: 'Magic link sent to your email' };
    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);
      throw error;
    }
  }, []);

  const sendMagicLinkEmail = useCallback(async (email) => {
    console.log('🔵 [AuthContext] sendMagicLinkEmail called', { email });
    try {
      const response = await sendMagicLink({ email });
      console.log('✅ [AuthContext] Magic link response:', response.data);
      
      if (response.data?.success) {
        return { success: true, message: 'Check your email for a sign-in link!' };
      } else {
        throw new Error(response.data?.error || 'Failed to send magic link');
      }
    } catch (error) {
      console.error('❌ [AuthContext] Magic link error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to send magic link');
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    loginWithMagicLink,
    loginWithPassword,
    registerWithPassword,
    sendMagicLinkEmail,
    logout,
    refreshUser,
    updateAuthContextUser,
  }), [user, isLoading, loginWithMagicLink, loginWithPassword, registerWithPassword, sendMagicLinkEmail, logout, refreshUser, updateAuthContextUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
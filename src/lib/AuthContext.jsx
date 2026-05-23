// AuthContext v4 — simplified, non-blocking
import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // isLoadingPublicSettings is always false — no blocking public settings fetch needed
  const isLoadingPublicSettings = false;

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      return currentUser;
    } catch (e) {
      console.warn('refreshUser failed:', e);
    }
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const logout = () => {
    // Clear all session/local storage that could cause re-auth loops
    try {
      localStorage.removeItem('pending_invite_role');
      localStorage.removeItem('pending_invite_code');
      localStorage.removeItem('pending_student_email');
      localStorage.removeItem('pending_referral_code');
      localStorage.removeItem('oauth_attempt_count');
      localStorage.removeItem('oauth_start_time');
      sessionStorage.removeItem('pending_invite_role');
      sessionStorage.removeItem('pending_invite_code');
      sessionStorage.removeItem('cff_onboarding_type');
      sessionStorage.removeItem('oauth_callback_detected');
      sessionStorage.removeItem('oauth_state_token');
      sessionStorage.removeItem('email_click_tracked');
      sessionStorage.removeItem('utm_already_captured');
      sessionStorage.removeItem('migration_verified_email');
    } catch (e) { /* private browsing */ }

    setUser(null);
    setIsAuthenticated(false);
    // Navigate to Logout page first so layout resolves it immediately (no spinner),
    // then the Logout component handles the actual base44 auth.logout redirect.
    window.location.hash = '#/Logout';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      refreshUser,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
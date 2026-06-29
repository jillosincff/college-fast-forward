// AuthContext v5 — clean logout via React Router
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const AuthProviderInner = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

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
      await attributePendingReferral(currentUser);
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

  // One-time attribution: if the user arrived via a ?ref__= referral link, the
  // code was stashed in localStorage by App.jsx. On first authenticated load,
  // write it onto the user (only if not already attributed) so the referral
  // leaderboard can credit the referrer.
  const attributePendingReferral = async (currentUser) => {
    try {
      const pendingRef = localStorage.getItem('pendingReferralCode');
      if (!pendingRef || !currentUser || currentUser.referral_code_used) return;
      await base44.auth.updateMe({
        referral_code_used: pendingRef,
        referral_used_at: new Date().toISOString(),
      });
      localStorage.removeItem('pendingReferralCode');
    } catch (e) {
      console.warn('Referral attribution failed:', e);
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

  const logout = async () => {
    // The session token lives in localStorage (base44_access_token), so clearing
    // storage fully ends the session. We intentionally do NOT call
    // base44.auth.logout() — it round-trips through Base44's hosted logout page,
    // which flashes the black hosted login screen before redirecting back.
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) { /* private browsing */ }

    // Point the URL at the HOME route ("/", the public landing page) BEFORE
    // reloading, so the fresh document load re-initializes unauthenticated
    // directly on the home page — never bouncing through the dark /GatorAuth
    // screen (which is what happened when we reloaded the guarded page they
    // logged out from).
    window.history.replaceState(null, '', window.location.origin + '/#/');
    window.location.reload();
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

export const AuthProvider = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
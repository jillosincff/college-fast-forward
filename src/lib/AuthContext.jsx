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

  const logout = async () => {
    // The session token lives in localStorage (base44_access_token), so clearing
    // storage fully ends the session. We intentionally do NOT call
    // base44.auth.logout() — it round-trips through Base44's hosted logout page,
    // which flashes the black hosted login screen before redirecting back.
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) { /* private browsing */ }

    // IMPORTANT: do NOT clear React auth state here. Setting user=null causes
    // OnboardingGuard to instantly redirect to /GatorAuth (the dark login page),
    // which flashes before the reload below. The full reload re-initializes the
    // app unauthenticated anyway.
    //
    // Point the hash at the landing page FIRST, then do a full reload of that
    // same URL. Calling replace() + reload() separately races: reload() reloads
    // the page they logged out from, which (now unauthenticated) bounces to the
    // dark /GatorAuth screen. Setting window.location.href to the target hash and
    // hard-reloading guarantees they land on the home page.
    window.location.href = window.location.origin + '/#/StudentLandingPage';
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
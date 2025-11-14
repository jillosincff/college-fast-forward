import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X, Settings } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, cannot be disabled
    analytics: true,
    functional: true,
    advertising: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    } else {
      // Load saved preferences
      const savedPrefs = JSON.parse(cookieConsent);
      setPreferences(savedPrefs);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      functional: true,
      advertising: true
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setCookies(allAccepted);
    setIsVisible(false);
    trackEvent('Cookie Consent', { action: 'accept_all' });
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false,
      advertising: false
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(essentialOnly));
    setCookies(essentialOnly);
    setIsVisible(false);
    trackEvent('Cookie Consent', { action: 'reject_all' });
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setCookies(preferences);
    setIsVisible(false);
    setShowSettings(false);
    trackEvent('Cookie Consent', { action: 'save_preferences', preferences });
  };

  const setCookies = (prefs) => {
    // Set actual cookie flags based on preferences
    document.cookie = `analytics_enabled=${prefs.analytics}; path=/; max-age=${365 * 24 * 60 * 60}`;
    document.cookie = `functional_enabled=${prefs.functional}; path=/; max-age=${365 * 24 * 60 * 60}`;
    document.cookie = `advertising_enabled=${prefs.advertising}; path=/; max-age=${365 * 24 * 60 * 60}`;
    
    // If analytics is disabled, try to disable Google Analytics
    if (!prefs.analytics && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure'
      });
    }
  };

  const handlePreferenceChange = (type, value) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  const handlePolicyClick = (e) => {
    trackEvent('Nav Link Clicked', { label: 'CookiePolicy', destination: '#CookiePolicy' });
    // Allow default link behavior to proceed
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <Card className="bg-white border-2 border-[var(--uf-blue)] shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-[var(--uf-orange)] rounded-lg flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">We use cookies</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We use cookies to enhance your experience, analyze site usage, and personalize content. 
                  {' '}
                  <a 
                    href="#CookiePolicy" 
                    onClick={handlePolicyClick}
                    className="text-[var(--uf-blue)] hover:underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="w-6 h-6 p-0 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!showSettings ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white text-sm"
                  >
                    Accept All
                  </Button>
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    Reject All
                  </Button>
                </div>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Essential</p>
                      <p className="text-xs text-slate-500">Required for basic functionality</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Analytics</p>
                      <p className="text-xs text-slate-500">Help us improve the site</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Functional</p>
                      <p className="text-xs text-slate-500">Remember your preferences</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Advertising</p>
                      <p className="text-xs text-slate-500">Personalized content and ads</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.advertising}
                      onChange={(e) => handlePreferenceChange('advertising', e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePreferences}
                    className="flex-1 bg-[var(--uf-blue)] hover:bg-[var(--uf-blue-light)] text-white text-sm"
                  >
                    Save Preferences
                  </Button>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    className="text-sm"
                  >
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
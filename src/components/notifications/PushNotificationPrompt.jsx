import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function PushNotificationPrompt({ user, onComplete, onSkip }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        setError('Your browser does not support notifications');
        setLoading(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Register service worker and get subscription
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          
          // Get push subscription
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            // Create new subscription - using a placeholder VAPID key
            // In production, you'd generate real VAPID keys
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
              )
            });
          }

          // Save subscription to database
          const subscriptionData = subscription.toJSON();
          await base44.functions.invoke('savePushSubscription', {
            endpoint: subscriptionData.endpoint,
            keys: subscriptionData.keys,
            device_type: 'web'
          });

          // Update user's notification preferences
          await base44.auth.updateMe({
            push_notifications_enabled: true
          });

          onComplete?.();
        }
      } else if (permission === 'denied') {
        setError('Notifications were blocked. You can enable them in browser settings.');
      }
    } catch (err) {
      console.error('Push notification setup failed:', err);
      setError('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 border-2 border-blue-100 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-[#0021A5] to-[#FA4616] rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-7 h-7 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            🔔 Help students instantly
          </h3>
          <p className="text-slate-600 text-sm mb-4">
            Get notified when a student needs your expertise — respond in one tap and make a real impact. 
            <span className="font-medium text-slate-700">Max 2-3 alerts per week.</span>
          </p>

          {error && (
            <p className="text-red-600 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={requestPermission}
              disabled={loading}
              className="bg-gradient-to-r from-[#0021A5] to-[#FA4616] hover:from-[#001580] hover:to-[#d93d12] text-white font-semibold px-6 py-2.5 shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enabling...
                </span>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-slate-500 hover:text-slate-700"
            >
              Maybe later
            </Button>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
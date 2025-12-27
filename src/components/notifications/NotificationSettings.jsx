import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Pause, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function NotificationSettings({ user }) {
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(user?.notifications_paused || false);
  const [pauseDays, setPauseDays] = useState(7);
  const { toast } = useToast();

  const togglePause = async () => {
    setLoading(true);
    try {
      const newPaused = !isPaused;
      const response = await base44.functions.invoke('togglePushNotifications', {
        paused: newPaused,
        pause_days: newPaused ? pauseDays : null
      });

      if (response.data?.success) {
        setIsPaused(newPaused);
        toast({
          title: newPaused ? 'Notifications paused' : 'Notifications resumed',
          description: newPaused 
            ? `You won't receive push notifications for ${pauseDays} days`
            : 'You will now receive push notifications'
        });
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not supported',
        description: 'Your browser does not support push notifications',
        variant: 'destructive'
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Save subscription
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          let subscription = await registration.pushManager.getSubscription();
          
          if (!subscription) {
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
              )
            });
          }

          const subscriptionData = subscription.toJSON();
          await base44.functions.invoke('savePushSubscription', {
            endpoint: subscriptionData.endpoint,
            keys: subscriptionData.keys,
            device_type: 'web'
          });

          await base44.auth.updateMe({
            push_notifications_enabled: true
          });

          toast({
            title: 'Notifications enabled',
            description: 'You will now receive push notifications'
          });
        } catch (err) {
          console.error('Push setup failed:', err);
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push notifications toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Push Notifications</p>
            <p className="text-sm text-slate-500">
              Get instant alerts when students need your help
            </p>
          </div>
          {user?.push_notifications_enabled ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600">Enabled</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          ) : (
            <Button onClick={enableNotifications} size="sm">
              Enable
            </Button>
          )}
        </div>

        {/* Pause notifications */}
        {user?.push_notifications_enabled && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 flex items-center gap-2">
                  {isPaused ? <BellOff className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  Pause Notifications
                </p>
                <p className="text-sm text-slate-500">
                  {isPaused 
                    ? 'Notifications are paused'
                    : 'Take a break from notifications'
                  }
                </p>
              </div>
              <Switch
                checked={isPaused}
                onCheckedChange={togglePause}
                disabled={loading}
              />
            </div>

            {!isPaused && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm text-slate-600">Pause for:</span>
                {[7, 14, 30].map(days => (
                  <Button
                    key={days}
                    variant={pauseDays === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPauseDays(days)}
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rate limit info */}
        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
          <p>
            📱 We send a maximum of <strong>3 push notifications per week</strong> to 
            prevent notification fatigue. You'll only be notified about students who 
            match your expertise.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

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
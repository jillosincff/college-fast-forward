import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { X, Heart, MessageSquare } from 'lucide-react';

/**
 * Shows a thank-you banner when a student the parent helped replies/marks helpful.
 * Only shows unread "thank you" notifications from the last 7 days.
 */
export default function YouGotResponseBanner({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    loadNotifications();
  }, [user?.email]);

  const loadNotifications = async () => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Check for unread notifications of type "thank you" or "helpful" from students
      const [notifs, recentAnswers] = await Promise.all([
        base44.entities.Notification.filter(
          { recipient_email: user.email, is_read: false, type: 'new_message' },
          '-created_date', 5
        ).catch(() => []),
        // Also check for answers marked as helpful / best
        base44.entities.KarmaTransaction.filter(
          { parent_email: user.email, action_type: 'upvote_received' },
          '-created_date', 5
        ).catch(() => []),
      ]);

      const items = [];

      // Recent upvotes/helpful marks
      for (const t of (recentAnswers || []).filter(t => t.created_date >= sevenDaysAgo).slice(0, 3)) {
        items.push({
          id: t.id,
          type: 'helpful',
          text: 'A student found your answer helpful!',
          description: t.description || 'Your advice is making a difference.',
          points: t.points || 5,
          created_date: t.created_date,
        });
      }

      // Thank-you messages
      for (const n of (notifs || []).filter(n => n.created_date >= sevenDaysAgo).slice(0, 3)) {
        if (n.title?.toLowerCase().includes('thank') || n.message?.toLowerCase().includes('thank')) {
          items.push({
            id: n.id,
            type: 'thank_you',
            text: n.title || 'A student thanked you!',
            description: n.message?.slice(0, 100) || 'Your help made a real impact.',
            action_url: n.action_url,
            created_date: n.created_date,
          });
        }
      }

      setNotifications(items);
    } catch (err) {
      console.log('YouGotResponseBanner error:', err.message);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Mark notifications as read
    for (const n of notifications) {
      if (n.type === 'thank_you') {
        base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {});
      }
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % notifications.length);
  };

  if (dismissed || notifications.length === 0) return null;

  const current = notifications[currentIndex];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, #FFF8F5 0%, #FEF3E7 100%)',
      border: '2px solid rgba(250, 70, 22, 0.25)',
    }}>
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/80 transition z-10"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="px-5 py-4 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{
          background: current.type === 'helpful'
            ? 'linear-gradient(135deg, #FA4616, #FF6B3D)'
            : 'linear-gradient(135deg, #EC4899, #F472B6)',
        }}>
          {current.type === 'helpful' ? (
            <Heart className="w-6 h-6 text-white fill-white" />
          ) : (
            <MessageSquare className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-bold text-gray-900">
            {current.type === 'helpful' ? '❤️ You made a difference!' : '🎉 You got a response!'}
          </h3>
          <p className="text-sm text-gray-700 mt-0.5">{current.text}</p>
          <p className="text-xs text-gray-500 mt-1">{current.description}</p>

          <div className="flex items-center gap-3 mt-3">
            {current.points && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                backgroundColor: 'rgba(250, 70, 22, 0.1)', color: '#FA4616'
              }}>
                +{current.points} karma earned
              </span>
            )}
            {notifications.length > 1 && (
              <button onClick={handleNext} className="text-xs text-gray-400 hover:text-gray-600">
                {currentIndex + 1}/{notifications.length} — Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
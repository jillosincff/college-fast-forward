import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Link2, Zap, X, ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function LinkStudentCard({ user, familyKarma = 0, onLinked, onDismiss }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check dismiss count from localStorage
  const dismissKey = `link_student_dismiss_count_${user?.id}`;
  const dismissCount = parseInt(localStorage.getItem(dismissKey) || '0');

  if (dismissed || dismissCount >= 3) return null;

  const handleDismiss = () => {
    const newCount = dismissCount + 1;
    localStorage.setItem(dismissKey, String(newCount));
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const handleLink = async () => {
    if (!email.trim()) {
      toast({ title: 'Please enter an email', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('linkStudentToParent', { studentEmail: email.trim() });
      const data = res.data;

      if (data.already_linked) {
        toast({ title: 'Already linked!', description: 'This student is already connected to your account.' });
        if (onLinked) onLinked(data);
        return;
      }

      if (data.linked) {
        // Student exists and is now linked
        const studentName = data.student_name || email.split('@')[0];
        
        if (data.boost_impact) {
          toast({
            title: `🎉 ${studentName} is now linked!`,
            description: `Your ${data.total_karma} Karma just moved their question up ~${data.boost_impact.positions_gained} spots!`,
            duration: 4000
          });
        } else {
          toast({
            title: `🎉 ${studentName} is now linked!`,
            description: data.total_karma > 0 
              ? `Your ${data.total_karma} Family Karma is now boosting their visibility.`
              : 'Start helping students to earn Karma and boost their questions!',
            duration: 3500
          });
        }
      } else if (data.pending) {
        toast({
          title: '✅ Link saved!',
          description: `We'll automatically connect you when ${email.split('@')[0]} joins CFF.`,
          duration: 3500
        });
      }

      if (onLinked) onLinked(data);
    } catch (error) {
      console.error('Link failed:', error);
      toast({ title: 'Link failed', description: error?.response?.data?.error || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const hasKarma = familyKarma > 0;

  return (
    <section className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: hasKarma ? '#FA4616' : '#0021A5' }}>
      {/* Header gradient */}
      <div className="px-5 py-4" style={{ 
        background: hasKarma 
          ? 'linear-gradient(135deg, #FFF5F2 0%, #FEF3E7 100%)' 
          : 'linear-gradient(135deg, #EEF2FF 0%, #F0F4FF 100%)' 
      }}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ 
              background: hasKarma 
                ? 'linear-gradient(135deg, #FA4616, #FF6B3D)' 
                : 'linear-gradient(135deg, #0021A5, #003DCE)' 
            }}>
              {hasKarma ? '🔥' : '🔗'}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {hasKarma 
                  ? `You've earned ${familyKarma} Karma — activate it!`
                  : 'Link Your Student to Unlock Boosts'
                }
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {hasKarma 
                  ? "Your Karma isn't boosting anyone yet. Enter your student's email to connect."
                  : "Enter your student's email so your Karma boosts their question visibility."
                }
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="px-5 py-4 bg-white">
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@ufl.edu"
            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            className="flex-1"
          />
          <Button
            onClick={handleLink}
            disabled={loading || !email.trim()}
            style={{ backgroundColor: hasKarma ? '#FA4616' : '#0021A5' }}
            className="text-white font-semibold px-5 whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>Link <ArrowRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Your student will be notified. If they haven't signed up yet, we'll auto-connect when they join.
        </p>
      </div>
    </section>
  );
}
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Share2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { navigate } from '@/components/utils/navigation';
import confetti from 'canvas-confetti';

export default function ChallengeCompleteModal({ isOpen, onClose, daysToComplete }) {
  
  // Trigger confetti on open
  useEffect(() => {
    if (isOpen) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#0021A5', '#FA4616', '#FFD700', '#22c55e'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen]);

  const handleShare = async () => {
    const shareText = `🎯 I completed the 30-Day Intro Challenge on College Fast Forward! Got 3 warm intros in ${daysToComplete} days. Stop cold applying, start connecting! 🐊`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Challenge Complete!',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('Copied to clipboard! Share your win! 🎉');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
        >
          <Trophy className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-4xl mb-2">🎉🎉🎉</div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            YOU CRUSHED IT!
          </h2>
          
          <p className="text-lg text-slate-600 mb-4">
            3 intros in <span className="font-bold text-[#0021A5]">{daysToComplete}</span> days.<br />
            You're officially ahead of <span className="font-bold text-green-600">90% of job seekers</span>.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">Cold applications:</span>
              <span className="text-sm font-medium text-red-600">1 in 250 chance</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">You with 3 intros:</span>
              <span className="text-sm font-bold text-green-600">Basically unstoppable 🔥</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Keep going — the more intros, the better your odds.
          </p>

          <div className="space-y-3">
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-[#FA4616] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-base py-6"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Win 🎉
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  navigate('Connections');
                }}
                className="flex-1"
              >
                Find More Matches
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
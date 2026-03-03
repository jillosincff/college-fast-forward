import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import LinkStudentModal from './LinkStudentModal';

export default function LinkStudentCard({ user, familyKarma = 0, onLinked, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dismissKey = `link_student_dismiss_count_${user?.id}`;
  const dismissCount = parseInt(localStorage.getItem(dismissKey) || '0');

  if (dismissed || dismissCount >= 3) return null;

  const handleDismiss = () => {
    const newCount = dismissCount + 1;
    localStorage.setItem(dismissKey, String(newCount));
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const hasKarma = familyKarma > 0;

  return (
    <>
      <section className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: hasKarma ? '#FA4616' : '#0021A5' }}>
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
                    ? "Your Karma isn't boosting anyone yet. Search for your student to connect."
                    : "Search for your student so your Karma boosts their question visibility."
                  }
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 p-1 -mt-1 -mr-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 bg-white">
          <Button
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: hasKarma ? '#FA4616' : '#0021A5' }}
            className="w-full text-white font-semibold"
          >
            <Search className="w-4 h-4 mr-2" />
            Find & Link Your Student
          </Button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Search by name or email. If they haven't signed up yet, we'll auto-connect when they join.
          </p>
        </div>
      </section>

      <LinkStudentModal
        open={showModal}
        onOpenChange={setShowModal}
        onLinked={(data) => {
          if (onLinked) onLinked(data);
        }}
      />
    </>
  );
}
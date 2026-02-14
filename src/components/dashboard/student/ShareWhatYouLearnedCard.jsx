import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenLine, ArrowRight } from 'lucide-react';
import ShareStoryModal from './ShareStoryModal';

export default function ShareWhatYouLearnedCard({ user }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="bg-white border-2 border-amber-100 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <PenLine className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900">Share What You've Learned</h3>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
              +10 karma
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Had an interview? Finished an internship? Went to a career fair? Share what you learned — it helps everyone.
          </p>

          <Button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            Share a Story <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      <ShareStoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </>
  );
}
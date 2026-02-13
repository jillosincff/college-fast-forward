import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowRight, Lock } from 'lucide-react';
import ShareOfferDataModal from './ShareOfferDataModal';

export default function ShareOfferDataCard({ user }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card className="bg-white border-2 border-green-100 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900">Share Your Offer Data</h3>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
              +25 karma
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-2">
            Help other Gators negotiate better by sharing what companies are actually paying.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
            <Lock className="w-3 h-3" /> Your data is always anonymous.
          </p>

          <Button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
          >
            Add Salary Data <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardContent>
      </Card>

      <ShareOfferDataModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </>
  );
}
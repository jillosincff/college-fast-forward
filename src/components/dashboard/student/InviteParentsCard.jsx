import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InviteParentsCard({ linkedParents = [], onInviteParent }) {
  const hasLinked = linkedParents.length > 0;

  return (
    <Card className={`border-2 shadow-lg rounded-xl overflow-hidden ${
      hasLinked ? 'border-green-100 bg-green-50/50' : 'border-orange-100'
    }`}>
      <CardContent className="p-5">
        {hasLinked ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800">
                👨‍👩‍👧 Linked to {linkedParents.map(p => p.full_name || p.email).join(', ')}
              </h3>
              <p className="text-sm text-green-600">Their support boosts your visibility!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-slate-900">Invite Your Parents</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              When your parents join, they boost your questions and unlock the full family network.
            </p>
            <Button
              onClick={onInviteParent}
              className="w-full bg-[#FA4616] hover:bg-orange-600 text-white font-semibold"
            >
              Invite a Parent <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
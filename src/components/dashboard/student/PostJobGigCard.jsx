import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function PostJobGigCard() {
  return (
    <Card className="bg-white border-2 border-blue-100 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">Know About a Job or Gig?</h3>
          </div>
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
            +10 karma
          </span>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Share opportunities you've heard about — campus jobs, internships, startup gigs, anything.
        </p>

        <Button
          onClick={() => navigate('PostOpportunity')}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
        >
          Post a Job/Gig <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Briefcase, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';

export default function ExploreSection() {
  return (
    <Card className="bg-white border-2 border-slate-100 shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <Compass className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900">Explore</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('Opportunities')}
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-blue-300 hover:bg-blue-50"
          >
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-slate-700">Browse Opportunities</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('GatorDirectory')}
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-green-300 hover:bg-green-50"
          >
            <Users className="w-6 h-6 text-green-600" />
            <span className="font-semibold text-slate-700">UF Directory</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('Connections')}
            className="h-auto py-4 flex flex-col items-center gap-2 border-2 hover:border-purple-300 hover:bg-purple-50"
          >
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <span className="font-semibold text-slate-700">Community</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
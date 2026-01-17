import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';
import { ArrowRight, Briefcase } from 'lucide-react';

export default function CompactOpportunities({ opportunities, title = "Latest Opportunities" }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" />
          💼 {title}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('Opportunities')}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          Browse All
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* Compact list */}
      <div className="space-y-2">
        {opportunities.slice(0, 2).map((opp) => (
          <div
            key={opp.id}
            onClick={() => navigate(`Opportunities?id=${opp.id}`)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-800 truncate group-hover:text-purple-700">
                {opp.title}
              </p>
              <p className="text-xs text-slate-500">
                Posted {new Date(opp.created_date).toLocaleDateString()}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
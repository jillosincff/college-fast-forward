import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock } from 'lucide-react';

export default function OpportunitiesFeed({ opportunities = [], onView }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm h-full flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Recent Opportunities</h3>
        <span className="text-xs text-gray-500">From fellow alumni</span>
      </div>

      <div className="space-y-4 flex-grow">
        {opportunities.slice(0, 3).map((opp, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
            {/* Company logo placeholder */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-slate-600" />
            </div>

            {/* Opportunity details */}
            <div className="min-w-0 flex-grow">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-slate-900 line-clamp-1">{opp.title}</h4>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {opp.type}
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mt-1">{opp.company}</p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {opp.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {opp.timeAgo}
                </span>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => onView(i)} className="shrink-0 text-[#0021A5] hover:text-[#001a85]">
              View
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" className="mt-4 w-full rounded-xl border-slate-200 hover:bg-slate-50">
        Browse All Opportunities
      </Button>
    </section>
  );
}
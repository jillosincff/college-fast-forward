import React from 'react';
import { Button } from '@/components/ui/button';
import { navigate } from '@/components/utils/navigation';

const UF_BLUE = '#0021A5';

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'numeric', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function OpportunitiesSection({ 
  opportunities = [], 
  totalCount,
  title = '💼 Latest Opportunities',
  compact = false 
}) {
  const count = totalCount || opportunities.length;
  
  if (opportunities.length === 0) return null;

  if (compact) {
    return (
      <section className="bg-white rounded-2xl p-4 md:p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {title}
          </h3>
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => navigate('Opportunities')}
            className="text-sm font-medium"
            style={{ color: UF_BLUE }}
          >
            Browse All →
          </Button>
        </div>
        <div className="space-y-2">
          {opportunities.slice(0, 3).map((opp) => (
            <div 
              key={opp.id}
              onClick={() => navigate(`Opportunities?id=${opp.id}`)}
              className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
            >
              <span className="text-gray-700 truncate flex-1">{opp.title}</span>
              <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                Posted {formatDate(opp.created_date || opp.postedAt)}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl p-4 md:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          {title}
        </h3>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => navigate('Opportunities')}
          className="text-sm font-medium"
          style={{ color: UF_BLUE }}
        >
          Browse All →
        </Button>
      </div>
      
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opp) => (
          <div 
            key={opp.id}
            onClick={() => navigate(`Opportunities?id=${opp.id}`)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{opp.title}</p>
              <p className="text-sm text-gray-500 truncate">
                {opp.org_name || opp.company} · Posted {formatDate(opp.created_date || opp.postedAt)}
              </p>
            </div>
            <Button 
              variant="ghost"
              size="sm"
              className="text-sm font-medium px-3 py-1 rounded-lg flex-shrink-0 ml-2"
              style={{ 
                backgroundColor: `${UF_BLUE}10`,
                color: UF_BLUE
              }}
            >
              View →
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
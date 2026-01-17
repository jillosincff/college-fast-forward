import React from 'react';
import { Clock, Mail } from 'lucide-react';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours === 1) return '1h ago';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
}

export default function WaitingForResponses({ messagedMatches }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">
            ⏳ Waiting for Responses
          </h2>
        </div>
        
        <p className="text-slate-600 mb-6">
          You've messaged {messagedMatches.length} {messagedMatches.length === 1 ? 'person' : 'people'}. Most respond within 24 hours.
        </p>
        
        {/* Messaged people list */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
          {messagedMatches.slice(0, 5).map((match) => {
            const displayName = match.helper_name || match.parent_name || 'Helper';
            return (
              <div key={match.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0021A5] to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {displayName.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-slate-800">{displayName}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-500">
                    Messaged {formatTimeAgo(match.student_connected_at || match.updated_date)}
                  </span>
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                    Pending
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Email notification promise */}
        <div className="mt-6 flex items-center gap-3 text-slate-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm">
            <strong className="text-blue-800">📬 We'll email you when someone responds!</strong>
            <span className="text-blue-700 ml-1">No need to keep checking.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
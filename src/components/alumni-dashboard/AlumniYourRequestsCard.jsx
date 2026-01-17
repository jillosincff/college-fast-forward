import React from 'react';
import { navigate } from '@/components/utils/navigation';

function formatTimeAgo(dateString) {
  const hours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AlumniYourRequestsCard({ requests }) {
  return (
    <section 
      className="rounded-3xl p-6 border"
      style={{ 
        background: 'linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%)',
        borderColor: 'rgba(250, 70, 22, 0.3)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(250, 70, 22, 0.2)' }}
          >
            <span className="text-lg">📬</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Your Active Request{requests.length > 1 ? 's' : ''}</h3>
            <p className="text-sm text-gray-500">Visible to alumni only</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('MyRequests')}
          className="text-sm font-medium px-3 py-1 rounded-lg transition"
          style={{ 
            color: '#FA4616',
            backgroundColor: 'rgba(250, 70, 22, 0.1)'
          }}
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {requests.map((request) => (
          <div 
            key={request.id}
            className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition cursor-pointer"
            onClick={() => navigate('QuestionDetail', { id: request.id })}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-900 line-clamp-1">
                  {request.title || request.role}
                </p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>💬</span> {request.answer_count || 0} response{(request.answer_count || 0) !== 1 ? 's' : ''}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(request.created_date)}</span>
                </div>
              </div>
              <div 
                className="text-center px-3 py-1 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(250, 70, 22, 0.15)',
                  color: '#FA4616'
                }}
              >
                <span className="text-lg font-bold">#{request.priority_score || 1}</span>
                <p className="text-xs">in queue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
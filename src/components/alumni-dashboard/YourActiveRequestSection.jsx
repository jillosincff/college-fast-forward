import React from 'react';
import { navigate } from '@/components/utils/navigation';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

const CATEGORY_LABELS = {
  career_guidance: 'Career guidance',
  jobs_referrals: 'Jobs & referrals',
  resume_interviews: 'Resume & interviews',
  industry_insights: 'Industry insights',
  introductions: 'Introductions',
  new_job_search: 'Job search',
  career_transition: 'Career transition',
  industry_shift: 'Industry shift',
  business_advice: 'Business advice',
};

export default function YourActiveRequestSection({ request, onPostRequest }) {
  // No active request — prompt user to post one
  if (!request) {
    return (
      <section 
        className="rounded-3xl p-6 border"
        style={{ 
          background: `linear-gradient(135deg, ${UF_ORANGE}08 0%, #FFFFFF 100%)`,
          borderColor: `${UF_ORANGE}25`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${UF_ORANGE}15` }}
          >
            <span className="text-lg">📬</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Your Request</h3>
            <p className="text-sm text-gray-500">Let the network know what you need</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="text-4xl mb-3">🙋</div>
          <h4 className="font-bold text-gray-900 text-lg mb-2">Tell the Network What You Need</h4>
          <p className="text-gray-600 mb-5 max-w-md mx-auto text-sm">
            Post a request so alumni and parents in the UF network can reach out with advice, intros, and opportunities.
          </p>
          <button
            onClick={onPostRequest}
            className="text-white font-bold px-8 py-3 rounded-xl text-base shadow-lg transition hover:scale-105"
            style={{ backgroundColor: UF_ORANGE, boxShadow: `0 8px 20px ${UF_ORANGE}30` }}
          >
            Post a Help Request →
          </button>
        </div>
      </section>
    );
  }

  const req = request;
  const responseCount = req.answer_count || 0;
  const queuePosition = req.priority_score || 10;
  
  const formatTimeAgo = (date) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  return (
    <section 
      className="rounded-3xl p-6 border"
      style={{ 
        background: `linear-gradient(135deg, ${UF_ORANGE}08 0%, #FFFFFF 100%)`,
        borderColor: `${UF_ORANGE}25`
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${UF_ORANGE}15` }}
        >
          <span className="text-lg">📬</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Your Active Request</h3>
          <p className="text-sm text-gray-500">Visible to UF alumni only</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h4 className="font-semibold text-gray-900 text-lg mb-2">
          {req.title || req.role}
        </h4>
        
        {/* Show the actual description the user wrote */}
        {req.description && (
          <p className="text-gray-700 text-sm mb-3 leading-relaxed line-clamp-3">
            {req.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 flex-wrap">
          <span 
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${UF_BLUE}10`, color: UF_BLUE }}
          >
            {CATEGORY_LABELS[req.alumni_help_type] || CATEGORY_LABELS[req.help_types?.[0]] || 'Career help'}
          </span>
          <span>•</span>
          <span>Posted {formatTimeAgo(req.created_date)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Queue Position */}
          <div 
            className="text-center px-4 py-2 rounded-xl"
            style={{ backgroundColor: `${UF_ORANGE}10` }}
          >
            <span className="text-2xl font-bold" style={{ color: UF_ORANGE }}>
              #{queuePosition}
            </span>
            <p className="text-xs text-gray-600">in queue</p>
          </div>

          {/* Responses */}
          <div className="flex-1 ml-4">
            {responseCount > 0 ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    💬 {responseCount} response{responseCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    Check your messages for replies
                  </p>
                </div>
                <button
                  onClick={() => navigate(`QuestionDetail?id=${req.id}`)}
                  className="text-white font-semibold px-4 py-2 rounded-xl text-sm transition hover:scale-105"
                  style={{ backgroundColor: UF_BLUE }}
                >
                  View →
                </button>
              </div>
            ) : (
              <p className="text-gray-500">
                No responses yet. Keep helping to boost your visibility!
              </p>
            )}
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <span>🔒</span>
          <span>Only UF alumni can see this request</span>
        </div>
      </div>
    </section>
  );
}
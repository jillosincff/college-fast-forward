import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

const CATEGORY_LABELS = {
  career_guidance: 'Career guidance',
  jobs_referrals: 'Jobs & referrals',
  resume_interviews: 'Resume & interviews',
  industry_insights: 'Industry insights',
  introductions: 'Introductions',
};

export default function AlumniCanHelpYouSection({ matches, total, matchedCategories, onPostRequest }) {
  const categoryLabels = matchedCategories
    .map(cat => CATEGORY_LABELS[cat] || cat)
    .join(', ');

  return (
    <section 
      className="rounded-3xl shadow-lg overflow-hidden border"
      style={{ 
        background: `linear-gradient(135deg, ${UF_ORANGE}08 0%, #FFFFFF 100%)`,
        borderColor: `${UF_ORANGE}20`
      }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: `${UF_ORANGE}15` }}>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>✨</span> {total} Alumni Can Help You
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          You mentioned you need help with: <strong style={{ color: UF_ORANGE }}>{categoryLabels}</strong>
        </p>
      </div>

      {/* Match Cards */}
      <div className="p-4 space-y-3">
        {matches.slice(0, 3).map((match) => (
          <AlumniMatchCard key={match.id || match.email} match={match} />
        ))}
        
        {matches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>We're finding alumni who can help with your needs...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t space-y-3">
        {total > 3 && (
          <div className="text-center">
            <button 
              onClick={() => navigate('GatorDirectory')}
              className="font-semibold px-6 py-2 rounded-xl transition hover:scale-105"
              style={{ 
                color: UF_BLUE,
                backgroundColor: `${UF_BLUE}10`
              }}
            >
              See All {total} Alumni →
            </button>
          </div>
        )}
        
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{ backgroundColor: `${UF_BLUE}08` }}
        >
          <div className="flex items-center gap-3">
            <span>💡</span>
            <span className="text-sm text-gray-700">
              Or post a request and let alumni come to you
            </span>
          </div>
          <button
            onClick={onPostRequest}
            className="text-white font-semibold px-4 py-2 rounded-xl text-sm transition hover:scale-105"
            style={{ backgroundColor: UF_BLUE }}
          >
            Post a Request →
          </button>
        </div>
      </div>
    </section>
  );
}

function AlumniMatchCard({ match }) {
  const initials = match.displayName
    ? match.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AL';

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition">
      <div className="flex items-center gap-4">
        
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-lg">
              {match.displayName}
            </span>
            {match.isFastResponder && (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                ⚡ Fast responder
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mt-0.5">
            {match.jobTitle || match.current_position}
            {(match.company || match.current_company) && ` at ${match.company || match.current_company}`}
            {match.graduationYear && ` • Class of '${String(match.graduationYear).slice(-2)}`}
          </p>

          {/* Can Help With */}
          {match.matchedCategories && match.matchedCategories.length > 0 && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500">Can help with:</span>
              {match.matchedCategories.slice(0, 2).map((cat) => (
                <span 
                  key={cat}
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${UF_BLUE}10`,
                    color: UF_BLUE
                  }}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate(`MessageComposer?to=${encodeURIComponent(match.email)}&name=${encodeURIComponent(match.displayName || match.full_name)}`)}
          className="flex-shrink-0 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition hover:scale-105 text-sm"
          style={{ 
            background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)`,
            boxShadow: `0 4px 12px ${UF_BLUE}30`
          }}
        >
          Connect →
        </button>
        
      </div>
    </div>
  );
}
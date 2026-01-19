import React, { useEffect, useState } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import confetti from 'canvas-confetti';
import { trackEvent } from '@/components/utils/analytics';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

export default function CelebrationScreen({ user, onContinue }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const firstName = user?.full_name?.split(/[\s,]+/)[0] || 'Gator';

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 },
      colors: [UF_BLUE, UF_ORANGE, '#FF6B35', '#FFD700']
    });

    // Load matches
    loadMatches();
    
    trackEvent('celebration_screen_viewed', { user_id: user?.id });
  }, []);

  const loadMatches = async () => {
    try {
      const studentMatches = await base44.entities.Match.filter(
        { student_email: user?.email },
        '-match_score',
        50
      );
      setMatches(studentMatches || []);
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSeeMatches = () => {
    trackEvent('celebration_cta_clicked', { user_id: user?.id, match_count: matches.length });
    // Store matches in sessionStorage for the review screen
    sessionStorage.setItem('onboarding_matches', JSON.stringify(matches));
    navigate('MatchesReview');
  };

  // Get top 4 matches for avatar display
  const topMatches = matches.slice(0, 4);
  const remainingCount = Math.max(0, matches.length - 4);

  // Get notable companies
  const companies = [...new Set(
    matches
      .map(m => m.helper_company || m.parent_company || m.company)
      .filter(Boolean)
      .filter(c => !c.toLowerCase().includes('self-employed') && !c.toLowerCase().includes('retired'))
  )].slice(0, 3);

  const getInitials = (name) => {
    if (!name) return 'UF';
    return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getShortTitle = (match) => {
    const title = match.helper_title || match.parent_title || match.title || '';
    if (!title) return '';
    return title.replace('Director', 'Dir').replace('Manager', 'Mgr').replace('Vice President', 'VP').split(' ').slice(0, 2).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        
        {/* Celebration header */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          You're all set, {firstName}!
        </h1>
        
        {loading ? (
          <p className="text-lg text-gray-600 mb-6">
            Finding people who can help you...
          </p>
        ) : (
          <p className="text-lg text-gray-600 mb-6">
            Your question is live and <span className="font-bold text-[#0021A5]">{matches.length} {matches.length === 1 ? 'person' : 'people'}</span> can help you.
          </p>
        )}

        {/* Avatar row */}
        {!loading && matches.length > 0 && (
          <div className="flex justify-center gap-3 mb-3">
            {topMatches.map((match, i) => (
              <div key={i} className="text-center">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
                >
                  {getInitials(match.helper_name || match.parent_name)}
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-[60px] truncate">
                  {getShortTitle(match)}
                </p>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold shadow-lg">
                  +{remainingCount}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Company mentions */}
        {companies.length > 0 && (
          <p className="text-gray-500 mb-8 text-sm">
            Including Directors, VPs, and hiring managers at{' '}
            <span className="font-medium text-gray-700">{companies.join(', ')}</span>.
          </p>
        )}

        {/* Single CTA Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-xl text-left">
          <p className="text-gray-600 mb-4">
            These people match your interests and can help with what you need. 
            Start connecting now — most respond within 48 hours.
          </p>
          
          <button
            onClick={handleSeeMatches}
            disabled={loading}
            className="w-full py-4 text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50"
            style={{ 
              background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)`,
              boxShadow: `0 4px 12px ${UF_BLUE}40`
            }}
          >
            {loading ? 'Loading...' : `See Your Matches →`}
          </button>
        </div>

        {/* Pro tip */}
        <p className="text-sm text-gray-500">
          💡 <span className="font-medium">Pro tip:</span> Students who message 3+ people get responses 80% faster.
        </p>
      </div>
    </div>
  );
}
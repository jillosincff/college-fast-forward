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
  
  // Handle "Last, First" format (e.g., "Osinoff, Lindsey" -> "Lindsey")
  const fullName = user?.full_name || '';
  const firstName = fullName.includes(',') 
    ? fullName.split(',')[1]?.trim().split(/\s+/)[0] || 'Gator'
    : fullName.split(/\s+/)[0] || 'Gator';

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
    trackEvent('celebration_cta_clicked', { user_id: user?.id, match_count: validMatches.length, top3_shown: validMatches.slice(0, 3).map(m => m.id) });
    // Store valid matches in sessionStorage for the review screen
    sessionStorage.setItem('onboarding_matches', JSON.stringify(validMatches));
    navigate('MatchesReview');
  };

  const handleSkipToDashboard = () => {
    trackEvent('celebration_skip_to_dashboard', { user_id: user?.id, match_count: validMatches.length });
    sessionStorage.removeItem('onboarding_matches');
    navigate('Dashboard');
  };

  // Filter out invalid matches (no real name)
  const validMatches = matches.filter(m => {
    const name = m.helper_name || m.parent_name || '';
    return name && 
      !name.toLowerCase().includes('professional') && 
      !name.toLowerCase().includes('test') &&
      name.trim().length > 2;
  });

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
          <p className="text-lg text-gray-600 mb-2">
            Finding people who can help you...
          </p>
        ) : (
          <>
            <p className="text-lg text-gray-600 mb-2">
              Your question is live and <span className="font-bold text-[#0021A5]">{validMatches.length} {validMatches.length === 1 ? 'person' : 'people'}</span> can help you.
            </p>
            {validMatches.length >= 3 && (
              <p className="text-gray-500 mb-6">
                We picked your top 3 to start with:
              </p>
            )}
          </>
        )}

        {/* Top 3 Preview Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6 shadow-xl">
          {/* Top 3 avatars with names, titles, companies */}
          {!loading && validMatches.length > 0 && (
            <div className="flex justify-center gap-6 mb-6">
              {validMatches.slice(0, 3).map((match, i) => {
                const name = match.helper_name || match.parent_name || '';
                const photoUrl = match.profile_image_url || match.helper_photo_url || '';
                const title = match.helper_title || match.parent_title || match.job_title || '';
                const company = match.helper_company || match.parent_company || match.company || '';
                const shortTitle = title.replace('Director', 'Dir').replace('Manager', 'Mgr').replace('Vice President', 'VP').split(' ').slice(0, 2).join(' ');
                return (
                  <div key={i} className="text-center max-w-[100px]">
                    {photoUrl ? (
                      <img 
                        src={photoUrl} 
                        alt={name}
                        className="w-16 h-16 rounded-full object-cover shadow-lg mx-auto"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto"
                        style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
                      >
                        {getInitials(name)}
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900 mt-2 truncate">{name.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{shortTitle}</p>
                    <p className="text-xs text-gray-400 truncate">{company}</p>
                  </div>
                );
              })}
            </div>
          )}
          
          <p className="text-gray-600 mb-4 text-center">
            These people are the best fit for what you need.
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
            {loading ? 'Loading...' : `See Your Top 3 →`}
          </button>
        </div>

        {/* Skip to dashboard link */}
        <button
          onClick={handleSkipToDashboard}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          or skip to your dashboard
        </button>
      </div>
    </div>
  );
}
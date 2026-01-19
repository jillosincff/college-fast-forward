import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/components/utils/analytics';
import { ArrowLeft } from 'lucide-react';

const UF_BLUE = '#0021A5';
const UF_ORANGE = '#FA4616';

export default function MatchesReview() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    trackEvent('match_review_started', {});
  }, []);

  // Filter out invalid matches (no real name, test users, etc.)
  const filterValidMatches = (rawMatches) => {
    return rawMatches.filter(match => {
      const name = match.helper_name || match.parent_name || '';
      const hasRealName = name && 
        !name.toLowerCase().includes('professional') && 
        !name.toLowerCase().includes('test') &&
        name.trim().length > 2;
      const hasJobInfo = match.helper_title || match.parent_title || match.job_title || 
                         match.helper_company || match.parent_company || match.company;
      return hasRealName && hasJobInfo;
    });
  };

  const loadMatches = async () => {
    try {
      // Try to get from sessionStorage first (from celebration screen)
      const cached = sessionStorage.getItem('onboarding_matches');
      if (cached) {
        const parsed = JSON.parse(cached);
        setMatches(filterValidMatches(parsed));
        setLoading(false);
        return;
      }
      
      // Otherwise fetch fresh
      const studentMatches = await base44.entities.Match.filter(
        { student_email: user?.email },
        '-match_score',
        50
      );
      setMatches(filterValidMatches(studentMatches || []));
    } catch (e) {
      console.error('Failed to load matches:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentMatch = matches[currentIndex];
  const reviewed = messagesSent + skipped;
  const isComplete = currentIndex >= matches.length;

  // Pre-fill message when match changes
  useEffect(() => {
    if (currentMatch && user) {
      const firstName = getFirstName(currentMatch.helper_name || currentMatch.parent_name);
      const studentMajor = user.major || '';
      const studentYear = user.graduation_year || '';
      
      let draft = `Hi ${firstName}!`;
      if (studentMajor) {
        draft += ` I'm a ${studentYear ? studentYear + ' ' : ''}${studentMajor} major.`;
      }
      draft += ` I'd love to connect and hear your advice.`;
      setMessage(draft);
    }
  }, [currentMatch, user]);

  // Check for transition point (after 3 reviews for top-3 flow)
  useEffect(() => {
    if (reviewed === 3 && !showTransition && matches.length > 3) {
      setShowTransition(true);
    }
  }, [reviewed, matches.length]);

  const getFirstName = (name) => {
    if (!name) return 'there';
    return name.split(/[\s,]+/)[0];
  };

  const getInitials = (name) => {
    if (!name) return 'UF';
    return name.split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSend = async () => {
    if (!message.trim() || !currentMatch) return;
    
    setSending(true);
    try {
      // Create a conversation and send message
      const conversation = await base44.entities.Conversation.create({
        participant_emails: [user.email, currentMatch.helper_email || currentMatch.parent_email],
        participant_names: {
          [user.email]: user.full_name,
          [currentMatch.helper_email || currentMatch.parent_email]: currentMatch.helper_name || currentMatch.parent_name
        },
        subject: 'Connection from CFF',
        last_message_preview: message.substring(0, 100),
        last_message_at: new Date().toISOString(),
        last_message_sender: user.email
      });

      await base44.entities.Message.create({
        conversation_id: conversation.id,
        sender_email: user.email,
        sender_name: user.full_name,
        recipient_email: currentMatch.helper_email || currentMatch.parent_email,
        subject: 'Connection from CFF',
        body: message,
        is_read: false
      });

      // Update match status
      await base44.entities.Match.update(currentMatch.id, { status: 'student_connected' });

      trackEvent('match_review_message_sent', { match_index: currentIndex, match_id: currentMatch.id });
      
      setMessagesSent(prev => prev + 1);
      setMessage('');
      setCurrentIndex(prev => prev + 1);
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  const handleSkip = () => {
    trackEvent('match_review_skipped', { match_index: currentIndex, match_id: currentMatch?.id });
    setSkipped(prev => prev + 1);
    setMessage('');
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkipToDashboard = () => {
    trackEvent('match_review_skip_to_dashboard', { matches_reviewed: reviewed, messages_sent: messagesSent });
    sessionStorage.removeItem('onboarding_matches');
    navigate('Dashboard');
  };

  const handleContinueReviewing = () => {
    setShowTransition(false);
  };

  const handleBrowseDirectory = () => {
    trackEvent('match_review_browse_directory', { messages_sent: messagesSent, matches_reviewed: reviewed });
    sessionStorage.removeItem('onboarding_matches');
    navigate('GatorDirectory');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h1>
          <p className="text-gray-500 mb-6">
            We're still finding people who can help. Check back soon or browse the directory.
          </p>
          <button
            onClick={handleBrowseDirectory}
            className="w-full py-3 text-white font-semibold rounded-xl mb-3"
            style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
          >
            Browse Directory →
          </button>
          <button onClick={handleSkipToDashboard} className="text-gray-500 hover:text-gray-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Transition screen after 3 reviews (top-3 completion)
  if (showTransition) {
    const remainingMatches = matches.length - currentIndex;
    trackEvent('match_review_transition_shown', { messages_sent: messagesSent, skipped });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nice work!</h1>
          <p className="text-gray-500 mb-8">
            You messaged {messagesSent} of your top matches.
            {messagesSent > 0 && ' Most people respond within 48 hours.'}
          </p>
          
          {/* See more matches */}
          {remainingMatches > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔍</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">See more matches</p>
                  <p className="text-sm text-gray-500">{remainingMatches} other parents & alumni who can help</p>
                </div>
              </div>
              <button
                onClick={handleContinueReviewing}
                className="w-full mt-3 py-2.5 text-white font-semibold rounded-lg"
                style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
              >
                Browse More Matches →
              </button>
            </div>
          )}
          
          {/* Browse directory */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📂</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Browse the full directory</p>
                <p className="text-sm text-gray-500">500+ parents & alumni from all industries</p>
              </div>
            </div>
            <button
              onClick={handleBrowseDirectory}
              className="w-full mt-3 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Browse Directory →
            </button>
          </div>
          
          {/* Dashboard - Primary */}
          <button
            onClick={handleSkipToDashboard}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    trackEvent('match_review_completed', { messages_sent: messagesSent, total_matches: matches.length });
    const remainingMatches = matches.length - 3;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {messagesSent > 0 ? 'Nice work!' : 'All done!'}
          </h1>
          <p className="text-gray-500 mb-6">
            {messagesSent > 0 
              ? `You messaged ${messagesSent} ${messagesSent === 1 ? 'person' : 'people'}. Most respond within 48 hours.`
              : `You can message your matches anytime from your dashboard.`
            }
          </p>
          
          {/* PRIMARY ACTION: Go to Dashboard */}
          <button
            onClick={handleSkipToDashboard}
            className="w-full py-3 text-white font-semibold rounded-xl mb-6"
            style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
          >
            Go to Your Dashboard →
          </button>
          
          {/* SECONDARY OPTIONS */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-500 mb-4">Want to connect with more people?</p>
            
            <div className="flex gap-3">
              {remainingMatches > 0 && (
                <button
                  onClick={() => navigate('MyMatches')}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  See {remainingMatches} More
                </button>
              )}
              <button
                onClick={handleBrowseDirectory}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main match review UI
  const displayName = currentMatch.helper_name || currentMatch.parent_name || 'Professional';
  const firstName = getFirstName(displayName);
  const title = currentMatch.helper_title || currentMatch.parent_title || currentMatch.job_title || '';
  const company = currentMatch.helper_company || currentMatch.parent_company || currentMatch.company || '';
  const matchReasons = currentMatch.match_reasons || currentMatch.matchReasons || [];
  const studentsHelped = currentMatch.students_helped_count || 0;
  const bio = currentMatch.bio || currentMatch.helper_bio || '';
  const linkedinUrl = currentMatch.linkedin_url || currentMatch.helper_linkedin_url || '';
  const yearsExp = currentMatch.years_experience || currentMatch.helper_years_experience || '';
  const photoUrl = currentMatch.profile_image_url || currentMatch.helper_photo_url || '';

  // Top 3 flow - show only first 3 matches
  const isTop3Flow = matches.length > 3;
  const showingTop3 = isTop3Flow && currentIndex < 3;
  const displayTotal = isTop3Flow ? 3 : matches.length;
  const displayIndex = isTop3Flow ? Math.min(currentIndex + 1, 3) : currentIndex + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={handleSkipToDashboard}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
          <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
            {displayIndex} of {displayTotal}
          </span>
        </div>
      </div>
      
      <div className="py-6 px-4">
        <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isTop3Flow ? 'Your Top 3 Matches' : 'Your Top Matches'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isTop3Flow ? 'We picked the people most likely to help you' : 'Message them directly to start a conversation'}
          </p>
        </div>

        {/* Match Card - Rich Profile */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 mb-6">
          {/* Header: Photo + Info + LinkedIn */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Profile Photo or Initials */}
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={displayName}
                  className="w-16 h-16 rounded-full object-cover shadow-lg flex-shrink-0"
                />
              ) : (
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
                >
                  {getInitials(displayName)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
                {(title || company) && (
                  <p className="text-gray-600 truncate">
                    {title}{title && company && ' at '}{company}
                  </p>
                )}
                {yearsExp && (
                  <p className="text-sm text-gray-500">{yearsExp} experience</p>
                )}
              </div>
            </div>
            
            {/* LinkedIn button */}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 flex-shrink-0"
                onClick={() => trackEvent('match_linkedin_clicked', { match_id: currentMatch.id })}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-gray-600 italic mb-4 bg-slate-50 rounded-lg p-3">
              💬 "{bio}"
            </p>
          )}

          <hr className="my-4 border-gray-100" />

          {/* Why you matched */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">✨ Why you matched:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {matchReasons.length > 0 ? (
                matchReasons.slice(0, 4).map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))
              ) : (
                <>
                  {title && <li>• Works as {title} — relevant to your interests</li>}
                  {company && <li>• Can share insights about {company}</li>}
                </>
              )}
              {studentsHelped > 0 && (
                <li>• Has helped {studentsHelped}+ students</li>
              )}
            </ul>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Message input */}
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write a message to ${firstName}...`}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 text-base"
            />
            <p className="text-xs text-gray-400 mt-1">
              💡 Tip: Mention what you need help with specifically
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="flex-1 py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
            >
              {sending ? 'Sending...' : 'Send Message →'}
            </button>
            <button
              onClick={handleSkip}
              disabled={sending}
              className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Progress - Show only 3 segments for top-3 flow */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < currentIndex 
                    ? 'bg-blue-500' 
                    : i === currentIndex 
                      ? 'bg-blue-300' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            {Math.min(currentIndex, 3)} of 3 reviewed
            {messagesSent > 0 && <span className="text-green-600 font-medium"> · {messagesSent} messaged</span>}
          </p>
        </div>

        {/* Remaining matches hint */}
        {matches.length > 3 && (
          <p className="text-sm text-gray-500 text-center mb-4">
            💡 {matches.length - 3} more matches waiting on your dashboard
          </p>
        )}
        </div>
      </div>
    </div>
  );
}
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

  const loadMatches = async () => {
    try {
      // Try to get from sessionStorage first (from celebration screen)
      const cached = sessionStorage.getItem('onboarding_matches');
      if (cached) {
        setMatches(JSON.parse(cached));
        setLoading(false);
        return;
      }
      
      // Otherwise fetch fresh
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

  // Check for transition point (after 5 reviews)
  useEffect(() => {
    if (reviewed === 5 && !showTransition && matches.length > 5) {
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

  // Transition screen after 5 reviews
  if (showTransition) {
    const remainingMatches = matches.length - currentIndex;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Great start!</h1>
          <p className="text-gray-500 mb-8">
            You've messaged {messagesSent} {messagesSent === 1 ? 'person' : 'people'}
            {skipped > 0 && ` and skipped ${skipped}`}.
          </p>
          
          {/* Continue reviewing */}
          {remainingMatches > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📬</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">See {remainingMatches} more matches</p>
                  <p className="text-sm text-gray-500">Continue reviewing people matched to your question</p>
                </div>
              </div>
              <button
                onClick={handleContinueReviewing}
                className="w-full mt-3 py-2.5 text-white font-semibold rounded-lg"
                style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
              >
                Continue Reviewing
              </button>
            </div>
          )}
          
          {/* Browse directory */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Browse the full directory</p>
                <p className="text-sm text-gray-500">Find even more people — 500+ parents & alumni</p>
              </div>
            </div>
            <button
              onClick={handleBrowseDirectory}
              className="w-full mt-3 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Browse Directory →
            </button>
          </div>
          
          {/* Dashboard */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Go to your dashboard</p>
                <p className="text-sm text-gray-500">See your question, messages, and matches anytime</p>
              </div>
            </div>
            <button
              onClick={handleSkipToDashboard}
              className="w-full mt-3 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion screen
  if (isComplete) {
    trackEvent('match_review_completed', { messages_sent: messagesSent, total_matches: matches.length });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You've reviewed all your matches!
          </h1>
          <p className="text-gray-500 mb-8">
            {messagesSent > 0 
              ? `You messaged ${messagesSent} ${messagesSent === 1 ? 'person' : 'people'}. Most respond within 48 hours.`
              : `No messages sent yet — you can always message them from your dashboard.`
            }
          </p>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <span className="text-3xl mb-3 block">🔍</span>
            <h2 className="font-semibold text-gray-900 mb-1">Want to find more people?</h2>
            <p className="text-sm text-gray-500 mb-4">Browse the full directory — 500+ parents and alumni</p>
            <button
              onClick={handleBrowseDirectory}
              className="w-full py-3 text-white font-semibold rounded-xl"
              style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
            >
              Browse Directory →
            </button>
          </div>
          
          <button onClick={handleSkipToDashboard} className="text-gray-500 hover:text-gray-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main match review UI
  const displayName = currentMatch.helper_name || currentMatch.parent_name || 'UF Professional';
  const firstName = getFirstName(displayName);
  const title = currentMatch.helper_title || currentMatch.parent_title || '';
  const company = currentMatch.helper_company || currentMatch.parent_company || '';
  const matchReasons = currentMatch.match_reasons || currentMatch.matchReasons || [];
  const studentsHelped = currentMatch.students_helped_count || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Your Top Matches</h1>
            <p className="text-gray-500 text-sm">Message them directly to start a conversation</p>
          </div>
          <span className="text-sm text-gray-400 bg-white px-3 py-1 rounded-full border">
            {currentIndex + 1} of {matches.length}
          </span>
        </div>

        {/* Match Card */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 mb-6">
          {/* Profile */}
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${UF_BLUE} 0%, #003DCE 100%)` }}
            >
              {getInitials(displayName)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">{displayName}</h2>
              {(title || company) && (
                <p className="text-gray-500 truncate">
                  {title}{title && company && ' at '}{company}
                </p>
              )}
            </div>
          </div>

          {/* Why you matched */}
          {matchReasons.length > 0 && (
            <p className="text-sm text-gray-500 mb-2">
              ✨ <span className="font-medium">Why you matched:</span> {matchReasons.slice(0, 3).join(' · ')}
            </p>
          )}

          {/* Social proof */}
          {studentsHelped > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              📊 {firstName} has helped {studentsHelped} student{studentsHelped > 1 ? 's' : ''} this month
            </p>
          )}

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

        {/* Progress */}
        <div className="mb-4">
          <div className="flex gap-1 mb-2">
            {matches.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < currentIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            {reviewed} of {matches.length} reviewed
            {messagesSent > 0 && <span className="text-green-600 font-medium"> · {messagesSent} messaged</span>}
          </p>
        </div>

        {/* Pro tip */}
        <p className="text-sm text-gray-500 text-center mb-4">
          💡 Students who message 3+ people get responses 80% faster
        </p>

        {/* Skip to dashboard */}
        <button
          onClick={handleSkipToDashboard}
          className="w-full py-2 text-gray-400 hover:text-gray-600 text-sm"
        >
          Skip to Dashboard
        </button>
      </div>
    </div>
  );
}
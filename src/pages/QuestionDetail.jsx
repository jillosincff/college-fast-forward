import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate, useParams } from '@/components/utils/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Eye, ChevronUp, Award, Share2 } from 'lucide-react';
import { HelpRequest } from '@/entities/HelpRequest';
import { JobRequest } from '@/entities/JobRequest';
import { Answer } from '@/entities/Answer';
import { JobAnswer } from '@/entities/JobAnswer';
import { base44 } from '@/api/base44Client';
import UserAvatar from '@/components/common/UserAvatar';
import AnswerCard from '@/components/answers/AnswerCard';
import AnswerComposer from '@/components/answers/AnswerComposer';
import MessageAndHelpModal from '@/components/connections/MessageAndHelpModal';
import PublicPurposeBanner from '@/components/questions/PublicPurposeBanner';
import PublicAnswerList from '@/components/questions/PublicAnswerList';
import PublicQuestionGate from '@/components/questions/PublicQuestionGate';
import LightweightRespondModal from '@/components/questions/LightweightRespondModal';
import LightweightAnswerComposer from '@/components/answers/LightweightAnswerComposer';
import ResolveQuestionButton from '@/components/questions/ResolveQuestionButton';
import { useToast } from '@/components/ui/use-toast';
import { trackEvent } from '@/components/utils/analytics';
import moment from 'moment';

export default function QuestionDetailPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const questionId = params.id;

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes', 'newest', 'oldest'
  const [isLoading, setIsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAnswerAuthor, setSelectedAnswerAuthor] = useState(null);
  
  // Lightweight responder state
  const [showLightweightModal, setShowLightweightModal] = useState(false);
  const [lightweightResponder, setLightweightResponder] = useState(null);
  const [shouldOpenComposer, setShouldOpenComposer] = useState(false);
  const answerComposerRef = useRef(null);
  
  // Analytics deduplication flags (per page load)
  const viewedEventSent = useRef(false);
  const signedInEventSent = useRef(false);

  // Extract share attribution params FIRST (before using them)
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const shareSource = urlParams.get('src');
  const sharerUserId = urlParams.get('ref');
  const isFromShare = shareSource === 'share';

  // Check if we should auto-open composer (returning from auth)
  useEffect(() => {
    const currentUrlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const openComposer = currentUrlParams.get('open_composer') === 'true';
    const postAuthAction = sessionStorage.getItem('post_auth_action');
    const storedSharerRef = sessionStorage.getItem('share_ref_user_id');
    
    if ((openComposer || postAuthAction === 'open_answer_composer') && user) {
      setShouldOpenComposer(true);
      
      // Track sign-in from shared question (Event 3) - dedupe
      if ((storedSharerRef || isFromShare) && !signedInEventSent.current) {
        signedInEventSent.current = true;
        trackEvent('shared_question_signed_in', {
          question_id: questionId,
          ref_sharer_user_id: storedSharerRef || sharerUserId || null,
          viewer_user_id: user.id,
          timestamp: new Date().toISOString()
        });
      }
      
      // Clean up
      sessionStorage.removeItem('post_auth_action');
      sessionStorage.removeItem('pending_answer_question_id');
      sessionStorage.removeItem('share_ref_user_id');
      
      // Clean URL - preserve only the question id
      const cleanUrl = `${window.location.origin}/#QuestionDetail?id=${questionId}`;
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [user, questionId, isFromShare, sharerUserId]);

  // Scroll to and focus answer composer when returning from auth
  useEffect(() => {
    if (shouldOpenComposer && answerComposerRef.current && !isLoading) {
      setTimeout(() => {
        answerComposerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Try to focus the textarea inside
        const textarea = answerComposerRef.current?.querySelector('textarea');
        if (textarea) {
          setTimeout(() => textarea.focus(), 500);
        }
      }, 300);
      setShouldOpenComposer(false);
    }
  }, [shouldOpenComposer, isLoading]);

  // Check for existing lightweight session
  useEffect(() => {
    const storedResponder = sessionStorage.getItem('lightweight_responder');
    if (storedResponder) {
      try {
        const parsed = JSON.parse(storedResponder);
        if (parsed.verified) {
          setLightweightResponder(parsed);
        }
      } catch (e) {
        // Invalid stored data
        sessionStorage.removeItem('lightweight_responder');
      }
    }
  }, []);

  // Track shared question view (Event 1) - only when src=share, dedupe per page load
  useEffect(() => {
    if (questionId && isFromShare && !viewedEventSent.current) {
      viewedEventSent.current = true;
      trackEvent('shared_question_viewed', { 
        question_id: questionId,
        ref_sharer_user_id: sharerUserId || null,
        viewer_user_id: user?.id || null,
        is_logged_in: !!user,
        timestamp: new Date().toISOString()
      });
    }
  }, [questionId, isFromShare, sharerUserId]); // Note: only fire once on mount, not when user changes

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    setIsLoading(true);
    try {
      // Try to get from HelpRequest first, then JobRequest
      let q = null;
      let questionSource = null;
      
      try {
        const helpRequests = await HelpRequest.filter({ id: questionId });
        if (helpRequests && helpRequests.length > 0) {
          q = helpRequests[0];
          questionSource = 'HelpRequest';
        }
      } catch {
        // Not found in HelpRequest, will try JobRequest
      }
      
      if (!q) {
        try {
          const jobRequests = await JobRequest.filter({ id: questionId });
          if (jobRequests && jobRequests.length > 0) {
            q = jobRequests[0];
            questionSource = 'JobRequest';
          }
        } catch {
          // Not found in JobRequest either
        }
      }
      
      // Fallback: search in full lists
      if (!q) {
        const [helpRequests, jobRequests] = await Promise.all([
          HelpRequest.list('-created_date', 500),
          JobRequest.list('-created_date', 500)
        ]);
        
        q = helpRequests.find(item => item.id === questionId);
        if (q) {
          questionSource = 'HelpRequest';
        } else {
          q = jobRequests.find(item => item.id === questionId);
          if (q) questionSource = 'JobRequest';
        }
      }
      
      if (!q) {
        toast({
          title: "Question not found",
          variant: "destructive"
        });
        navigate('Connections');
        return;
      }
      
      // Load answers FIRST so we can get accurate count
      // Load from both Answer (for HelpRequests) and JobAnswer (for JobRequests)
      const [regularAnswers, jobAnswers] = await Promise.all([
        Answer.filter({ question_id: questionId }).catch(() => []),
        JobAnswer.filter({ job_request_id: questionId }).catch(() => [])
      ]);
      
      // Normalize JobAnswer format to match Answer format
      const normalizedJobAnswers = jobAnswers.map(ja => ({
        ...ja,
        question_id: ja.job_request_id,
        answerer_user_id: ja.responder_id,
        answerer_email: ja.responder_email,
        answerer_name: ja.responder_name,
        answerer_title: ja.responder_title,
        answerer_company: ja.responder_company,
        answerer_persona: ja.responder_type,
        answer_text: ja.message,
        upvote_count: ja.upvote_count || 0,
        is_best_answer: ja.is_helpful || false
      }));
      
      const allAnswers = [...regularAnswers, ...normalizedJobAnswers];
      const sorted = sortAnswers(allAnswers, sortBy);
      setAnswers(sorted);
      
      // NORMALIZE: Use actual answers count from DB as source of truth
      // CRITICAL: Preserve original created_by for notifications even if anonymous
      const normalizedQuestion = {
        ...q,
        _source: questionSource,
        _original_created_by: q.created_by, // Store original for notifications
        answer_count: sorted.length, // Use actual count from answers
        view_count: Number(q.view_count) || Number(q.views_count) || 0,
        total_upvotes: Number(q.total_upvotes) || 0,
        has_best_answer: Boolean(q.has_best_answer)
      };
      
      console.log('Question loaded and normalized:', {
        id: normalizedQuestion.id,
        source: questionSource,
        answer_count: normalizedQuestion.answer_count,
        actual_answers: sorted.length
      });
      
      setQuestion(normalizedQuestion);

      // Track view in session storage to avoid counting multiple views from same user
      const viewKey = `viewed_${questionId}`;
      const hasViewed = sessionStorage.getItem(viewKey);

      console.log('View tracking check:', { viewKey, hasViewed, questionId, questionSource });

      // Only track if user hasn't viewed this question in this session
      if (hasViewed) {
        console.log('Already viewed this question in this session, skipping view tracking');
        return;
      }

      console.log('Calling trackQuestionView function...');
      
      // Use backend function to increment view count (bypasses RLS)
      base44.functions.invoke('trackQuestionView', {
        questionId: questionId,
        questionType: questionSource
      }).then(response => {
        console.log('trackQuestionView response:', response);
        if (response?.data?.success) {
          const newViewCount = response.data.newViewCount;
          console.log('View count updated to:', newViewCount);
          // Update local view count - use functional update to ensure we get latest state
          setQuestion(prevQuestion => {
            if (!prevQuestion) return prevQuestion;
            console.log('Updating question state with new view_count:', newViewCount);
            return {
              ...prevQuestion,
              view_count: newViewCount
            };
          });
          // Set session storage after successful tracking
          sessionStorage.setItem(viewKey, 'true');
        } else {
          console.log('trackQuestionView failed:', response?.data);
        }
      }).catch(err => {
        console.error('View tracking error:', err);
        console.error('Error response data:', err?.response?.data);
        console.error('Error details:', err?.response?.data?.error, err?.response?.data?.details);
      });

    } catch (err) {
      console.error('Failed to load question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortAnswers = (answerList, sort) => {
    let sorted = [...answerList];
    
    // Always put best answer first
    const bestIndex = sorted.findIndex(a => a.is_best_answer);
    let bestAnswer = null;
    if (bestIndex > -1) {
      bestAnswer = sorted.splice(bestIndex, 1)[0];
    }

    // Sort the rest
    if (sort === 'upvotes') {
      sorted.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
    } else if (sort === 'newest') {
      sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }

    // Put best answer at the top
    if (bestAnswer) {
      sorted.unshift(bestAnswer);
    }

    return sorted;
  };

  useEffect(() => {
    if (answers.length > 0) {
      setAnswers(sortAnswers(answers, sortBy));
    }
  }, [sortBy]);

  const handleAnswerPosted = (newAnswer) => {
    console.log('handleAnswerPosted called with:', newAnswer);
    
    // Add new answer to the top of the list
    setAnswers(prev => {
      const updated = [newAnswer, ...prev];
      console.log('Answers list updated, new length:', updated.length);
      return updated;
    });
    
    // Update question stats immediately (optimistic update)
    setQuestion(prev => {
      if (!prev) {
        console.error('No previous question state!');
        return prev;
      }
      const currentCount = Number(prev.answer_count) || 0;
      const newCount = currentCount + 1;
      console.log('Updating answer_count:', currentCount, '→', newCount);
      return {
        ...prev,
        answer_count: newCount
      };
    });
    
    // Track response posted from shared question (Event 4) - only if src=share was in URL
    const storedSharerRef = sessionStorage.getItem('share_ref_user_id');
    const effectiveSharerRef = storedSharerRef || sharerUserId;
    
    if (isFromShare || effectiveSharerRef) {
      trackEvent('shared_question_response_posted', {
        question_id: questionId,
        ref_sharer_user_id: effectiveSharerRef || null,
        viewer_user_id: user?.id,
        response_id: newAnswer.id,
        timestamp: new Date().toISOString()
      });
      
      // Notify the sharer that someone they looped in responded
      if (effectiveSharerRef && effectiveSharerRef !== user?.id) {
        base44.functions.invoke('notifySharerOfResponse', {
          questionId: questionId,
          sharerUserId: effectiveSharerRef,
          responderUserId: user?.id,
          responderName: user?.full_name || 'Someone'
        }).catch(err => {
          console.log('Failed to notify sharer (non-critical):', err.message);
        });
      }
      
      // Notify the student that someone external was looped in and responded
      base44.functions.invoke('notifyStudentOfExternalHelp', {
        questionId: questionId,
        questionType: question?._source,
        sharerUserId: effectiveSharerRef,
        responderName: user?.full_name || 'Someone'
      }).catch(err => {
        console.log('Failed to notify student (non-critical):', err.message);
      });
    }
  };

  const handleUpvoteChange = (answerId, newCount) => {
    console.log('handleUpvoteChange called:', { answerId, newCount });
    
    setAnswers(prev => prev.map(a => 
      a.id === answerId ? { ...a, upvote_count: newCount } : a
    ));

    // Recalculate total upvotes using the new count
    setQuestion(prev => {
      if (!prev) return prev;
      const updatedAnswers = answers.map(a => 
        a.id === answerId ? { ...a, upvote_count: newCount } : a
      );
      const totalUpvotes = updatedAnswers.reduce((sum, a) => sum + (a.upvote_count || 0), 0);
      console.log('Updating question total_upvotes to:', totalUpvotes);
      return { ...prev, total_upvotes: totalUpvotes };
    });
  };

  const handleMarkBest = async (answerId) => {
    try {
      // Remove best from all other answers
      for (const a of answers) {
        if (a.is_best_answer) {
          await Answer.update(a.id, { is_best_answer: false });
        }
      }

      // Mark this one as best
      await Answer.update(answerId, { is_best_answer: true });
      await HelpRequest.update(questionId, { has_best_answer: true });

      // Update local state
      setAnswers(prev => prev.map(a => ({
        ...a,
        is_best_answer: a.id === answerId
      })));

      setQuestion(prev => ({ ...prev, has_best_answer: true }));

      toast({
        title: "✅ Best answer marked!",
        description: "The answerer has been notified"
      });

    } catch (err) {
      console.error('Failed to mark best answer:', err);
      throw err;
    }
  };

  const handleMessageAuthor = (answer) => {
    setSelectedAnswerAuthor({
      id: answer.answerer_user_id,
      email: answer.answerer_email,
      full_name: answer.answerer_name
    });
    setShowMessageModal(true);
  };

  const handleLightweightVerified = (responderInfo) => {
    console.log('handleLightweightVerified called with:', responderInfo);
    
    // CRITICAL: Ensure we have the verified flag set
    const verifiedInfo = {
      ...responderInfo,
      verified: true
    };
    
    // Update state AND session storage to ensure composer shows
    setLightweightResponder(verifiedInfo);
    sessionStorage.setItem('lightweight_responder', JSON.stringify(verifiedInfo));
    
    // Close the modal
    setShowLightweightModal(false);
    
    // Track verification complete
    trackEvent('shared_question_verified', { 
      question_id: questionId,
      responder_role: responderInfo.role
    });
    
    // Force scroll to where the composer will appear after state update
    setTimeout(() => {
      const composerElement = document.querySelector('.lightweight-composer');
      if (composerElement) {
        composerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleLightweightAnswerPosted = (newAnswer) => {
    // Add new answer to list
    setAnswers(prev => [newAnswer, ...prev]);
    
    // Update question stats
    setQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answer_count: (prev.answer_count || 0) + 1
      };
    });
    
    // Track response posted
    trackEvent('shared_question_response_posted', { 
      question_id: questionId,
      answer_id: newAnswer.id
    });
  };

  const handleLightweightRespondIntent = () => {
    // Track intent to respond
    trackEvent('shared_question_respond_intent', { question_id: questionId });
    setShowLightweightModal(true);
  };

  const isQuestionAsker = question?.student_id === user?.id || 
                          question?.student_email === user?.email ||
                          question?.created_by === user?.email;

  // Determine if this is a public (logged-out) view
  const isPublicView = !user;
  
  // Show lightweight composer if verified but not logged in
  const showLightweightComposer = isPublicView && lightweightResponder?.verified;

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading question...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top-color: #0021A5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p { color: #6B7280; }
        `}</style>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  const posterType = question.poster_type || 'student';
  const isAnonymous = question.is_anonymous && posterType === 'parent';
  
  // Derive poster display name with proper fallback chain
  const getPosterDisplayName = () => {
    if (isAnonymous) return 'Anonymous Parent';
    
    // Try poster_first_name + poster_last_name (best source)
    if (question.poster_first_name && question.poster_last_name && !question.poster_first_name.includes(',')) {
      const first = question.poster_first_name.charAt(0).toUpperCase() + question.poster_first_name.slice(1).toLowerCase();
      const lastInitial = question.poster_last_name.charAt(0).toUpperCase();
      return `${first} ${lastInitial}.`;
    }
    
    // Try poster_name (may be "Last, First" format)
    if (question.poster_name) {
      const name = question.poster_name;
      if (name.includes(',')) {
        const parts = name.split(',').map(p => p.trim());
        const first = parts[1]?.split(' ')[0];
        const lastInitial = parts[0]?.charAt(0)?.toUpperCase();
        if (first && lastInitial) return `${first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()} ${lastInitial}.`;
      }
      // Regular "First Last" format
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
      }
      if (name && !name.includes('@')) return name;
    }
    
    // Try student_name
    if (question.student_name && !question.student_name.includes('@')) {
      return question.student_name;
    }
    
    return 'A UF Student';
  };
  const posterName = getPosterDisplayName();

  return (
    <div className="question-detail-page overflow-x-hidden">
      {/* Back Navigation - only show for logged-in users */}
      {!isPublicView && (
        <div className="nav-header">
          <Button
            variant="ghost"
            onClick={() => navigate('Connections')}
            className="back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Questions
          </Button>
        </div>
      )}

      <div className="content-container">
        {/* Purpose Banner for public view */}
        {isPublicView && <PublicPurposeBanner />}

        {/* Question Section */}
        <div className="question-section">
          <div className="question-header">
            {/* Poster Type Badge */}
            {posterType !== 'student' && (
              <span className={`poster-badge ${posterType}`}>
                {posterType === 'parent' ? '👨‍👩‍👧 Parent Question' : '🎯 Alumni Question'}
              </span>
            )}
            
            {/* Poster Info - simplified for public view */}
            <div className="poster-info">
              {isAnonymous ? (
                <div className="anonymous-avatar">
                  <span>👨‍👩‍👧</span>
                </div>
              ) : (
                <div className="poster-avatar-placeholder">
                  <span>{posterName?.charAt(0) || 'G'}</span>
                </div>
              )}
              <div className="poster-details">
                {/* For public view, show generic name to protect privacy */}
                <span className="poster-name">
                  {isPublicView ? (isAnonymous ? 'Anonymous Parent' : 'A UF Student') : posterName}
                </span>
                {!isPublicView && posterType === 'student' && !question.student_major && question.target_industry && (
                  <span className="poster-meta">
                    {question.student_year && `${question.student_year} • `}
                    {question.target_industry}
                  </span>
                )}
                {!isPublicView && posterType === 'student' && question.student_major && (
                  <span className="poster-meta">
                    {question.student_year && `${question.student_year} • `}
                    {question.student_major}
                  </span>
                )}
                <span className="post-time">
                  Posted {moment(question.created_date).fromNow()}
                </span>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="question-content">
            <p className="question-text">"{question.description}"</p>
            
            {/* Tags */}
            <div className="question-tags">
              {question.help_types?.map((type, idx) => (
                <span key={idx} className="tag">
                  {type.replace(/_/g, ' ')}
                </span>
              ))}
              {question.industry && (
                <span className="tag industry">{question.industry}</span>
              )}
            </div>

            {/* Stats - use answers.length as source of truth since DB may not update due to RLS */}
            {/* Hide detailed stats for public view */}
            <div className="question-stats">
              <span className="stat">
                <MessageSquare className="w-4 h-4" />
                {answers.length} answers
              </span>
              {!isPublicView && (
                <>
                  <span className="stat">
                    <Eye className="w-4 h-4" />
                    {question.view_count || 0} views
                  </span>
                  {question.total_upvotes > 0 && (
                    <span className="stat">
                      <ChevronUp className="w-4 h-4" />
                      {question.total_upvotes} upvotes
                    </span>
                  )}
                </>
              )}
              {question.has_best_answer && (
                <span className="stat best">
                  <Award className="w-4 h-4" />
                  Best answer selected
                </span>
              )}
              {question.status === 'fulfilled' && (
                <span className="stat best">
                  <Award className="w-4 h-4" />
                  ✓ Resolved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Answers Section - only show header if there are answers */}
        <div className="answers-section">
          {answers.length > 0 && (
            <div className="answers-header">
              <h2>Answers ({answers.length})</h2>
              
              {/* Sort controls only for logged-in users */}
              {!isPublicView && (
                <div className="sort-controls">
                  <span>Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="upvotes">Most Upvoted</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Public View: Limited answer list */}
          {isPublicView ? (
            <>
              <PublicAnswerList answers={answers} questionId={questionId} />
              
              {/* Show lightweight composer if verified, otherwise show gate */}
              {showLightweightComposer ? (
                <LightweightAnswerComposer
                  question={question}
                  responderInfo={lightweightResponder}
                  onAnswerPosted={handleLightweightAnswerPosted}
                />
              ) : (
                <PublicQuestionGate 
                  questionId={questionId} 
                  onLightweightRespond={handleLightweightRespondIntent}
                  hasMoreResponses={answers.length > 2}
                />
              )}
            </>
          ) : (
            <>
              {/* Logged-in View: Full answer list - only show if there are answers */}
              {answers.length > 0 && (
                <div className="answers-list">
                  {answers.map(answer => (
                    <AnswerCard
                      key={answer.id}
                      answer={answer}
                      currentUser={user}
                      isQuestionAsker={isQuestionAsker}
                      onUpvoteChange={handleUpvoteChange}
                      onMarkBest={handleMarkBest}
                      onMessage={handleMessageAuthor}
                    />
                  ))}
                </div>
              )}

              {/* Resolve Button - for the question asker */}
              {isQuestionAsker && question.status !== 'fulfilled' && (
                <div className="mb-4">
                  <ResolveQuestionButton
                    question={question}
                    answers={answers}
                    currentUser={user}
                    onResolved={() => {
                      setQuestion(prev => prev ? { ...prev, status: 'fulfilled' } : prev);
                    }}
                  />
                </div>
              )}

              {/* Answer Composer - only for logged-in users who are not the asker */}
              {!isQuestionAsker && (
                <div ref={answerComposerRef}>
                  <AnswerComposer
                    question={question}
                    currentUser={user}
                    onAnswerPosted={handleAnswerPosted}
                    autoFocus={shouldOpenComposer}
                    answerCount={answers.length}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && selectedAnswerAuthor && (
        <MessageAndHelpModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedAnswerAuthor(null);
          }}
          request={{
            ...question,
            created_by: selectedAnswerAuthor.email,
            poster_name: selectedAnswerAuthor.full_name
          }}
        />
      )}

      {/* Lightweight Respond Modal */}
      <LightweightRespondModal
        isOpen={showLightweightModal}
        onClose={() => setShowLightweightModal(false)}
        questionId={questionId}
        onVerificationComplete={handleLightweightVerified}
      />

      <style jsx>{`
        .question-detail-page {
          min-height: 100vh;
          background: #F9FAFB;
          padding-bottom: 60px;
        }

        .nav-header {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          color: #6B7280;
          font-weight: 600;
          min-height: 44px;
        }

        .back-btn:hover {
          color: #0021A5;
        }

        .content-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 12px;
        }
        
        @media (min-width: 640px) {
          .content-container {
            padding: 0 20px;
          }
        }

        .question-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .question-header {
          margin-bottom: 20px;
        }

        .poster-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .poster-badge.parent {
          background: #E0E7FF;
          color: #4338CA;
        }

        .poster-badge.alumni {
          background: #FEF3C7;
          color: #92400E;
        }

        .poster-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .poster-avatar, .anonymous-avatar, .poster-avatar-placeholder {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .anonymous-avatar, .poster-avatar-placeholder {
          background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .poster-avatar-placeholder {
          font-size: 18px;
          font-weight: 600;
          color: #4338CA;
        }

        .poster-details {
          display: flex;
          flex-direction: column;
        }

        .poster-name {
          font-size: 16px;
          font-weight: 700;
          color: #0021A5;
        }

        .poster-meta {
          font-size: 14px;
          color: #6B7280;
        }

        .post-time {
          font-size: 13px;
          color: #9CA3AF;
        }

        .question-content {
          border-top: 1px solid #F3F4F6;
          padding-top: 20px;
        }

        .question-text {
          font-size: 20px;
          line-height: 1.6;
          color: #1F2937;
          font-style: italic;
          margin: 0 0 20px 0;
        }

        .question-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          background: #F3F4F6;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 16px;
          text-transform: capitalize;
        }

        .tag.industry {
          background: #DBEAFE;
          color: #1E40AF;
        }

        .question-stats {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6B7280;
        }

        .stat.best {
          color: #10B981;
          font-weight: 600;
        }

        .answers-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .answers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .answers-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #0F172A;
          margin: 0;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6B7280;
        }

        .sort-select {
          padding: 6px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .sort-select:focus {
          outline: none;
          border-color: #0021A5;
        }

        .answers-list {
          margin-bottom: 24px;
        }

        .no-answers {
          text-align: center;
          padding: 48px 20px;
        }

        .no-answers h3 {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin: 16px 0 8px;
        }

        .no-answers p {
          font-size: 14px;
          color: #9CA3AF;
        }

        @media (max-width: 640px) {
          .question-detail-page {
            padding-bottom: 100px; /* Extra space for fixed answer input */
          }

          .nav-header {
            position: sticky;
            top: 0;
            z-index: 10;
            background: white;
            border-bottom: 1px solid #E5E7EB;
            padding: 12px 16px;
          }

          .back-btn {
            font-size: 14px;
            padding: 0;
          }

          .content-container {
            padding: 0;
          }

          .question-section {
            border-radius: 0;
            padding: 16px;
            margin-bottom: 12px;
          }

          .poster-info {
            gap: 10px;
          }

          .poster-avatar, .anonymous-avatar, .poster-avatar-placeholder {
            width: 40px;
            height: 40px;
          }

          .poster-name {
            font-size: 14px;
          }

          .poster-meta, .post-time {
            font-size: 12px;
          }

          .question-text {
            font-size: 16px;
            line-height: 1.5;
          }

          .question-tags {
            gap: 6px;
          }

          .tag {
            font-size: 11px;
            padding: 3px 10px;
          }

          .question-stats {
            gap: 12px;
          }

          .stat {
            font-size: 12px;
          }

          .answers-section {
            border-radius: 0;
            padding: 16px;
          }

          .answers-header {
            margin-bottom: 16px;
          }

          .answers-header h2 {
            font-size: 16px;
          }

          .sort-select {
            min-height: 40px;
            font-size: 16px; /* Prevent iOS zoom */
          }

          .no-answers {
            padding: 32px 16px;
          }

          .no-answers h3 {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { JobRequest } from '@/entities/JobRequest';
import { navigate } from '@/components/utils/navigation';
import { Loader2, Send, Check, AlertCircle, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Parse student name from "Last, First" format
function parseStudentName(posterName) {
  if (!posterName) return 'A student';
  const parts = posterName.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const firstName = parts[1].split(' ')[0];
    return firstName || parts[1];
  }
  return posterName.split(' ')[0] || 'A student';
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

const HELP_TYPE_LABELS = {
  job_search: 'Job Search',
  resume: 'Resume Help',
  interviews: 'Interview Prep',
  networking: 'Networking',
  direction: 'Career Direction',
  industry_insights: 'Industry Insights',
  grad_school: 'Grad School',
  salary: 'Salary Advice'
};

export default function ReferralAnswer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [referrerName, setReferrerName] = useState('');
  const [referralToken, setReferralToken] = useState('');
  
  // Form state
  const [answerText, setAnswerText] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    setLoading(true);
    try {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token') || window.location.hash.split('token=')[1]?.split('&')[0];
      
      if (!token) {
        setError('invalid_link');
        setLoading(false);
        return;
      }

      // Check if user is already authenticated - redirect to normal question page
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (isAuthenticated) {
        // Parse token to get question ID and redirect
        try {
          const decoded = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')));
          if (decoded.q) {
            console.log('Authenticated user on magic link - redirecting to question:', decoded.q);
            navigate(`QuestionDetail?id=${decoded.q}`);
            return;
          }
        } catch (e) {
          console.log('Could not decode token for redirect:', e);
        }
      }

      setReferralToken(token);

      // Validate token and get question data
      const response = await base44.functions.invoke('validateReferralToken', { token });

      if (!response.data?.success) {
        setError(response.data?.error || 'invalid_link');
        setLoading(false);
        return;
      }

      const { questionId, referrerName: refName } = response.data;
      setReferrerName(refName || 'A Gator Parent');

      // Load the question
      const questions = await JobRequest.filter({ id: questionId });
      if (!questions || questions.length === 0) {
        setError('question_not_found');
        setLoading(false);
        return;
      }

      setQuestion(questions[0]);
    } catch (err) {
      console.error('Failed to load referral:', err);
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = 
    answerText.trim().length >= 50 &&
    fullName.trim() &&
    email.trim() &&
    email.includes('@') &&
    jobTitle.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('submitReferralAnswer', {
        token: referralToken,
        questionId: question.id,
        answerText: answerText.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        jobTitle: jobTitle.trim(),
        company: company.trim()
      });

      if (response.data?.success) {
        setSubmitted(true);
        toast({
          title: "Answer sent!",
          description: `${parseStudentName(question.poster_name)} will be notified.`
        });
      } else {
        throw new Error(response.data?.error || 'Failed to submit');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            {error === 'expired' ? 'This link has expired' : 
             error === 'question_not_found' ? 'Question no longer available' :
             'Invalid link'}
          </h1>
          <p className="text-slate-600 mb-6">
            {error === 'expired' 
              ? 'The referral link you clicked is no longer valid.'
              : 'This question may have been answered or removed.'}
          </p>
          <button
            onClick={() => navigate('LandingPage')}
            className="px-6 py-3 bg-[#0021A5] text-white rounded-xl font-bold hover:bg-[#001580] transition-all"
          >
            Join College Fast Forward
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Thank you!
          </h1>
          <p className="text-slate-600 mb-2">
            Your answer is on its way to {parseStudentName(question.poster_name)}.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Check your email ({email}) to complete your profile and help more UF students.
          </p>
          <button
            onClick={() => navigate('LandingPage')}
            className="px-6 py-3 bg-[#0021A5] text-white rounded-xl font-bold hover:bg-[#001580] transition-all"
          >
            Learn More About College Fast Forward
          </button>
        </div>
      </div>
    );
  }

  const studentName = parseStudentName(question?.poster_name);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
            alt="College Fast Forward"
            className="h-12 w-auto"
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Referrer Context */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0021A5] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <User className="w-4 h-4" />
            {referrerName} thinks you can help
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
            A UF student needs your advice
          </h1>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#0021A5] to-[#001580] px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{studentName}</p>
                <p className="text-sm text-white/80">
                  {question.student_major && `${question.student_major} `}
                  {question.student_year && `'${String(question.student_year).slice(-2)}`}
                  {' • Posted '}
                  {formatRelativeTime(question.created_date)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {question.help_types && question.help_types.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.help_types.slice(0, 4).map(ht => (
                  <span 
                    key={ht}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {HELP_TYPE_LABELS[ht] || ht}
                  </span>
                ))}
              </div>
            )}
            <p className="text-slate-800 text-lg leading-relaxed">
              {question.description || question.title}
            </p>
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Your Answer</h2>
          
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Share your experience, tips, or encouragement..."
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl resize-none h-32
                     focus:border-[#0021A5] focus:outline-none transition-colors mb-1"
          />
          <div className="flex justify-between mb-6">
            {answerText.trim().length < 50 && answerText.length > 0 && (
              <p className="text-xs text-amber-600">
                A bit more detail would really help ({50 - answerText.trim().length} more characters)
              </p>
            )}
            <p className="text-xs text-slate-400 ml-auto">{answerText.length} characters</p>
          </div>

          <div className="border-t pt-6 mt-2">
            <p className="text-sm font-semibold text-slate-700 mb-4">
              Your Info <span className="font-normal text-slate-400">(so the student knows who's helping)</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Your name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Job title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="VP of Marketing"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl
                           focus:border-[#0021A5] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`
              w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
              ${canSubmit && !submitting
                ? 'bg-[#0021A5] text-white hover:bg-[#001580] shadow-lg hover:shadow-xl'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send My Answer
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            By answering, you agree to our <a href="#Terms" className="underline">Terms of Service</a>
          </p>
        </div>
      </main>
    </div>
  );
}
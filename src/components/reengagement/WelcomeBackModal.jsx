import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { navigate } from '@/components/utils/navigation';
import { getWelcomeBackData } from '@/functions/getWelcomeBackData';
import { resetReengagementState } from '@/functions/resetReengagementState';

const schoolConfig = {
  schoolShortName: 'UF',
  primaryColor: '#0021A5'
};

function parseFirstName(fullName) {
  if (!fullName) return 'Student';
  const parts = fullName.split(' ');
  return parts[0] || 'Student';
}

function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
}

export default function WelcomeBackModal({ user, onClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkWelcomeBack();
  }, [user]);

  const checkWelcomeBack = async () => {
    // Check if dismissed recently
    const lastDismissed = localStorage.getItem('welcomeBackDismissed');
    if (lastDismissed) {
      const daysSinceDismissed = Math.floor((Date.now() - new Date(lastDismissed)) / (1000 * 60 * 60 * 24));
      if (daysSinceDismissed < 7) {
        setLoading(false);
        return;
      }
    }

    try {
      const response = await getWelcomeBackData({});
      if (response.data?.show && response.data?.questions?.length > 0) {
        setQuestions(response.data.questions);
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Welcome back check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    localStorage.setItem('welcomeBackDismissed', new Date().toISOString());
    setIsOpen(false);
    
    // Reset re-engagement state on any interaction
    try {
      await resetReengagementState({});
    } catch (err) {
      console.error('Failed to reset state:', err);
    }
    
    onClose?.();
  };

  const handleSkip = () => {
    if (currentIndex >= questions.length - 1) {
      handleDismiss();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAnswer = async () => {
    const question = questions[currentIndex];
    setIsOpen(false);
    
    // Reset state
    try {
      await resetReengagementState({});
    } catch (err) {
      console.error('Failed to reset state:', err);
    }
    
    // Navigate to question
    navigate('QuestionDetail', { 
      id: question.id, 
      type: question.questionType,
      utm_source: 'welcome_back'
    });
    
    onClose?.();
  };

  if (loading || !isOpen || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex];
  const studentName = parseFirstName(currentQuestion.posterName);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: schoolConfig.primaryColor }}
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            Welcome back, {parseFirstName(user?.full_name)}!
          </h2>
          <p className="opacity-90 mt-1">A student could use your help</p>
        </div>

        {/* Question Card */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Question {currentIndex + 1} of {questions.length}
          </p>

          <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: schoolConfig.primaryColor }}
              >
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{studentName}</p>
                <p className="text-gray-500 text-sm">
                  {currentQuestion.major}
                  {currentQuestion.gradYear && ` · ${currentQuestion.gradYear}`}
                  {currentQuestion.createdAt && ` · Posted ${formatTimeAgo(currentQuestion.createdAt)}`}
                </p>
              </div>
            </div>

            <p className="text-gray-700 italic">
              "{truncate(currentQuestion.description, 150)}"
            </p>

            {currentQuestion.helpTypes?.length > 0 && (
              <p className="text-sm text-gray-500 mt-3">
                ✨ Looking for: {currentQuestion.helpTypes.slice(0, 2).join(', ')}
              </p>
            )}
          </div>

          {/* Actions */}
          <Button
            onClick={handleAnswer}
            className="w-full mb-3 h-12 text-base font-semibold"
            style={{ backgroundColor: schoolConfig.primaryColor }}
          >
            Help {studentName}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              {currentIndex >= questions.length - 1 ? 'Skip' : 'Show Another'}
            </Button>

            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="flex-1 text-gray-500"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
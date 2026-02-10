import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { showKarmaToast } from '@/components/karma/KarmaToast';
import { checkAndMarkActivation } from '@/components/utils/checkAndMarkActivation';

export default function ThisHelpedButton({ answer, currentUser, isQuestionAsker }) {
  const { toast } = useToast();
  const [marked, setMarked] = useState(answer.is_helpful || false);
  const [isLoading, setIsLoading] = useState(false);

  // Only show for the student who asked the question
  if (!isQuestionAsker || !currentUser) return null;

  // Don't show if it's the student's own answer
  if (answer.answerer_user_id === currentUser.id || answer.answerer_email === currentUser.email) return null;

  const handleClick = async () => {
    if (marked || isLoading) return;
    setIsLoading(true);

    try {
      // Mark answer as helpful in the DB
      try {
        await base44.entities.Answer.update(answer.id, { is_helpful: true });
      } catch (e) {
        // May fail due to RLS on Answer, try JobAnswer
        try {
          await base44.entities.JobAnswer.update(answer.id, { is_helpful: true });
        } catch (e2) {
          console.log('Could not update answer directly (RLS), continuing with karma award');
        }
      }

      // Award karma to the answerer (+5 for marked_helpful)
      const answererUserId = answer.answerer_user_id;
      const answererEmail = answer.answerer_email;

      if (answererEmail) {
        try {
          const res = await base44.functions.invoke('awardKarma', {
            parentUserId: answererUserId || '',
            parentEmail: answererEmail,
            actionType: 'upvote_received', // Use existing 3-point action for now
            referenceType: 'answer',
            referenceId: answer.id,
            description: `${currentUser.full_name || 'A student'} said your answer helped!`
          });
          console.log('Karma awarded for helpful:', res?.data);
        } catch (karmaErr) {
          console.log('Karma award failed (non-critical):', karmaErr.message);
        }
      }

      // Create a notification for the answerer
      try {
        await base44.functions.invoke('createNotification', {
          userId: answererUserId || '',
          userEmail: answererEmail,
          type: 'marked_helpful',
          title: `✅ ${currentUser.full_name?.split(' ')[0] || 'A student'} said your answer helped!`,
          message: 'Your advice made a difference. Keep it up!',
          link: `QuestionDetail?id=${answer.question_id || answer.job_request_id}`
        });
      } catch (notifErr) {
        console.log('Notification failed (non-critical):', notifErr.message);
      }

      setMarked(true);

      // Mark activation for the student who marked it helpful
      checkAndMarkActivation(currentUser.id, 'marked_helpful');

      toast({
        title: "✅ Marked as helpful!",
        description: "The helper has been notified.",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to mark as helpful:', err);
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={marked || isLoading}
      className={`text-xs font-semibold transition-all ${
        marked
          ? 'text-green-600 bg-green-50 cursor-default'
          : 'text-slate-500 hover:text-green-600 hover:bg-green-50'
      }`}
    >
      {marked ? (
        <>
          <Check className="w-3.5 h-3.5 mr-1" />
          Marked as Helpful
        </>
      ) : (
        <>
          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
          This Helped!
        </>
      )}
    </Button>
  );
}
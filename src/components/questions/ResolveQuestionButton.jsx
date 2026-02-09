import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function ResolveQuestionButton({ question, answers, currentUser, onResolved }) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [selectedAnswerer, setSelectedAnswerer] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Only show for the question asker
  const isAsker = question?.student_id === currentUser?.id ||
                  question?.student_email === currentUser?.email ||
                  question?.poster_email === currentUser?.email ||
                  question?.created_by === currentUser?.email;

  if (!isAsker || question?.status === 'fulfilled' || question?.status === 'closed') return null;

  // Get unique answerers for the dropdown
  const uniqueAnswerers = [];
  const seenEmails = new Set();
  (answers || []).forEach(a => {
    const email = a.answerer_email || a.responder_email;
    const name = a.answerer_name || a.responder_name;
    if (email && !seenEmails.has(email) && email !== currentUser?.email) {
      seenEmails.add(email);
      uniqueAnswerers.push({
        id: a.answerer_user_id || a.responder_id,
        email,
        name: name || email.split('@')[0],
        answerId: a.id
      });
    }
  });

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      // Update question status
      const updateData = { status: 'fulfilled' };
      
      if (question._source === 'JobRequest') {
        await base44.entities.JobRequest.update(question.id, updateData);
      } else {
        await base44.entities.HelpRequest.update(question.id, updateData);
      }

      // Award karma to credited parent (+25)
      if (selectedAnswerer?.id || selectedAnswerer?.email) {
        try {
          await base44.functions.invoke('awardKarma', {
            parentUserId: selectedAnswerer.id || '',
            parentEmail: selectedAnswerer.email,
            actionType: 'outcome_reported',
            referenceType: 'question',
            referenceId: question.id,
            description: `${currentUser.full_name?.split(' ')[0] || 'A student'} got the help they needed!`
          });
        } catch (e) {
          console.log('Karma award for resolution failed:', e.message);
        }

        // Notify credited parent
        try {
          await base44.functions.invoke('createNotification', {
            userId: selectedAnswerer.id || '',
            userEmail: selectedAnswerer.email,
            type: 'outcome_reported',
            title: `🏆 ${currentUser.full_name?.split(' ')[0] || 'A student'} got the help they needed — thanks to you!`,
            message: 'Your contribution made a real difference. +75 karma!',
            link: `QuestionDetail?id=${question.id}`
          });
        } catch (e) {
          console.log('Notification failed:', e.message);
        }
      }

      setShowModal(false);
      toast({
        title: "✅ Question resolved!",
        description: selectedAnswerer ? `${selectedAnswerer.name} has been credited and notified.` : "Glad you got the help you needed!",
        duration: 3000,
      });

      if (onResolved) onResolved();
    } catch (err) {
      console.error('Failed to resolve:', err);
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-green-700 border-green-300 hover:bg-green-50 font-semibold"
      >
        <CheckCircle className="w-4 h-4 mr-1.5" />
        Mark as Resolved
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Resolve This Question
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Great that you got the help you needed! Who helped the most?
            </p>

            {uniqueAnswerers.length > 0 ? (
              <div className="space-y-2">
                {uniqueAnswerers.map((a) => (
                  <label
                    key={a.email}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAnswerer?.email === a.email
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-green-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="credit"
                      checked={selectedAnswerer?.email === a.email}
                      onChange={() => setSelectedAnswerer(a)}
                      className="sr-only"
                    />
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0021A5] to-[#FA4616] flex items-center justify-center text-white text-sm font-bold">
                      {a.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-500">Will receive +75 karma</p>
                    </div>
                    {selectedAnswerer?.email === a.email && (
                      <Award className="w-5 h-5 text-green-600" />
                    )}
                  </label>
                ))}

                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAnswerer === null && showModal
                      ? ''
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="credit"
                    checked={selectedAnswerer === null}
                    onChange={() => setSelectedAnswerer(null)}
                    className="sr-only"
                  />
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                    —
                  </div>
                  <p className="text-sm text-slate-600">Skip — just resolve without credit</p>
                </label>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No answers to credit yet.</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button
                onClick={handleResolve}
                disabled={isResolving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isResolving ? 'Resolving...' : '✓ Resolve'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { X } from 'lucide-react';

export default function ActivationWelcomeBanner({ user }) {
  const [visible, setVisible] = useState(false);
  const [promptRecord, setPromptRecord] = useState(null);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [hasLinkedStudent, setHasLinkedStudent] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadBannerData();
  }, [user?.id]);

  const loadBannerData = async () => {
    try {
      // Check if account is less than 48 hours old
      const createdDate = new Date(user.created_date);
      const hoursSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 48) {
        setLoading(false);
        return;
      }

      // Fetch activation prompt, unanswered questions, and family karma in parallel
      const [prompts, helpRequests, jobRequests, karmaRecords] = await Promise.all([
        base44.entities.ActivationPrompt.filter({ user_id: user.id }, '-created_date', 1),
        base44.entities.HelpRequest.filter({ status: 'active' }, '-created_date', 200),
        base44.entities.JobRequest.filter({ status: 'active' }, '-created_date', 200),
        base44.entities.FamilyKarma.filter({}, undefined, 50),
      ]);

      // Check activation prompt
      const prompt = prompts?.[0];
      if (!prompt || prompt.action_taken || prompt.status === 'dismissed') {
        setLoading(false);
        return;
      }

      // Count questions with 0 answers
      const allQuestions = [...(helpRequests || []), ...(jobRequests || [])];
      const zeroAnswers = allQuestions.filter(q => (q.answer_count || 0) === 0).length;

      // Check if parent has linked a student (any FamilyKarma record where they contributed)
      const parentKarma = (karmaRecords || []).some(k => 
        k.family_group_id && k.total_karma !== undefined
      );
      // Simple heuristic: check if user has student_email or linked status
      const hasStudent = !!user.student_email || !!user.linked_student_id || parentKarma;

      setPromptRecord(prompt);
      setUnansweredCount(zeroAnswers);
      setHasLinkedStudent(hasStudent);
      setVisible(true);

      // Mark as shown if not already
      if (prompt.status === 'pending') {
        base44.entities.ActivationPrompt.update(prompt.id, {
          status: 'shown',
          shown_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.log('ActivationWelcomeBanner load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setVisible(false);
    if (promptRecord?.id) {
      try {
        await base44.entities.ActivationPrompt.update(promptRecord.id, { status: 'dismissed' });
      } catch (err) {
        console.log('Failed to dismiss activation prompt:', err.message);
      }
    }
  };

  const handleCTA = () => {
    navigate('Connections');
  };

  const handleLinkStudent = () => {
    // Scroll to LinkStudentCard area or navigate
    const linkCard = document.querySelector('[data-link-student-card]');
    if (linkCard) {
      linkCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading || !visible) return null;

  return (
    <div
      className="relative bg-white rounded-2xl"
      style={{
        borderLeft: '4px solid #FA6533',
        padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 transition"
        aria-label="Dismiss welcome banner"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>

      <div className="pr-8">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          👋 Welcome to the UF Family!
        </h3>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          <span className="font-semibold text-gray-800">{unansweredCount}</span> students are waiting for career help right now.
          <br />
          Answer one question and earn your first <span className="font-semibold" style={{ color: '#FA4616' }}>15 Family Karma</span> —
          it'll boost your student's visibility instantly.
        </p>

        <button
          onClick={handleCTA}
          className="font-semibold px-6 py-2.5 rounded-xl text-white text-sm transition hover:scale-105 shadow-md"
          style={{
            backgroundColor: '#FA4616',
            boxShadow: '0 4px 12px rgba(250, 70, 22, 0.3)',
          }}
        >
          Answer a Student Question →
        </button>

        {/* Link student secondary CTA */}
        {!hasLinkedStudent && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              💡 Link your student's account to start boosting their visibility →{' '}
              <button
                onClick={handleLinkStudent}
                className="font-semibold underline transition"
                style={{ color: '#0021A5' }}
              >
                Link Student
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
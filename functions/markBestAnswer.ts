import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answerId, questionId } = await req.json();

    if (!answerId || !questionId) {
      return Response.json({ error: 'answerId and questionId are required' }, { status: 400 });
    }

    // Verify user is the question asker
    const questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
    if (questions.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = questions[0];

    // Check if user owns this question
    const isOwner = question.student_id === user.id || 
                    question.student_email === user.email ||
                    question.created_by === user.email;

    if (!isOwner) {
      return Response.json({ error: 'Only the question asker can mark best answer' }, { status: 403 });
    }

    // Remove best answer from all other answers on this question
    const allAnswers = await base44.asServiceRole.entities.Answer.filter({ question_id: questionId });
    for (const answer of allAnswers) {
      if (answer.is_best_answer) {
        await base44.asServiceRole.entities.Answer.update(answer.id, { is_best_answer: false });
      }
    }

    // Mark this answer as best
    await base44.asServiceRole.entities.Answer.update(answerId, { is_best_answer: true });

    // Update question
    await base44.asServiceRole.entities.HelpRequest.update(questionId, { has_best_answer: true });

    // Get the answer to notify the answerer and award karma
    const answers = await base44.asServiceRole.entities.Answer.filter({ id: answerId });
    if (answers.length > 0) {
      const bestAnswer = answers[0];
      
      // Award karma for best answer (+50) - parents/alumni only
      try {
        const answerAuthor = await base44.asServiceRole.entities.User.filter({ id: bestAnswer.answerer_user_id });
        if (answerAuthor.length > 0) {
          const author = answerAuthor[0];
          const isParentOrAlumni = author.persona === 'parent' || author.persona === 'alumni' || 
                                   author.roles?.includes('parent') || author.roles?.includes('alumni');
          
          if (isParentOrAlumni) {
            await base44.functions.invoke('awardKarma', {
              familyGroupId: author.family_group_id || null,
              parentUserId: bestAnswer.answerer_user_id,
              parentEmail: bestAnswer.answerer_email,
              actionType: 'best_answer',
              referenceId: answerId,
              description: 'Answer marked as best'
            });
            console.log('Awarded 50 karma for best answer');
          }
        }
      } catch (karmaErr) {
        console.log('Karma award failed (non-critical):', karmaErr.message);
      }
      
      // Send notification to answerer (create a notification record or send email)
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_id: bestAnswer.answerer_user_id,
          user_email: bestAnswer.answerer_email,
          type: 'best_answer',
          title: '🏆 Your answer was marked as Best Answer! (+50 karma)',
          message: `${user.full_name || 'The question asker'} marked your answer as the best answer to their question.`,
          link: `QuestionDetail?id=${questionId}`,
          is_read: false
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
        // Don't fail the whole operation for notification failure
      }
    }

    return Response.json({ 
      success: true,
      message: 'Best answer marked successfully'
    });

  } catch (error) {
    console.error('Mark best answer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
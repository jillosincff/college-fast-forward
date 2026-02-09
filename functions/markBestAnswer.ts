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

    // Verify user is the question asker - check BOTH HelpRequest and JobRequest
    let question = null;
    let questionEntityType = null;
    
    const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
    if (helpRequests.length > 0) {
      question = helpRequests[0];
      questionEntityType = 'HelpRequest';
    } else {
      const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
      if (jobRequests.length > 0) {
        question = jobRequests[0];
        questionEntityType = 'JobRequest';
      }
    }
    
    if (!question) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }

    // Check if user owns this question
    const isOwner = question.student_id === user.id || 
                    question.student_email === user.email ||
                    question.poster_email === user.email ||
                    question.created_by === user.email;

    if (!isOwner) {
      return Response.json({ error: 'Only the question asker can mark best answer' }, { status: 403 });
    }

    // Remove best answer from all other answers on this question (check both Answer and JobAnswer)
    const [regularAnswers, jobAnswers] = await Promise.all([
      base44.asServiceRole.entities.Answer.filter({ question_id: questionId }),
      base44.asServiceRole.entities.JobAnswer.filter({ job_request_id: questionId })
    ]);
    
    for (const answer of regularAnswers) {
      if (answer.is_best_answer) {
        await base44.asServiceRole.entities.Answer.update(answer.id, { is_best_answer: false });
      }
    }

    // Check if the answerId is an Answer or a JobAnswer
    const isJobAnswer = jobAnswers.some(ja => ja.id === answerId);
    
    if (isJobAnswer) {
      // Mark JobAnswer as helpful (it doesn't have is_best_answer field, use is_helpful)
      await base44.asServiceRole.entities.JobAnswer.update(answerId, { is_helpful: true });
    } else {
      // Mark this Answer as best
      await base44.asServiceRole.entities.Answer.update(answerId, { is_best_answer: true });
    }

    // Update question on the correct entity
    if (questionEntityType === 'HelpRequest') {
      await base44.asServiceRole.entities.HelpRequest.update(questionId, { has_best_answer: true });
    } else {
      await base44.asServiceRole.entities.JobRequest.update(questionId, { has_best_answer: true });
    }

    // Get the answer to notify the answerer and award karma
    // Check both Answer and JobAnswer entities
    let bestAnswer = null;
    let answererUserId = null;
    let answererEmail = null;
    
    const regularAnswerCheck = await base44.asServiceRole.entities.Answer.filter({ id: answerId });
    if (regularAnswerCheck.length > 0) {
      bestAnswer = regularAnswerCheck[0];
      answererUserId = bestAnswer.answerer_user_id;
      answererEmail = bestAnswer.answerer_email;
    } else {
      const jobAnswerCheck = await base44.asServiceRole.entities.JobAnswer.filter({ id: answerId });
      if (jobAnswerCheck.length > 0) {
        bestAnswer = jobAnswerCheck[0];
        answererUserId = bestAnswer.responder_id;
        answererEmail = bestAnswer.responder_email;
      }
    }
    
    if (bestAnswer && answererUserId) {
      // Award karma for best answer (+25) - parents/alumni only
      try {
        const answerAuthor = await base44.asServiceRole.entities.User.filter({ id: answererUserId });
        if (answerAuthor.length > 0) {
          const author = answerAuthor[0];
          const isParentOrAlumni = author.persona === 'parent' || author.persona === 'alumni' || 
                                   author.roles?.includes('parent') || author.roles?.includes('alumni');
          
          if (isParentOrAlumni) {
            await base44.functions.invoke('awardKarma', {
              familyGroupId: author.family_group_id || null,
              parentUserId: answererUserId,
              parentEmail: answererEmail,
              actionType: 'best_answer',
              referenceType: 'answer',
              referenceId: answerId,
              description: 'Answer marked as best'
            });
            console.log('Awarded 25 karma for best answer');
          }
        }
      } catch (karmaErr) {
        console.log('Karma award failed (non-critical):', karmaErr.message);
      }
      
      // Send notification to answerer
      try {
        await base44.asServiceRole.entities.Notification.create({
          user_id: answererUserId,
          user_email: answererEmail,
          type: 'best_answer',
          title: '🏆 Your answer was marked as Best Answer! (+25 karma)',
          message: `${user.full_name || 'The question asker'} marked your answer as the best answer to their question.`,
          link: `QuestionDetail?id=${questionId}`,
          is_read: false
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
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
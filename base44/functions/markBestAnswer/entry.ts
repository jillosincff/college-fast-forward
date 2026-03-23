import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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
    
    if (bestAnswer) {
      // Resolve the answer author - try user ID first, fall back to email lookup
      let author = null;
      
      if (answererUserId) {
        try {
          const authorResults = await base44.asServiceRole.entities.User.filter({ id: answererUserId });
          if (authorResults.length > 0) author = authorResults[0];
        } catch (e) {
          console.log('Author lookup by ID failed:', e.message);
        }
      }
      
      // Fallback: look up by email if user ID was null or lookup failed
      if (!author && answererEmail && answererEmail.includes('@')) {
        try {
          const authorByEmail = await base44.asServiceRole.entities.User.filter({ email: answererEmail });
          if (authorByEmail.length > 0) {
            author = authorByEmail[0];
            answererUserId = author.id;
            console.log('Found author by email fallback:', answererEmail, '→ id:', author.id);
          }
        } catch (e) {
          console.log('Author lookup by email failed:', e.message);
        }
      }

      // Award karma for best answer (+25) - parents/alumni only
      if (author) {
        try {
          const isParentOrAlumni = author.persona === 'parent' || author.persona === 'alumni' || 
                                   author.roles?.includes('parent') || author.roles?.includes('alumni');
          
          if (isParentOrAlumni) {
            await base44.functions.invoke('awardKarma', {
              familyGroupId: author.family_group_id || null,
              parentUserId: author.id,
              parentEmail: author.email,
              actionType: 'best_answer',
              referenceType: 'answer',
              referenceId: answerId,
              description: 'Answer marked as best'
            });
            console.log('Awarded 25 karma for best answer to:', author.email);
          }
        } catch (karmaErr) {
          console.log('Karma award failed (non-critical):', karmaErr.message);
        }
      } else {
        console.log('Could not find answer author for karma award. userId:', answererUserId, 'email:', answererEmail);
      }
      
      // Send notification to answerer (use email even if no user ID)
      const notifUserId = author?.id || answererUserId;
      const notifEmail = author?.email || answererEmail;
      
      if (notifEmail) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            user_id: notifUserId || '',
            user_email: notifEmail,
            type: 'best_answer',
            title: '🏆 Your answer was marked as Best Answer! (+25 karma)',
            message: `${user.full_name || 'The question asker'} marked your answer as the best answer to their question.`,
            link: `QuestionDetail?id=${questionId}`,
            is_read: false
          });
          
          // Also send email notification
          try {
            const authorFirstName = author?.full_name?.split(' ')[0] || 'there';
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: notifEmail,
              subject: '🏆 Your answer was marked as Best Answer! - College Fast Forward',
              body: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                      <h1 style="margin: 0; font-size: 24px;">🏆 Best Answer!</h1>
                    </div>
                    <p style="font-size: 16px;">Hi ${authorFirstName},</p>
                    <p style="font-size: 16px;">${user.full_name || 'The question asker'} marked your answer as the <strong>Best Answer</strong> to their question! You earned <strong>+25 karma points</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="https://www.collegefastforward.com/#QuestionDetail?id=${questionId}" style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">View Question →</a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">Thank you for being an amazing Gator helper! 🐊</p>
                  </div>
                </div>
              `,
              from_name: 'College Fast Forward'
            });
            console.log('Best answer email sent to:', notifEmail);
          } catch (emailErr) {
            console.log('Best answer email failed (non-critical):', emailErr.message);
          }
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
        }
      }
    }

    // Award student karma for thanking/marking best answer (+5 pts)
    try {
      const isGator = user.persona === 'gator' || user.roles?.includes('gator');
      if (isGator) {
        await base44.functions.invoke('awardStudentKarma', {
          userId: user.id,
          userEmail: user.email,
          actionType: 'thanked_answer',
          referenceId: answerId,
          description: 'Marked an answer as best/helpful'
        });
        console.log('Awarded +5 student karma for thanked_answer to:', user.email);
      }
    } catch (studentKarmaErr) {
      console.log('Student karma for thanked_answer failed (non-critical):', studentKarmaErr.message);
    }

    // Mark activation for the student who marked a best answer
    try {
      const studentPrompts = await base44.asServiceRole.entities.ActivationPrompt.filter({
        user_id: user.id,
        action_taken: false
      });
      if (studentPrompts.length > 0) {
        await base44.asServiceRole.entities.ActivationPrompt.update(studentPrompts[0].id, {
          action_taken: true,
          action_type: 'marked_best_answer',
          acted_at: new Date().toISOString(),
          status: 'acted'
        });
      }
    } catch (actErr) {
      console.log('Activation mark failed (non-critical):', actErr.message);
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
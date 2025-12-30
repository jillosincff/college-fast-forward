import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Submit an answer from a lightweight (email-verified) responder
 * 
 * - Rate limited: max 2 responses per minute per email
 * - First-time responders have posts flagged for review
 * - Links are stripped server-side as well
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { 
      questionId, 
      questionType, 
      answerText, 
      responderEmail, 
      responderFirstName,
      responderRole 
    } = await req.json();

    // Validation
    if (!questionId || !answerText || !responderEmail) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const normalizedEmail = responderEmail.trim().toLowerCase();
    const cleanedText = answerText.trim();

    if (cleanedText.length < 50) {
      return Response.json({
        success: false,
        error: 'Answer must be at least 50 characters'
      }, { status: 400 });
    }

    // Verify responder exists and is verified
    const responders = await base44.asServiceRole.entities.LightweightResponder.filter({
      email: normalizedEmail,
      is_active: true
    });

    if (!responders || responders.length === 0) {
      return Response.json({
        success: false,
        error: 'Please verify your email first'
      }, { status: 403 });
    }

    const responder = responders[0];

    // Rate limit: max 2 responses per minute
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const recentAnswers = await base44.asServiceRole.entities.Answer.filter({
      answerer_email: normalizedEmail,
      created_date: { $gte: oneMinuteAgo }
    });

    if (recentAnswers && recentAnswers.length >= 2) {
      return Response.json({
        success: false,
        error: 'You\'re posting too quickly. Please wait a moment.'
      }, { status: 429 });
    }

    // Strip any remaining links (double-check server side)
    const sanitizedText = cleanedText
      .replace(/https?:\/\/[^\s]+/gi, '[link removed]')
      .replace(/www\.[^\s]+/gi, '[link removed]');

    // Check if first-time responder (flag for review)
    const isFirstTimeResponder = (responder.response_count || 0) === 0;

    // Create the answer
    const answer = await base44.asServiceRole.entities.Answer.create({
      question_id: questionId,
      question_type: questionType || 'HelpRequest',
      answer_text: sanitizedText,
      answerer_email: normalizedEmail,
      answerer_name: responderFirstName,
      answerer_role: responderRole || 'other',
      is_lightweight_responder: true,
      lightweight_responder_id: responder.id,
      is_flagged_for_review: isFirstTimeResponder,
      upvote_count: 0,
      is_best_answer: false
    });

    // Update responder stats
    await base44.asServiceRole.entities.LightweightResponder.update(responder.id, {
      response_count: (responder.response_count || 0) + 1
    });

    // Update question answer count
    try {
      if (questionType === 'HelpRequest') {
        const questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
        if (questions && questions.length > 0) {
          await base44.asServiceRole.entities.HelpRequest.update(questionId, {
            answer_count: (questions[0].answer_count || 0) + 1
          });
        }
      } else {
        const questions = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
        if (questions && questions.length > 0) {
          await base44.asServiceRole.entities.JobRequest.update(questionId, {
            answer_count: (questions[0].answer_count || 0) + 1
          });
        }
      }
    } catch (updateErr) {
      console.warn('Failed to update question answer count:', updateErr);
      // Non-fatal - continue
    }

    console.log('Lightweight answer submitted:', {
      answerId: answer.id,
      questionId,
      responderEmail: normalizedEmail,
      isFirstTime: isFirstTimeResponder
    });

    return Response.json({
      success: true,
      answer: {
        ...answer,
        answerer_name: responderFirstName,
        answerer_role: responderRole
      }
    });

  } catch (error) {
    console.error('submitLightweightAnswer error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
});
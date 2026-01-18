import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple token decoding
function decodeToken(token) {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token, questionId, answerText, fullName, email, jobTitle, company } = await req.json();

    // Validate required fields
    if (!token || !questionId || !answerText || !fullName || !email || !jobTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (answerText.trim().length < 50) {
      return Response.json({ error: 'Answer must be at least 50 characters' }, { status: 400 });
    }

    // Validate token
    const payload = decodeToken(token);
    if (!payload || (payload.exp && Date.now() > payload.exp)) {
      return Response.json({ error: 'Invalid or expired link' }, { status: 400 });
    }

    // Verify question ID matches token
    if (payload.q !== questionId) {
      return Response.json({ error: 'Invalid question' }, { status: 400 });
    }

    // Get the question
    const questions = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
    if (!questions || questions.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }
    const question = questions[0];

    // Check if email already exists as a user
    let existingUsers = [];
    try {
      existingUsers = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
    } catch (e) {
      console.log('Could not check existing users:', e);
    }

    let userId = null;
    let isNewUser = true;

    if (existingUsers && existingUsers.length > 0) {
      // User already exists - just use their ID
      userId = existingUsers[0].id;
      isNewUser = false;
    } else {
      // Create a lightweight responder record (they can convert to full user later)
      try {
        const responder = await base44.asServiceRole.entities.LightweightResponder.create({
          email: email.toLowerCase(),
          first_name: fullName.split(' ')[0],
          role: 'parent', // Assume parent since they were referred by a parent
          created_via: 'referral',
          source_question_id: questionId,
          last_verified_at: new Date().toISOString(),
          verification_count: 1,
          response_count: 1,
          is_active: true
        });
        userId = responder.id;
      } catch (e) {
        console.log('Could not create lightweight responder:', e);
      }
    }

    // Create the answer
    const answer = await base44.asServiceRole.entities.Answer.create({
      question_id: questionId,
      question_type: 'JobRequest',
      answerer_email: email.toLowerCase(),
      answerer_name: fullName,
      answerer_title: jobTitle,
      answerer_company: company,
      answerer_persona: 'parent',
      answer_text: answerText.trim(),
      upvote_count: 0,
      is_best_answer: false,
      is_lightweight_responder: isNewUser,
      lightweight_responder_id: isNewUser ? userId : undefined
    });

    // Update question answer count
    await base44.asServiceRole.entities.JobRequest.update(questionId, {
      answer_count: (question.answer_count || 0) + 1
    });

    // Update referral record
    try {
      const referrals = await base44.asServiceRole.entities.Referral.filter({ 
        referral_token: token 
      });

      if (referrals && referrals.length > 0) {
        await base44.asServiceRole.entities.Referral.update(referrals[0].id, {
          status: 'answered',
          answered_at: new Date().toISOString(),
          referred_user_id: userId
        });
      }
    } catch (e) {
      console.log('Could not update referral record:', e);
    }

    // Parse student name for email
    let studentFirstName = 'A student';
    if (question.poster_name) {
      const parts = question.poster_name.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        studentFirstName = parts[1].split(' ')[0] || parts[1];
      } else {
        studentFirstName = question.poster_name.split(' ')[0];
      }
    }

    // Send notification to student
    try {
      const studentEmail = question.poster_email || question.created_by;
      if (studentEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: studentEmail,
          subject: `${fullName} answered your question!`,
          body: `
Hi ${studentFirstName}!

Great news - ${fullName} (${jobTitle}${company ? ` at ${company}` : ''}) just answered your question on College Fast Forward.

YOUR QUESTION:
"${question.description?.substring(0, 200) || question.title}${question.description?.length > 200 ? '...' : ''}"

THEIR ANSWER:
"${answerText.substring(0, 500)}${answerText.length > 500 ? '...' : ''}"

Log in to see the full response and say thanks:
https://getgatorshired.com/#QuestionDetail?id=${questionId}

Go Gators! 🐊

- The College Fast Forward Team
          `.trim(),
          from_name: 'College Fast Forward'
        });
      }
    } catch (e) {
      console.log('Could not send student notification:', e);
    }

    // Send welcome email to new responder with profile setup link
    if (isNewUser) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'Thank you for helping a UF student!',
          body: `
Hi ${fullName.split(' ')[0]}!

Thank you for answering ${studentFirstName}'s question on College Fast Forward. Your advice is on its way to them!

Want to help more students? Create your full profile to get matched with students who need your expertise:

https://getgatorshired.com/#GatorAuth

About College Fast Forward:
We're a community of UF parents, alumni, and professionals helping Gators launch their careers. Every bit of advice, referral, and introduction makes a difference.

Thank you for paying it forward!

- The College Fast Forward Team
          `.trim(),
          from_name: 'College Fast Forward'
        });
      } catch (e) {
        console.log('Could not send welcome email:', e);
      }
    }

    // Track analytics
    try {
      await base44.analytics.track({
        eventName: 'referral_answer_submitted',
        properties: {
          question_id: questionId,
          referrer_id: payload.r,
          is_new_user: isNewUser
        }
      });
    } catch (e) {
      console.log('Analytics tracking failed:', e);
    }

    return Response.json({ 
      success: true,
      answerId: answer.id,
      isNewUser
    });

  } catch (error) {
    console.error('Error submitting referral answer:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
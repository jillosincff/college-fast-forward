import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple token encoding (in production, use proper JWT)
function encodeToken(payload) {
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, friendName, friendEmail, personalNote, referrerName, referrerEmail } = await req.json();

    if (!questionId || !friendName || !friendEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the question details
    const questions = await base44.entities.JobRequest.filter({ id: questionId });
    if (!questions || questions.length === 0) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }

    const question = questions[0];

    // Create referral token
    const tokenPayload = {
      q: questionId,
      r: user.id,
      rn: referrerName || user.full_name,
      re: referrerEmail || user.email,
      fe: friendEmail,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    const token = encodeToken(tokenPayload);
    
    // Generate referral link
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://getgatorshired.com';
    const referralLink = `${baseUrl}/#ReferralAnswer?token=${token}`;

    // Create referral record
    await base44.asServiceRole.entities.Referral.create({
      referrer_id: user.id,
      referrer_email: referrerEmail || user.email,
      referrer_name: referrerName || user.full_name,
      referred_email: friendEmail,
      referred_name: friendName,
      question_id: questionId,
      question_title: question.title || question.role,
      referral_token: token,
      personal_note: personalNote,
      status: 'pending',
      expires_at: new Date(tokenPayload.exp).toISOString()
    });

    // Parse student name
    let studentFirstName = 'A student';
    if (question.poster_name) {
      const parts = question.poster_name.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        studentFirstName = parts[1].split(' ')[0] || parts[1];
      } else {
        studentFirstName = question.poster_name.split(' ')[0];
      }
    }

    // Send email to referred person
    const emailSubject = `${referrerName || user.full_name} thinks you can help a UF student`;
    const emailBody = `
Hi ${friendName},

${referrerName || user.full_name} thought you'd be the perfect person to help a University of Florida student.

${personalNote ? `They said: "${personalNote}"\n\n` : ''}

THE QUESTION:
${studentFirstName} (${question.student_major || 'UF Student'}${question.student_year ? ` '${String(question.student_year).slice(-2)}` : ''}) asked:

"${question.description || question.title}"

---

You can answer directly without creating an account:
${referralLink}

It only takes a few minutes, and your advice could make a real difference in ${studentFirstName}'s career.

Thank you for paying it forward!

- The College Fast Forward Team

---
College Fast Forward connects UF students with parents, alumni, and professionals who can help them succeed.
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: friendEmail,
      subject: emailSubject,
      body: emailBody,
      from_name: 'College Fast Forward'
    });

    // Track analytics
    try {
      await base44.analytics.track({
        eventName: 'referral_link_created',
        properties: {
          referrer_id: user.id,
          question_id: questionId
        }
      });
    } catch (e) {
      console.log('Analytics tracking failed:', e);
    }

    return Response.json({ 
      success: true, 
      referralLink,
      message: `Referral sent to ${friendName}`
    });

  } catch (error) {
    console.error('Error creating referral:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
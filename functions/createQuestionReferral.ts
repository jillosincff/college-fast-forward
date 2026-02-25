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

    const body = await req.json();
    const questionId = body.questionId;
    const inviteeEmail = (body.inviteeEmail || body.friendEmail || '').toLowerCase().trim();
    const personalNote = body.personalNote || '';
    const referrerName = body.referrerName || user.full_name;
    const referrerEmail = body.referrerEmail || user.email;

    if (!questionId || !inviteeEmail) {
      return Response.json({ error: 'Missing required fields: questionId and inviteeEmail' }, { status: 400 });
    }

    // Get the question details - try JobRequest first, then HelpRequest
    let question = null;
    try {
      const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
      if (jobRequests && jobRequests.length > 0) question = jobRequests[0];
    } catch (e) {
      console.log('Not found in JobRequest, trying HelpRequest');
    }
    
    if (!question) {
      try {
        const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
        if (helpRequests && helpRequests.length > 0) question = helpRequests[0];
      } catch (e) {
        console.log('Not found in HelpRequest either');
      }
    }
    
    if (!question) {
      return Response.json({ error: 'Question not found' }, { status: 404 });
    }

    // Always treat as external invite
    const existingUser = null;
    console.log('Processing referral for:', inviteeEmail, '- treating as external invite');

    const isInternalTag = false;
    const friendName = inviteeEmail.split('@')[0] || 'there';

    // Create referral token
    const tokenPayload = {
      q: questionId,
      r: user.id,
      rn: referrerName || user.full_name,
      re: referrerEmail || user.email,
      fe: inviteeEmail,
      exp: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };

    const token = encodeToken(tokenPayload);
    
    const baseUrl = Deno.env.get('APP_BASE_URL') || 'https://getgatorshired.com';
    const referralLink = `${baseUrl}/#ReferralAnswer?token=${token}`;

    // Create referral record
    const referralData = {
      referrer_id: user.id,
      referrer_email: referrerEmail,
      referrer_name: referrerName,
      referred_email: inviteeEmail,
      referred_name: friendName,
      question_id: questionId,
      question_title: question.title || question.role,
      referral_token: token,
      personal_note: personalNote,
      status: 'pending',
      expires_at: new Date(tokenPayload.exp).toISOString()
    };
    
    await base44.asServiceRole.entities.Referral.create(referralData);

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

    // Build email
    const referrerFirstName = referrerName?.split(' ')[0] || 'Someone';
    const emailSubject = `${referrerFirstName} thinks you can help a student`;
    
    const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <p>Hi,</p>
  
  <p><strong>${referrerName}</strong> thinks you might be able to help a student with a career question.</p>
  
  <div style="background: #f8f9fa; border-left: 4px solid #0021A5; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
    <p style="font-size: 12px; color: #666; margin: 0 0 8px 0; text-transform: uppercase;">
      ${studentFirstName}${question.student_major ? ` • ${question.student_major}` : ''}
    </p>
    <p style="font-size: 16px; color: #1a1a1a; margin: 0; line-height: 1.5;">
      "${(question.description || question.title || '').substring(0, 200)}${(question.description || '').length > 200 ? '...' : ''}"
    </p>
    ${question.help_types?.length > 0 ? `
    <p style="font-size: 13px; color: #666; margin: 12px 0 0 0;">
      Looking for help with: ${question.help_types.map(t => t.replace(/_/g, ' ')).join(', ')}
    </p>
    ` : ''}
  </div>
  
  <div style="text-align: center; margin: 32px 0;">
    <a href="${referralLink}" style="display: inline-block; background: #0021A5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Help This Student →
    </a>
  </div>
  
  <p style="font-size: 14px; color: #666;">
    No account needed—just click and share your advice.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  
  <p style="font-size: 13px; color: #999;">
    College Fast Forward connects students with professionals who can help with career questions.<br>
    Takes 2-3 minutes. Could change their career.
  </p>
</div>
    `.trim();

    // CRITICAL: Use SendGrid directly for external emails
    // Core.SendEmail only works for registered app users
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendGridApiKey) {
      console.error('SENDGRID_API_KEY not set');
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    console.log('Sending email via SendGrid to:', inviteeEmail);
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: inviteeEmail }] }],
        from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
        subject: emailSubject,
        content: [{ type: 'text/html', value: emailBody }]
      })
    });

    if (!sgResponse.ok) {
      const sgError = await sgResponse.text();
      console.error('SendGrid error:', sgResponse.status, sgError);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }
    console.log('Email sent successfully via SendGrid to:', inviteeEmail);

    // Award karma for giving a referral
    try {
      const isParentOrAlumni = user.persona === 'parent' || user.persona === 'alumni' || 
                               user.roles?.includes('parent') || user.roles?.includes('alumni');
      if (isParentOrAlumni) {
        await base44.functions.invoke('awardKarma', {
          parentUserId: user.id,
          parentEmail: user.email,
          parentName: user.full_name,
          actionType: 'referral_given',
          referenceType: 'referral',
          referenceId: questionId,
          description: `Referred ${inviteeEmail} to help a student`
        });
        console.log('Referral karma awarded');
      }
    } catch (karmaErr) {
      console.log('Referral karma failed (non-critical):', karmaErr.message);
    }

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
      type: 'invited',
      userName: null,
      referralLink: referralLink,
      message: 'Invitation sent to your contact'
    });

  } catch (error) {
    console.error('Error creating referral:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { mentionedNames, questionId, questionTitle, answerPreview, taggerName } = await req.json();

    if (!mentionedNames || mentionedNames.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    console.log('Processing mentions:', mentionedNames, 'for question:', questionId);

    // Fetch all users to match names (using service role)
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    let notifiedCount = 0;

    for (const name of mentionedNames) {
      const nameLower = name.toLowerCase().trim();

      // Match by full_name (case-insensitive)
      const matchedUser = allUsers.find(u => {
        const fullName = (u.full_name || '').toLowerCase().trim();
        return fullName === nameLower;
      });

      if (!matchedUser) {
        console.log('No user found for mention:', name);
        continue;
      }

      // Don't notify yourself
      if (matchedUser.email === user.email) {
        console.log('Skipping self-mention:', matchedUser.email);
        continue;
      }

      console.log('Notifying:', matchedUser.email, 'for mention by', user.email);

      // Create in-app notification
      try {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: matchedUser.email,
          type: 'system',
          title: `${taggerName} mentioned you`,
          message: `${taggerName} tagged you in an answer: "${answerPreview?.slice(0, 100)}${answerPreview?.length > 100 ? '...' : ''}"`,
          action_url: `QuestionDetail?id=${questionId}`,
          action_label: 'View Question',
          priority: 'normal',
          is_read: false,
          email_sent: false,
          metadata: {
            mention_type: 'answer',
            tagger_email: user.email,
            tagger_name: taggerName,
            question_id: questionId
          }
        });
      } catch (notifErr) {
        console.error('Failed to create notification for', matchedUser.email, notifErr.message);
      }

      // Send email nudge via SendGrid
      try {
        const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
        if (sendGridApiKey) {
          const questionUrl = `https://collegefastforward.com/#QuestionDetail?id=${questionId}`;
          const emailBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0021A5, #FA4616); padding: 24px; border-radius: 12px 12px 0 0;">
                <h2 style="color: white; margin: 0; font-size: 20px;">You were mentioned! 🐊</h2>
              </div>
              <div style="background: white; padding: 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  <strong>${taggerName}</strong> tagged you in an answer to "<strong>${questionTitle || 'a question'}</strong>" — they think you can help!
                </p>
                ${answerPreview ? `<div style="background: #F9FAFB; border-left: 3px solid #0021A5; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                  <p style="color: #6B7280; font-size: 14px; margin: 0; font-style: italic;">"${answerPreview.slice(0, 200)}${answerPreview.length > 200 ? '...' : ''}"</p>
                </div>` : ''}
                <a href="${questionUrl}" style="display: inline-block; background: #0021A5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 16px;">
                  View & Respond →
                </a>
                <p style="color: #9CA3AF; font-size: 13px; margin-top: 24px;">
                  Someone in the Gator network thinks you have great advice to share. Your experience matters!
                </p>
              </div>
            </div>
          `;

          const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sendGridApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{ to: [{ email: matchedUser.email }] }],
              from: { email: 'hello@collegefastforward.com', name: 'College Fast Forward' },
              subject: `🐊 ${taggerName} mentioned you — a student needs your help!`,
              content: [{ type: 'text/html', value: emailBody }]
            })
          });

          if (sgResponse.ok) {
            console.log('Email sent to:', matchedUser.email);
          } else {
            console.error('SendGrid error:', sgResponse.status, await sgResponse.text());
          }
        }
      } catch (emailErr) {
        console.error('Email send failed for', matchedUser.email, emailErr.message);
      }

      notifiedCount++;
    }

    return Response.json({ success: true, notified: notifiedCount });

  } catch (error) {
    console.error('notifyTaggedUsers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
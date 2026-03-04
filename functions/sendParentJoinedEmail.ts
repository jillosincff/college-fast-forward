import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://www.collegefastforward.com";
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { studentEmail, studentName, parentName, parentEmail } = await req.json();

    if (!studentEmail || !parentName) {
      return Response.json({ error: 'studentEmail and parentName required' }, { status: 400 });
    }

    // Anti-spam + preferences via shared helper
    const canSendResult = await base44.functions.invoke('emailHelpers', {
      action: 'canSendEmail', userEmail: studentEmail, emailType: 'parent_joined'
    });
    if (!canSendResult.data?.canSend) {
      return Response.json({ success: true, skipped: true, reason: canSendResult.data?.reason || 'Rate limited' });
    }

    const studentFirst = (studentName || 'there').split(' ')[0];
    // Build display name: "FirstName L." format
    const parentParts = (parentName || 'Your parent').split(' ');
    const parentDisplayName = parentParts.length > 1
      ? `${parentParts[0]} ${parentParts[parentParts.length - 1][0]}.`
      : parentParts[0];

    const dashboardUrl = `${APP_BASE_URL}/#Dashboard?utm_source=parent_joined`;

    const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<span style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${parentDisplayName} just joined CFF — you earned +50 karma!</span>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; background: #f3f4f6; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); padding: 28px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="${LOGO_URL}" alt="College Fast Forward" style="height: 60px; margin-bottom: 8px;" />
    </div>
    <div style="background: #fff; padding: 32px 24px; border: 1px solid #e5e7eb; border-top: none;">
      <p style="font-size: 18px; color: #111827; margin: 0 0 16px 0;">Hi ${studentFirst},</p>
      <p style="font-size: 16px;">Great news — <strong>${parentDisplayName}</strong> just joined College Fast Forward!</p>
      <p style="font-size: 16px;">Here's what this means for you:</p>

      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 16px 0 24px 0;">
        <tr>
          <td style="padding: 10px 0; font-size: 15px; color: #374151;">✅ Their Karma boosts your visibility in the network</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 15px; color: #374151;">✅ You're now connected as a family</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; font-size: 15px; color: #374151;">✅ You earned <strong>+50 karma</strong> for inviting them</td>
        </tr>
      </table>

      <div style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">See Your Dashboard →</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin: 16px 0 0 0;">— The CFF Team</p>
    </div>
    <div style="background: #f9fafb; padding: 20px 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">College Fast Forward</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 4px 0 0 0;">8731 Lewis River Road, Delray Beach, FL 33446</p>
      <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;"><a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Unsubscribe</a> · <a href="${APP_BASE_URL}/#ProfileEdit" style="color: #9ca3af;">Email Preferences</a></p>
    </div>
  </div>
</body></html>`;

    const subject = 'Your parent just joined CFF! 🎉';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: studentEmail,
      subject,
      body: emailHtml,
      from_name: 'College Fast Forward'
    });

    // Award +50 karma to student for parent invite
    try {
      // Look up student user
      const students = await base44.asServiceRole.entities.User.filter({ email: studentEmail }, undefined, 1);
      const student = students?.[0];
      if (student) {
        // Award student karma
        const studentKarmaRecords = await base44.asServiceRole.entities.StudentKarma.filter({ user_email: studentEmail }, undefined, 1);
        if (studentKarmaRecords.length > 0) {
          const sk = studentKarmaRecords[0];
          await base44.asServiceRole.entities.StudentKarma.update(sk.id, {
            total_karma: (sk.total_karma || 0) + 50,
            this_month_karma: (sk.this_month_karma || 0) + 50,
            last_karma_earned_at: new Date().toISOString()
          });
        } else {
          await base44.asServiceRole.entities.StudentKarma.create({
            user_id: student.id,
            user_email: studentEmail,
            total_karma: 50,
            this_month_karma: 50,
            last_karma_earned_at: new Date().toISOString()
          });
        }

        // Log karma transaction
        await base44.asServiceRole.entities.KarmaTransaction.create({
          family_group_id: `student_${student.id}`,
          parent_user_id: student.id,
          parent_email: studentEmail,
          parent_name: studentName || student.full_name || '',
          points: 50,
          action_type: 'invite_parent_joined',
          description: `+50 karma: ${parentDisplayName} joined via your invite`
        });
      }
    } catch (e) { console.log('Karma award failed (non-critical):', e.message); }

    try {
      await base44.asServiceRole.entities.EmailLog.create({
        user_email: studentEmail,
        email_type: 'parent_joined',
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: { parentName, parentEmail }
      });
    } catch (e) { console.log('Log failed:', e.message); }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Parent joined email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
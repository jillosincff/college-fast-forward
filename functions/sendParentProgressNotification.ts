import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { parent_email, parent_name, student_name, notification_type, metadata } = await req.json();

    if (!parent_email || !notification_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parentFirstName = parent_name?.split(' ')[0] || 'there';
    const studentFirstName = student_name?.split(' ')[0] || 'your student';
    let subject, body;

    switch (notification_type) {
      case 'first_login':
        subject = `${studentFirstName} just logged into FastIQ ✓`;
        body = `Hi ${parentFirstName},

${studentFirstName} just logged into FastIQ for the first time.
They're getting started. 🎉

— The College Fast Forward Team`;
        break;

      case 'career_plan_created':
        const companyCount = metadata?.company_count || 0;
        const alumniCount = metadata?.alumni_count || 0;
        subject = `${studentFirstName} just built their career plan`;
        body = `Hi ${parentFirstName},

${studentFirstName} just built their career plan.
They identified ${companyCount} target companies and ${alumniCount} alumni to contact.

Things are moving.

— The College Fast Forward Team`;
        break;

      case 'first_outreach':
        subject = `${studentFirstName} just sent their first outreach`;
        body = `Hi ${parentFirstName},

${studentFirstName} just sent their first outreach message through FastIQ.

One warm introduction beats 100 cold applications.
They're doing it right.

— The College Fast Forward Team`;
        break;

      case 'first_response':
        subject = `Big news — ${studentFirstName} got a response 🎉`;
        body = `Hi ${parentFirstName},

${studentFirstName} just received a response from an alumni contact.

This is exactly what College Fast Forward is built for.

— The College Fast Forward Team`;
        break;

      case 'network_intro':
        const companyName = metadata?.company_name || 'a top company';
        subject = `The network just opened a door for ${studentFirstName}`;
        body = `Hi ${parentFirstName},

A parent in the College Fast Forward network just made an introduction for ${studentFirstName} at ${companyName}.

The network is working for your family.

— The College Fast Forward Team`;
        break;

      case '30_day_check_in':
        subject = `${studentFirstName} hasn't started yet — here's what you can do`;
        body = `Hi ${parentFirstName},

${studentFirstName} hasn't logged into FastIQ yet. We want to be transparent with you.

Students who start FastIQ in their first month are 3x more likely to land interviews than those who wait.

We've sent ${studentFirstName} a direct message today encouraging them to log in.

If they still haven't started after this week, a direct conversation about their job search timeline might be all it takes.

We're here to help. So are you.

— The College Fast Forward Team`;
        break;

      default:
        return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: parent_email,
      subject,
      body,
      from_name: 'College Fast Forward',
    });

    // Log the email
    await base44.asServiceRole.entities.EmailLog.create({
      user_email: parent_email,
      persona: 'parent',
      email_type: 'weekly_parent_digest',
      subject,
      content_preview: body.substring(0, 100),
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: { notification_type, student_name },
    });

    return Response.json({ success: true, email_sent: parent_email });
  } catch (error) {
    console.error('sendParentProgressNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { student_email, student_name, nudge_type } = await req.json();

    if (!student_email || !nudge_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = student_name?.split(' ')[0] || 'there';
    let subject, body;

    if (nudge_type === '14_day_dormant') {
      subject = `Hey ${firstName} — your career plan is still waiting`;
      body = `Hey ${firstName},

Your FastIQ career plan has been ready for 14 days.
You haven't logged in yet — and that's okay.
But here's the thing: students who start FastIQ in their first month are 3x more likely to land interviews than those who wait.

Everything is set up. Your alumni are waiting to be found.
It takes 5 minutes to get your full career plan.

<a href="${Deno.env.get('APP_BASE_URL')}/#FastIQ" style="color: #E85D20; text-decoration: none; font-weight: 600;">Start My Job Search →</a>

— The College Fast Forward Team`;
    } else if (nudge_type === '30_day_dormant') {
      subject = `Honest question, ${firstName}`;
      body = `Hey ${firstName},

Is job searching on your radar yet?

No pressure. But when you're ready, everything is set up and waiting.
FastIQ works best when you do.

<a href="${Deno.env.get('APP_BASE_URL')}/#FastIQ" style="color: #E85D20; text-decoration: none; font-weight: 600;">I'm Ready →</a>

— The College Fast Forward Team`;
    } else {
      return Response.json({ error: 'Invalid nudge type' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: student_email,
      subject,
      body,
      from_name: 'College Fast Forward',
    });

    // Log the email
    await base44.asServiceRole.entities.EmailLog.create({
      user_email: student_email,
      persona: 'student',
      email_type: nudge_type === '14_day_dormant' ? 'reengagement_7d' : 'reengagement_21d',
      subject,
      content_preview: body.substring(0, 100),
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    return Response.json({ success: true, email_sent: student_email });
  } catch (error) {
    console.error('sendFastIQStudentNudge error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
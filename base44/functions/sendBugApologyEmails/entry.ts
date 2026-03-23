import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const APP_URL = 'https://app.base44.com/apps/684474c5723dc90efce23588';

// Students who had answers posted but never got notified
const STUDENTS_WITH_ANSWERS = [
  {
    email: 'e.witharane@ufl.edu',
    firstName: 'Evyn',
    questionTitle: 'Looking for summer internships in chemical engineering'
  },
  {
    email: 'g.rotbart@ufl.edu',
    firstName: 'Grant',
    questionTitle: 'Looking for summer internships in product management and data science'
  },
  {
    email: 'itraykov@ufl.edu',
    firstName: 'Ivan',
    questionTitle: 'Looking for a 2026 summer internship (ISE major)'
  },
  {
    email: 'patel.ashna@ufl.edu',
    firstName: 'Ashna',
    questionTitle: 'Seeking internship opportunities as a business management student'
  },
  {
    email: 'j.cariglia@ufl.edu',
    firstName: 'Jordan',
    questionTitle: 'Looking for shadowing, internship, or work opportunities in pharmacy'
  },
  {
    email: 'tmoreman1@ufl.edu',
    firstName: 'Trey',
    questionTitle: 'Looking for a sports analytics internship'
  },
  {
    email: 'amandarossello@ufl.edu',
    firstName: 'Amanda',
    questionTitle: 'Looking for a sport management internship'
  },
  {
    email: 'lindseyosinoff@ufl.edu',
    firstName: 'Lindsey',
    questionTitle: 'Interested in tech career paths'
  },
  {
    email: 'thering@ufl.edu',
    firstName: 'Tyler',
    questionTitle: "Looking for internships (computer science)"
  },
  {
    email: 'alyssasawmiller@ufl.edu',
    firstName: 'Alyssa',
    questionTitle: 'Looking for a marketing internship and career advice'
  },
  {
    email: 'maxwell.dixon@ufl.edu',
    firstName: 'Maxwell',
    questionTitle: 'Looking for mechanical engineering internship/co-op opportunities'
  },
  {
    email: 'andrew.rintoul@ufl.edu',
    firstName: 'Andrew',
    questionTitle: 'Looking for a summer finance internship'
  }
];

function buildEmailHTML(firstName, questionTitle) {
  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1a1a1a; line-height: 1.6;">
  <div style="text-align: center; margin-bottom: 24px;">
    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" alt="College Fast Forward" style="height: 60px; width: auto;" />
  </div>
  
  <p>Hi ${firstName},</p>

  <p>I owe you an apology. You posted a question on College Fast Forward, and a parent answered it — but you never got notified.</p>

  <p>We found a bug in our notification system that meant students weren't getting emails when parents responded. We've fixed it as of today.</p>

  <p>Your question <strong>"${questionTitle}"</strong> has a response waiting for you right now.</p>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${APP_URL}" style="display: inline-block; background: linear-gradient(135deg, #0021A5, #0033CC); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
      👉 Log in to see your answer
    </a>
  </div>

  <p>Going forward, you'll get an email the moment anyone responds to your questions. And if the answer is helpful, please reply or mark it as helpful — it means a lot to the parents who take time to help.</p>

  <p>Sorry about the silence. It wasn't you — it was us.</p>

  <p style="margin-top: 32px;">
    — Jill<br/>
    <span style="color: #666;">Founder, College Fast Forward</span>
  </p>
</div>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { mode } = await req.json().catch(() => ({ mode: 'preview' }));

    // mode = 'preview' -> send all emails to josinoff@gmail.com for review
    // mode = 'send' -> send to actual students

    const results = [];

    for (const student of STUDENTS_WITH_ANSWERS) {
      const recipientEmail = mode === 'send' ? student.email : 'josinoff@gmail.com';
      const subject = mode === 'send'
        ? `${student.firstName} — you have an answer waiting on CFF`
        : `[PREVIEW for ${student.email}] ${student.firstName} — you have an answer waiting on CFF`;

      const htmlBody = buildEmailHTML(student.firstName, student.questionTitle);

      try {
        await base44.integrations.Core.SendEmail({
          from_name: 'Jill Osinoff',
          to: recipientEmail,
          subject: subject,
          body: htmlBody
        });

        results.push({ email: student.email, status: 'sent', sentTo: recipientEmail });
        console.log(`✅ Email ${mode === 'send' ? 'sent' : 'previewed'}: ${student.firstName} (${student.email}) -> ${recipientEmail}`);
      } catch (err) {
        results.push({ email: student.email, status: 'failed', error: err.message });
        console.error(`❌ Failed for ${student.email}:`, err.message);
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return Response.json({
      success: true,
      mode,
      total: STUDENTS_WITH_ANSWERS.length,
      sent,
      failed,
      results
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
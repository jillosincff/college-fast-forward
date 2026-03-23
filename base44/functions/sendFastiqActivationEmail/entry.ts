import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { student_email, student_name, parent_name } = await req.json();
    if (!student_email) return Response.json({ error: 'student_email required' }, { status: 400 });

    const firstName = student_name || 'there';
    const parentFirst = parent_name || 'Your parent';

    const body = `
<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0A0A0A;color:#fff;">
  <h1 style="font-size:26px;font-weight:700;margin-bottom:20px;color:#fff;">Your parent just turbocharged your job search 🚀</h1>
  
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:24px;">Hey ${firstName},</p>
  
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:24px;">${parentFirst} just activated FastIQ for you.</p>
  
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:8px;">You now have access to:</p>
  
  <ul style="font-size:15px;line-height:1.8;color:#ccc;margin-bottom:24px;padding-left:0;list-style:none;">
    <li>✓ Full alumni names and contacts at your target companies</li>
    <li>✓ Personalized outreach messages ready to send</li>
    <li>✓ A daily action plan built around your goals</li>
    <li>✓ Resume tailoring, LinkedIn review, and interview prep</li>
  </ul>
  
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:8px;">It takes 5 minutes to get your full career plan.</p>
  <p style="font-size:16px;line-height:1.65;color:#fff;font-weight:600;margin-bottom:28px;">Your competition doesn't have this. You do.</p>
  
  <a href="https://www.collegefastforward.com/#Dashboard" style="display:inline-block;background:#E85D20;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:600;font-size:16px;">Start My Job Search →</a>
  
  <p style="font-size:13px;color:#666;margin-top:32px;">— The College Fast Forward Team</p>
</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: student_email,
      subject: `Your parent just turbocharged your job search 🚀`,
      body,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendFastiqActivationEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
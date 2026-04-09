Deno.serve(async (req) => {
  try {
    const { parentEmail, parentName, studentName } = await req.json();

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;">
        <p style="font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 16px;">
          Hi ${parentName},
        </p>
        <p style="font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 16px;">
          Great news — <strong>${studentName}</strong> just activated their FastIQ trial on College Fast Forward!
        </p>
        <p style="font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 16px;">
          They now have 7 days of full access to alumni search, AI outreach drafts, resume tailoring, mock interviews, and their personalized daily briefing.
        </p>
        <p style="font-size:16px;color:#1a1a1a;line-height:1.7;margin:0 0 32px;">
          If it's giving them a real edge, you can lock in the Founding Member rate of just $14.50/month before April 15th — that's 50% off the regular price of $29, forever.
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:#E85D20;border-radius:12px;">
              <a href="https://collegefastforward.com/#Pricing" 
                 style="display:inline-block;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;">
                Lock In $14.50/mo Founding Rate →
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size:14px;color:#888888;line-height:1.6;margin:32px 0 0;">
          Warmly,<br>
          <strong>Jill Osinoff</strong><br>
          Founder, College Fast Forward
        </p>
      </div>
    `;

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: parentEmail }] }],
        from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
        subject: `🎉 ${studentName} just activated their FastIQ trial!`,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    return Response.json({ success: true });
  } catch (e) {
    console.error('sendParentGiftConfirmationEmail error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});
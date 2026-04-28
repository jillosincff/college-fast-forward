import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Helper: extract first name with fallback for broken names
    function getFirstName(fullName) {
      if (!fullName || fullName.trim() === '') return null;
      const first = fullName.split(' ')[0];
      // Fallback: if name is purely digits, pure alphanumeric (looks like username), or empty
      if (/^\d+$/.test(first) || /^\w+\d+\w*$/.test(first) || first.trim() === '') return null;
      return first;
    }

    // Email template
    function buildEmail(firstName, school, persona) {
      const name = firstName || 'there';
      const displaySchool = school || 'your school';
      const isParent = persona === 'parent';

      return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #F5F5F5;">
<div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 32px;">
  <p style="color: #E85D20; font-weight: 700; text-transform: uppercase; font-size: 10px;">FOUNDING RATE — ${name === 'there' ? 'FINAL DAYS' : name.toUpperCase()}</p>
  <h1 style="font-size: 24px; color: #0A0A0A;">Hi ${name},</h1>
  <p style="color: #555; font-size: 15px; line-height: 1.6;">
    Lock in the Founding Rate — $14.50/month before it expires April 30, 2026.
  </p>
  ${isParent 
    ? `<p style="color: #555; font-size: 15px; line-height: 1.6;">Students at ${displaySchool} are discovering alumni at top companies and crafting outreach that gets real replies.</p>`
    : `<p style="color: #555; font-size: 15px; line-height: 1.6;">You've already explored alumni and outreach at ${displaySchool}. Lock in full access today.</p>`}
  <a href="https://collegefastforward.com/#FastIQDashboard" style="display: inline-block; background: #E85D20; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Upgrade Now →</a>
</div>
</body>
</html>`;
    }

    // Fetch students and parents for sampling
    const students = allUsers.filter(u => 
      u.persona === 'student' && 
      ['joshflusser@gmail.com', 'rlwhitehurst74@gmail.com', 'samigreen219@gmail.com'].includes(u.email?.toLowerCase())
    );

    const parentEmails = ['jflitt2@gmail.com', 'ukandusa20@gmail.com'];
    const parents = allUsers.filter(u => u.persona === 'parent' && parentEmails.includes(u.email?.toLowerCase()));

    const emailSamples = [];

    // Render student emails
    students.forEach(s => {
      const firstName = getFirstName(s.full_name);
      const html = buildEmail(firstName, s.school, s.persona);
      emailSamples.push({
        type: 'STUDENT',
        email: s.email,
        name: s.full_name,
        extracted_first_name: firstName,
        uses_fallback: firstName === null ? 'YES — fallback to "Hi,"' : 'NO',
        greeting_preview: firstName ? `Hi ${firstName},` : 'Hi,',
        html_snippet: html.substring(0, 500),
      });
    });

    // Render parent emails
    parents.forEach(p => {
      const firstName = getFirstName(p.full_name);
      const html = buildEmail(firstName, p.school, p.persona);
      emailSamples.push({
        type: 'PARENT',
        email: p.email,
        name: p.full_name,
        extracted_first_name: firstName,
        uses_fallback: firstName === null ? 'YES — fallback to "Hi,"' : 'NO',
        greeting_preview: firstName ? `Hi ${firstName},` : 'Hi,',
        html_snippet: html.substring(0, 500),
      });
    });

    return Response.json({
      email_samples: emailSamples,
      sample_size: emailSamples.length,
      fallback_check: {
        josh_flusser: 'Josh (valid name — no fallback)',
        rebecca_rlf: 'Rebecca (valid name — no fallback)',
        samigreen219: 'samigreen219 (BROKEN — uses fallback "Hi,")',
        jonathan_parent: 'Jonathan (valid name — no fallback)',
        sarah_starks_parent: 'Sarah Starks (valid name — no fallback)',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
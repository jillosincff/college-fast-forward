import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_NAMES = {
  usc: 'University of South Carolina',
  osu: 'Ohio State',
  ucf: 'University of Central Florida',
  umich: 'University of Michigan',
  udel: 'University of Delaware',
  uga: 'University of Georgia',
  psu: 'Pennsylvania State',
  tulane: 'Tulane',
  umd: 'University of Maryland',
  fau: 'Florida Atlantic',
  fsu: 'Florida State',
  jmu: 'James Madison',
  miami: 'University of Miami',
  utexas: 'University of Texas',
  uky: 'University of Kentucky',
};

// Alumni CSV — 51 rows, Apple relay emails excluded at send time
const ALUMNI_CSV = [
  { email: 'mardochee.renaudin@gmail.com', full_name: 'Mardochee Renaudin', school: 'ucf' },
  { email: 'morganhurst29@gmail.com', full_name: 'morganhurst29', school: 'umich' },
  { email: 'bonnie.hurst@sbcglobal.net', full_name: 'bonnie.hurst', school: 'umich' },
  { email: 'jodi.leone@gmail.com', full_name: 'Jodi Leone', school: 'umich' },
  { email: 'brian.dickstein1@gmail.com', full_name: 'brian.dickstein1', school: 'umich' },
  { email: 'marni@llpaint.com', full_name: 'marni', school: 'umich' },
  { email: 'jenolarsch@gmail.com', full_name: 'Jen Olarsch', school: 'umich' },
  { email: 'zachary.zimmerman@cantor.com', full_name: 'zachary.zimmerman', school: 'umich' },
  { email: 'tkollinsmith@gmail.com', full_name: 'Tracy Smith', school: 'umich' },
  { email: 'charnasfamily5@gmail.com', full_name: 'charnasfamily5', school: 'umich' },
  { email: 'blain.aleah@gmail.com', full_name: 'Aleah Blain', school: 'ucf' },
  { email: 'bonniekatz38@aol.com', full_name: 'bonniekatz38', school: 'umich' },
  { email: 'mattlevin1111@gmail.com', full_name: 'Matt Levin', school: 'umich' },
  { email: 'tjnaugh14@gmail.com', full_name: 'Tom Naughton', school: 'umich' },
  { email: 'eachance1@gmail.com', full_name: 'eachance1', school: 'ucf' },
  { email: 'amandabrown05@yahoo.com', full_name: 'amandabrown05', school: 'ucf' },
  { email: 'miguel.sanchezm2002@gmail.com', full_name: 'Miguel Sanchez', school: 'ucf' },
  { email: 'collegefastforward.untimely030@passfwd.com', full_name: 'collegefastforward.untimely030', school: 'ucf' },
  { email: 'woodamandaa@gmail.com', full_name: 'amanda wood', school: 'ucf' },
  { email: 'adamm132@aol.com', full_name: 'adamm132', school: 'fsu' },
  { email: 'lkbrien@yahoo.com', full_name: 'lkbrien', school: 'tulane' },
  { email: 'anthony.sagardia@gmail.com', full_name: 'Anthony Sagardia', school: 'ucf' },
  { email: 'maevemooney21@gmail.com', full_name: 'Maeve Mooney', school: 'osu' },
  { email: 'imazzotti@mac.com', full_name: 'Irma Mazzotti', school: 'ucf' },
  { email: 'melissaconnealy@gmail.com', full_name: 'Melissa Connealy', school: 'uga' },
  { email: 'lauren.pike2018@gmail.com', full_name: 'Lauren Pike', school: 'uga' },
  { email: 'juliannawalker15@gmail.com', full_name: 'Julianna Walker', school: 'ucf' },
  { email: 'mjacovsky22@gmail.com', full_name: 'Matt Jacovsky', school: 'osu' },
  { email: 'munster7@gmail.com', full_name: 'Paley Munn', school: 'tulane' },
  { email: 'brendanmattera@gmail.com', full_name: 'B', school: 'usc' },
  { email: 'heathermorris2579@gmail.com', full_name: 'Heather Morris', school: 'usc' },
  { email: 'stevengold90@gmail.com', full_name: 'Steven Goldberg', school: 'tulane' },
  { email: 'sydneymgriffith@gmail.com', full_name: 'Sydney Griffith', school: 'usc' },
  { email: 'taniahgerman@gmail.com', full_name: 'Taniah German', school: 'usc' },
  { email: 'sisireia@gmail.com', full_name: 'Sisireia Simmons', school: 'usc' },
  { email: 'chloeloftis123@gmail.com', full_name: 'Chloe', school: 'usc' },
  { email: 'thenley03@icloud.com', full_name: 'Taylor Henley', school: 'usc' },
  { email: 'dana.delavan@sumterschools.net', full_name: 'Dana DeLavan', school: 'usc' },
  { email: 'courtlandmthomas@gmail.com', full_name: 'Courtland Thomas', school: 'usc' },
  { email: 'tejones404@gmail.com', full_name: 'Thomas Jones', school: 'usc' },
  { email: 'lakeil20@comcast.net', full_name: 'Lisa Cartwright', school: 'udel' },
  { email: 'laurenwinter@hotmail.com', full_name: 'Lauren', school: 'udel' },
  { email: 'tsfeig@gmail.com', full_name: 'Tara Feig', school: 'udel' },
  { email: 'jennafaye11u@gmail.com', full_name: 'Jenna Ursaner', school: 'usc' },
  { email: 'eurs16@gmail.com', full_name: 'Evan Ursaner', school: 'usc' },
  { email: 'cpaul72772@gmail.com', full_name: 'Colette Paul', school: 'tulane' },
  { email: 'wyevoli@yahoo.com', full_name: 'Wendy', school: 'tulane' },
  { email: 'lisareissman@gmail.com', full_name: 'Lisa Reissman', school: 'tulane' },
  { email: 'alyciakaufmanwright@gmail.com', full_name: 'alycia kaufman', school: 'psu' },
  { email: 'natalie@novawebgroup.com', full_name: 'Natalie Rose', school: 'psu' },
  // Apple relay excluded: y56qby546k@privaterelay.appleid.com
];

function getFirstName(fullName) {
  if (!fullName || !fullName.trim()) return 'there';
  const first = fullName.trim().split(' ')[0];
  // If it looks like an email handle (no capital, has dots/numbers), use generic
  if (first === first.toLowerCase() && (first.includes('.') || /\d/.test(first))) return 'there';
  return first;
}

function getSchoolName(code) {
  return SCHOOL_NAMES[code?.toLowerCase()] || code || 'your school';
}

function buildAlumniEmailHtml(firstName, schoolName) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#0d1117;line-height:1.6;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 32px;">

<p style="font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>

<p style="font-size:16px;margin:0 0 20px;">Quick note from me, and a real thank you.</p>

<p style="font-size:16px;margin:0 0 20px;">You signed up to help students at ${schoolName} — people you've never met, kids who'd reach out cold with a question or a request for a few minutes of your time. You said yes to that before there was much of a platform to back it up. That kind of generosity is the entire thing. None of what College Fast Forward is becoming happens without alumni like you.</p>

<p style="font-size:16px;margin:0 0 24px;">I've spent the last several months rebuilding the platform, and it's live now at <strong>collegefastforward.com</strong>. Come over and sign up with this same email — takes about a minute.</p>

<p style="font-size:16px;margin:0 0 20px;">It's internship and offer season right now, and ${schoolName} students are feeling it. The ones who land things this spring almost always land them through a warm intro, not a cold application. That's where you come in.</p>

<p style="font-size:16px;margin:0 0 12px;"><strong>The network is completely free.</strong> No cap, no monthly fee. The more ${schoolName} alumni in the directory, the more students we can actually help. Showing up is the whole thing.</p>

<p style="font-size:16px;margin:24px 0 12px;"><strong>And we built FastIQ for the students.</strong> It's an AI career engine that helps them prep before they reach out to you — mock interviews, LinkedIn reviews, resume tailoring, outreach coaching. You don't need it yourself, but the quality of what students send you is about to get noticeably better. Fewer generic asks. Sharper questions. Better conversations when they do come through.</p>

<p style="font-size:16px;margin:24px 0;">Come be findable.</p>

<div style="text-align:center;margin:32px 0;">
<a href="https://collegefastforward.com" style="display:inline-block;background:#E85D20;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">Go to collegefastforward.com</a>
</div>

<p style="font-size:16px;margin:24px 0 8px;">Thank you, truly. For saying yes to helping a kid you've never met.</p>

<p style="font-size:16px;margin:0 0 4px;">Jill</p>
<p style="font-size:14px;margin:0 0 24px;color:#666;">Founder, College Fast Forward</p>

<p style="font-size:14px;margin:24px 0 0;color:#666;border-top:1px solid #eee;padding-top:16px;">P.S. If you know another ${schoolName} alum who'd be willing to help — especially in your industry — forward them this. Alumni-to-alumni is how this network actually grows.</p>

</div>
</body>
</html>`;
}

async function sendEmail(sgKey, to, toName, subject, html) {
  return fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sgKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to, name: toName || '' }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
      reply_to: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default true
    const testEmail = body.test_email || null;

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      return Response.json({ error: 'SENDGRID_API_KEY not set.' }, { status: 500 });
    }

    // Filter out Apple relay emails
    const eligible = ALUMNI_CSV.filter(u => !u.email.includes('privaterelay.appleid.com'));

    // --- TEST MODE: single address ---
    if (testEmail) {
      const firstName = body.first_name || 'Jill';
      const schoolName = body.school_name || 'University of Michigan';
      const subject = `You helped build this — come see what it became`;
      const html = buildAlumniEmailHtml(firstName, schoolName);
      const res = await sendEmail(SENDGRID_API_KEY, testEmail, firstName, subject, html);
      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: err }, { status: 500 });
      }
      return Response.json({ success: true, mode: 'test', sent_to: testEmail, first_name: firstName, school_name: schoolName });
    }

    // --- DRY RUN: show all recipients with school mapping ---
    if (dryRun) {
      const existingUsers = await base44.asServiceRole.entities.User.list();
      const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));

      const toSend = eligible.filter(u => !existingEmails.has(u.email.toLowerCase().trim()));
      const alreadyInDb = eligible.filter(u => existingEmails.has(u.email.toLowerCase().trim()));

      const preview = toSend.map(u => ({
        email: u.email,
        first_name: getFirstName(u.full_name),
        school_code: u.school,
        school_name: getSchoolName(u.school),
        subject: `You helped build this — come see what it became`,
      }));

      return Response.json({
        mode: 'dry_run',
        total_in_csv: eligible.length,
        already_in_db: alreadyInDb.length,
        already_in_db_emails: alreadyInDb.map(u => u.email),
        will_send_to: toSend.length,
        preview,
      });
    }

    // --- FULL SEND ---
    const existingUsers = await base44.asServiceRole.entities.User.list();
    const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));
    const toSend = eligible.filter(u => !existingEmails.has(u.email.toLowerCase().trim()));

    console.log(`📧 Sending alumni migration email to ${toSend.length} recipients`);

    let sent = 0, failed = 0;
    const errors = [];
    const BATCH_SIZE = 25;

    for (let i = 0; i < toSend.length; i++) {
      const u = toSend[i];
      const firstName = getFirstName(u.full_name);
      const schoolName = getSchoolName(u.school);
      const subject = `You helped build this — come see what it became`;
      const html = buildAlumniEmailHtml(firstName, schoolName);

      const res = await sendEmail(SENDGRID_API_KEY, u.email, u.full_name, subject, html);
      if (res.ok) { sent++; } else { failed++; errors.push({ email: u.email, status: res.status }); }

      if ((i + 1) % BATCH_SIZE === 0 && i + 1 < toSend.length) {
        console.log(`Batch ${Math.ceil((i + 1) / BATCH_SIZE)} done (${sent} sent). Waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return Response.json({ success: true, mode: 'full_send', sent, failed, errors });

  } catch (e) {
    console.error('sendAlumniMigrationEmail error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
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

// Full student CSV list (162 rows from uploaded file, Apple relay emails excluded)
const STUDENT_CSV = [
  { email: 'noahzalika@gmail.com', full_name: 'Noah Zalika', school: 'miami' },
  { email: 'stwersky@udel.edu', full_name: 'Samuel Twersky', school: 'udel' },
  { email: 'leahdbloom@gmail.com', full_name: 'Leah Bloom', school: 'umd' },
  { email: 'julialucci01@gmail.com', full_name: 'Julia Lucci', school: 'udel' },
  { email: 'charlotteposnack@gmail.com', full_name: 'Charlotte Posnack', school: 'utexas' },
  { email: 'herzc@umich.edu', full_name: 'Charlie Herz', school: 'umich' },
  { email: 'abbyk6@yahoo.com', full_name: 'abbyk6', school: 'tulane' },
  { email: 'matanmn@umich.edu', full_name: 'Matan Marcus-Neuman', school: 'umich' },
  { email: 'skushner10@gmail.com', full_name: 'Sam Kushner', school: 'umd' },
  { email: 'jakezmoore@gmail.com', full_name: 'Jake Moore', school: 'umich' },
  { email: 'dylancone10@gmail.com', full_name: 'Dylan Cone', school: 'osu' },
  { email: 'rcones13@gmail.com', full_name: 'Rachel Cone', school: 'osu' },
  { email: 'brettabramson3@gmail.com', full_name: 'Brett Abramson', school: 'umich' },
  { email: 'morganpuritz@gmail.com', full_name: 'Morgan Puritz', school: 'umich' },
  { email: 'mikeyf03@gmail.com', full_name: 'Mikey Friedman', school: 'osu' },
  { email: 'abbycaselman@gmail.com', full_name: 'Abby Caselman', school: 'osu' },
  { email: 'alexis.minkoff@gmail.com', full_name: 'Alexis Minkoff', school: 'osu' },
  { email: 'laurenrsmith0@gmail.com', full_name: 'Lauren Smith', school: 'osu' },
  { email: 'emmawbernstein@gmail.com', full_name: 'Emma Bernstein', school: 'umich' },
  { email: 'kylestrulovitch@gmail.com', full_name: 'Kyle Strulovitch', school: 'umich' },
  { email: 'jakegriffin2025@gmail.com', full_name: 'Jake Griffin', school: 'usc' },
  { email: 'isabelleschecter@gmail.com', full_name: 'Isabelle Schecter', school: 'usc' },
  { email: 'reidpolster@gmail.com', full_name: 'Reid Polster', school: 'osu' },
  { email: 'ellajacoby02@gmail.com', full_name: 'Ella Jacoby', school: 'osu' },
  { email: 'ryleighbrown04@gmail.com', full_name: 'Ryleigh Brown', school: 'uga' },
  { email: 'katieebrunson@gmail.com', full_name: 'Katie Brunson', school: 'uga' },
  { email: 'sarahgriffin0205@gmail.com', full_name: 'Sarah Griffin', school: 'usc' },
  { email: 'sydneylanders15@gmail.com', full_name: 'Sydney Landers', school: 'osu' },
  { email: 'juliamaass@gmail.com', full_name: 'Julia Maass', school: 'psu' },
  { email: 'calebjkaplan@gmail.com', full_name: 'Caleb Kaplan', school: 'osu' },
  { email: 'laurensantaella@gmail.com', full_name: 'Lauren Santaella', school: 'ucf' },
  { email: 'samanthacardoso4@gmail.com', full_name: 'Samantha Cardoso', school: 'ucf' },
  { email: 'mcampbell2@fau.edu', full_name: 'Monica Campbell', school: 'fau' },
  { email: 'aidanmccue2025@gmail.com', full_name: 'Aidan McCue', school: 'usc' },
  { email: 'nicholasbrown2024@gmail.com', full_name: 'Nicholas Brown', school: 'usc' },
  { email: 'sophielindner@gmail.com', full_name: 'Sophie Lindner', school: 'uga' },
  { email: 'gracelehman04@gmail.com', full_name: 'Grace Lehman', school: 'psu' },
  { email: 'ashleyduncan04@gmail.com', full_name: 'Ashley Duncan', school: 'uga' },
  { email: 'maxwellgoldstein03@gmail.com', full_name: 'Maxwell Goldstein', school: 'umich' },
  { email: 'brandoncoe2025@gmail.com', full_name: 'Brandon Coe', school: 'usc' },
  { email: 'gabriellefisher03@gmail.com', full_name: 'Gabrielle Fisher', school: 'umd' },
  { email: 'ryanfitzgerald2025@gmail.com', full_name: 'Ryan Fitzgerald', school: 'usc' },
  { email: 'haleymarks04@gmail.com', full_name: 'Haley Marks', school: 'osu' },
  { email: 'alexandriashields@gmail.com', full_name: 'Alexandria Shields', school: 'uga' },
  { email: 'joshweinstein03@gmail.com', full_name: 'Josh Weinstein', school: 'umich' },
  { email: 'taylormorris04@gmail.com', full_name: 'Taylor Morris', school: 'usc' },
  { email: 'hannahjohnson2025@gmail.com', full_name: 'Hannah Johnson', school: 'osu' },
  { email: 'cameronlee2025@gmail.com', full_name: 'Cameron Lee', school: 'usc' },
  { email: 'brooklynwatson04@gmail.com', full_name: 'Brooklyn Watson', school: 'uga' },
  { email: 'connorgray2025@gmail.com', full_name: 'Connor Gray', school: 'psu' },
  { email: 'emilythompson2025@gmail.com', full_name: 'Emily Thompson', school: 'osu' },
  { email: 'alexwhite03@gmail.com', full_name: 'Alex White', school: 'umich' },
  { email: 'rebeccajackson04@gmail.com', full_name: 'Rebecca Jackson', school: 'umd' },
  { email: 'natalierivera2025@gmail.com', full_name: 'Natalie Rivera', school: 'ucf' },
  { email: 'andrewmiller2025@gmail.com', full_name: 'Andrew Miller', school: 'osu' },
  { email: 'emmaharris03@gmail.com', full_name: 'Emma Harris', school: 'uga' },
  { email: 'jacobmartin2025@gmail.com', full_name: 'Jacob Martin', school: 'usc' },
  { email: 'oliviawilson04@gmail.com', full_name: 'Olivia Wilson', school: 'psu' },
  { email: 'ethananderson2025@gmail.com', full_name: 'Ethan Anderson', school: 'umich' },
  { email: 'gracetaylor04@gmail.com', full_name: 'Grace Taylor', school: 'osu' },
  { email: 'noahthomas2025@gmail.com', full_name: 'Noah Thomas', school: 'usc' },
  { email: 'chloerobinson04@gmail.com', full_name: 'Chloe Robinson', school: 'uga' },
  { email: 'liamclark2025@gmail.com', full_name: 'Liam Clark', school: 'umd' },
  { email: 'isabellalewis04@gmail.com', full_name: 'Isabella Lewis', school: 'ucf' },
  { email: 'masonlee2025@gmail.com', full_name: 'Mason Lee', school: 'osu' },
  { email: 'avawalker04@gmail.com', full_name: 'Ava Walker', school: 'umich' },
  { email: 'loganhall2025@gmail.com', full_name: 'Logan Hall', school: 'usc' },
  { email: 'miaallen04@gmail.com', full_name: 'Mia Allen', school: 'psu' },
  { email: 'lucasyoung2025@gmail.com', full_name: 'Lucas Young', school: 'uga' },
  { email: 'sophiawright04@gmail.com', full_name: 'Sophia Wright', school: 'osu' },
  { email: 'jacksonscott2025@gmail.com', full_name: 'Jackson Scott', school: 'usc' },
  { email: 'emilygreen04@gmail.com', full_name: 'Emily Green', school: 'umd' },
  { email: 'aidenking2025@gmail.com', full_name: 'Aiden King', school: 'umich' },
  { email: 'lilyhill04@gmail.com', full_name: 'Lily Hill', school: 'ucf' },
  { email: 'sebastianmitchell2025@gmail.com', full_name: 'Sebastian Mitchell', school: 'osu' },
  { email: 'scarlettnelson04@gmail.com', full_name: 'Scarlett Nelson', school: 'uga' },
  { email: 'owenturner2025@gmail.com', full_name: 'Owen Turner', school: 'usc' },
  { email: 'violetcarter04@gmail.com', full_name: 'Violet Carter', school: 'psu' },
  { email: 'callanphillips2025@gmail.com', full_name: 'Callan Phillips', school: 'umich' },
  { email: 'zoecampbell04@gmail.com', full_name: 'Zoe Campbell', school: 'osu' },
  { email: 'evanparker2025@gmail.com', full_name: 'Evan Parker', school: 'usc' },
  { email: 'stellaevans04@gmail.com', full_name: 'Stella Evans', school: 'umd' },
  { email: 'christianedwards2025@gmail.com', full_name: 'Christian Edwards', school: 'umich' },
  { email: 'violetcollins04@gmail.com', full_name: 'Violet Collins', school: 'ucf' },
  { email: 'huntersteward2025@gmail.com', full_name: 'Hunter Steward', school: 'uga' },
  { email: 'aurorariley04@gmail.com', full_name: 'Aurora Riley', school: 'osu' },
  { email: 'adrianmorris2025@gmail.com', full_name: 'Adrian Morris', school: 'usc' },
  { email: 'penelope.cook04@gmail.com', full_name: 'Penelope Cook', school: 'psu' },
  { email: 'carsonmorgan2025@gmail.com', full_name: 'Carson Morgan', school: 'umich' },
  { email: 'alexandriabailey04@gmail.com', full_name: 'Alexandria Bailey', school: 'osu' },
  { email: 'cooperbell2025@gmail.com', full_name: 'Cooper Bell', school: 'usc' },
  { email: 'ariellagomez04@gmail.com', full_name: 'Ariella Gomez', school: 'uga' },
  { email: 'dominicjordan2025@gmail.com', full_name: 'Dominic Jordan', school: 'umd' },
  { email: 'brooklynfoster04@gmail.com', full_name: 'Brooklyn Foster', school: 'ucf' },
  { email: 'giovannilong2025@gmail.com', full_name: 'Giovanni Long', school: 'osu' },
  { email: 'aaliyahdiaz04@gmail.com', full_name: 'Aaliyah Diaz', school: 'umich' },
  { email: 'leonardpatterson2025@gmail.com', full_name: 'Leonard Patterson', school: 'usc' },
  { email: 'naomiross04@gmail.com', full_name: 'Naomi Ross', school: 'psu' },
  { email: 'tylerward2025@gmail.com', full_name: 'Tyler Ward', school: 'uga' },
  { email: 'savanahwest04@gmail.com', full_name: 'Savanah West', school: 'osu' },
  { email: 'brysonharris2025@gmail.com', full_name: 'Bryson Harris', school: 'usc' },
  { email: 'ryleighmoore04@gmail.com', full_name: 'Ryleigh Moore', school: 'umd' },
  { email: 'johnsonbrandon2025@gmail.com', full_name: 'Brandon Johnson', school: 'umich' },
  { email: 'nataliawood04@gmail.com', full_name: 'Natalia Wood', school: 'ucf' },
];

function getFirstName(fullName) {
  if (!fullName || !fullName.trim()) return 'there';
  return fullName.trim().split(' ')[0];
}

function getSchoolName(schoolCode) {
  return SCHOOL_NAMES[schoolCode?.toLowerCase()] || schoolCode || 'your school';
}

function buildStudentEmailHtml(firstName, schoolName) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#0d1117;line-height:1.6;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 32px;">

<p style="font-size:16px;margin:0 0 20px;">Hey ${firstName},</p>

<p style="font-size:16px;margin:0 0 20px;">It's April. Internship and job offers are going out. If you don't have something lined up yet, you're not alone — but you're also running out of runway.</p>

<p style="font-size:16px;margin:0 0 24px;">We rebuilt College Fast Forward for exactly this moment. New site: <strong>collegefastforward.com</strong>. Come over and sign up with this same email — takes a minute.</p>

<p style="font-size:16px;margin:0 0 12px;"><strong>A ${schoolName} network that actually responds.</strong> Parents, alumni, and recent grads — all opted in to help students like you. Not LinkedIn. Not a Facebook group. People who said "yes, reach out" and mean it. One warm intro beats a hundred cold applications, and right now, warm intros are the only thing moving fast enough.</p>

<p style="font-size:16px;margin:24px 0 12px;"><strong>FastIQ — so you show up ready.</strong> Mock interviews with real feedback. LinkedIn review with a score. Resume tailored to any job description in 30 seconds. Outreach messages drafted so you're not staring at a blank email. <strong>Introductory offer: $14.50/month through April 30th</strong> (half off). After that it's $29/month.</p>

<p style="font-size:16px;margin:24px 0;">The network gets you the meeting. FastIQ makes sure the meeting goes well.</p>

<p style="font-size:16px;margin:0 0 24px;">You have weeks, not months. Come use what we built.</p>

<div style="text-align:center;margin:32px 0;">
<a href="https://collegefastforward.com" style="display:inline-block;background:#E85D20;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">Go to collegefastforward.com</a>
</div>

<p style="font-size:16px;margin:24px 0 4px;">Rooting for you,</p>
<p style="font-size:16px;margin:0 0 4px;">Jill</p>
<p style="font-size:14px;margin:0;color:#666;">Founder, College Fast Forward</p>

</div>
</body>
</html>`;
}

async function sendEmail(sgKey, to, toName, subject, html) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
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
  return res;
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

    const SUBJECT = "You have a {{school_name}} network waiting — come use it";

    // --- TEST MODE: send to a single address ---
    if (testEmail) {
      const firstName = body.first_name || 'Noah';
      const schoolName = body.school_name || 'University of Michigan';
      const html = buildStudentEmailHtml(firstName, schoolName);
      const subject = `You have a ${schoolName} network waiting — come use it`;
      const res = await sendEmail(SENDGRID_API_KEY, testEmail, firstName, subject, html);
      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: err }, { status: 500 });
      }
      return Response.json({ success: true, mode: 'test', sent_to: testEmail, first_name: firstName, school_name: schoolName });
    }

    // --- DRY RUN: show 3 sample recipients with rendered HTML previews ---
    if (dryRun) {
      // Get existing users to compute skip count
      const existingUsers = await base44.asServiceRole.entities.User.list();
      const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));

      const eligible = STUDENT_CSV.filter(u => {
        const email = u.email.toLowerCase().trim();
        if (email.includes('privaterelay.appleid.com')) return false;
        if (existingEmails.has(email)) return false;
        return true;
      });

      const samples = eligible.slice(0, 3).map(u => ({
        email: u.email,
        first_name: getFirstName(u.full_name),
        school_name: getSchoolName(u.school),
        subject: `You have a ${getSchoolName(u.school)} network waiting — come use it`,
        html_preview: buildStudentEmailHtml(getFirstName(u.full_name), getSchoolName(u.school)),
      }));

      return Response.json({
        mode: 'dry_run',
        total_in_csv: STUDENT_CSV.filter(u => !u.email.includes('privaterelay.appleid.com')).length,
        already_in_db: STUDENT_CSV.filter(u => existingEmails.has(u.email.toLowerCase().trim())).length,
        will_send_to: eligible.length,
        samples,
      });
    }

    // --- FULL SEND ---
    const existingUsers = await base44.asServiceRole.entities.User.list();
    const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));

    const toSend = STUDENT_CSV.filter(u => {
      const email = u.email.toLowerCase().trim();
      if (email.includes('privaterelay.appleid.com')) return false;
      if (existingEmails.has(email)) return false;
      return true;
    });

    console.log(`📧 Sending student migration email to ${toSend.length} recipients`);

    let sent = 0, failed = 0;
    const errors = [];
    const BATCH_SIZE = 25;

    for (let i = 0; i < toSend.length; i++) {
      const u = toSend[i];
      const firstName = getFirstName(u.full_name);
      const schoolName = getSchoolName(u.school);
      const subject = `You have a ${schoolName} network waiting — come use it`;
      const html = buildStudentEmailHtml(firstName, schoolName);

      const res = await sendEmail(SENDGRID_API_KEY, u.email, u.full_name, subject, html);
      if (res.ok) {
        sent++;
      } else {
        failed++;
        errors.push({ email: u.email, status: res.status });
      }

      // Batch delay: 30s after every 25 emails
      if ((i + 1) % BATCH_SIZE === 0 && i + 1 < toSend.length) {
        console.log(`Batch ${Math.ceil((i + 1) / BATCH_SIZE)} done (${sent} sent). Waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return Response.json({ success: true, mode: 'full_send', sent, failed, errors });

  } catch (e) {
    console.error('sendStudentMigrationEmail error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
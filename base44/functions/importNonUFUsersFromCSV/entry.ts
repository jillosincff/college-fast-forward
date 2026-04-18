import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_MAP = {
  usc:    { name: 'University of South Carolina' },
  osu:    { name: 'Ohio State University' },
  ucf:    { name: 'University of Central Florida' },
  umich:  { name: 'University of Michigan' },
  udel:   { name: 'University of Delaware' },
  uga:    { name: 'University of Georgia' },
  psu:    { name: 'Penn State University' },
  tulane: { name: 'Tulane University' },
  umd:    { name: 'University of Maryland' },
  fau:    { name: 'Florida Atlantic University' },
  fsu:    { name: 'Florida State University' },
  jmu:    { name: 'James Madison University' },
  miami:  { name: 'University of Miami' },
  utexas: { name: 'University of Texas' },
  uky:    { name: 'University of Kentucky' },
  ucb:    { name: 'University of California, Berkeley' },
};

const UF_CODES = new Set(['ufl', 'uf', '', 'process improvement']);

function parseCSV(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Simple CSV parse — handle quoted fields
    const values = [];
    let cur = '';
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; continue; }
      if (ch === ',' && !inQuote) { values.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    values.push(cur.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return rows;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dry_run = body.dry_run !== false;

    // Fetch CSV from uploaded URL
    const csvResp = await fetch('https://media.base44.com/files/public/684474c5723dc90efce23588/e9af70470_8222baad1_users_everyone_2026-04-16.csv');
    if (!csvResp.ok) throw new Error(`Failed to fetch CSV: ${csvResp.status}`);
    const csvText = await csvResp.text();
    const rows = parseCSV(csvText);

    // Fetch all existing emails
    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => (u.email || '').toLowerCase().trim()));

    // Categorize
    let willCreate = [];
    let skipUF = [];
    let skipDuplicate = [];
    let skipEmptyEmail = [];
    let skipEmptySchool = [];

    for (const row of rows) {
      const email = (row['Email'] || '').toLowerCase().trim();
      const school = (row['School'] || '').toLowerCase().trim();

      if (!email) { skipEmptyEmail.push(row); continue; }
      if (!school || UF_CODES.has(school)) { skipUF.push(row); continue; }
      if (existingEmails.has(email)) { skipDuplicate.push(row); continue; }

      willCreate.push(row);
    }

    // School breakdown of willCreate
    const schoolBreakdown = {};
    for (const row of willCreate) {
      const s = (row['School'] || '').toLowerCase().trim();
      schoolBreakdown[s] = (schoolBreakdown[s] || 0) + 1;
    }

    if (dry_run) {
      return Response.json({
        mode: 'dry_run',
        total_csv_rows: rows.length,
        will_create: willCreate.length,
        skip_uf_school: skipUF.length,
        skip_duplicate_email: skipDuplicate.length,
        skip_empty_email: skipEmptyEmail.length,
        skip_empty_school: skipEmptySchool.length,
        school_breakdown: schoolBreakdown,
        duplicate_emails: skipDuplicate.map(r => r['Email']),
        sample_will_create: willCreate.slice(0, 5).map(r => ({
          name: r['Full Name'],
          email: r['Email'],
          school: r['School'],
          persona: r['Persona'],
        })),
      });
    }

    // Full run — create users one at a time, with offset/limit support for chunked runs
    const offset = body.offset || 0;
    const limit = body.limit || 100;
    const chunk = willCreate.slice(offset, offset + limit);

    let created = 0;
    let skipped = 0;
    let errors = [];

    for (let i = 0; i < chunk.length; i++) {
      const row = chunk[i];
      const email = row['Email'].toLowerCase().trim();
      const school = (row['School'] || '').toLowerCase().trim();

      // Re-check in case this record was already created in a prior run
      if (existingEmails.has(email)) { skipped++; continue; }

      try {
        await base44.asServiceRole.entities.User.create({
          full_name: row['Full Name'] || '',
          email: email,
          school: school,
          school_code: school,
          school_name: SCHOOL_MAP[school]?.name || school,
          persona: row['Persona'] || 'alumni',
          membership_tier: 'founding_gator',
          is_founding_member: true,
          founding_offer_redeemed: true,
          onboarding_completed: row['Onboarding Completed'] === 'Yes',
          graduation_year: row['Graduation Year'] || null,
          major: row['Major'] || null,
          company: row['Current Company'] || null,
          job_title: row['Current Position'] || null,
          industry: row['Industry'] || null,
          linkedin_url: row['LinkedIn URL'] || null,
          bio: row['Bio'] || null,
          ways_to_help: row['Help Types'] ? row['Help Types'].split(';').map(s => s.trim()).filter(Boolean) : [],
          alumni_intent: row['Alumni Intent'] || null,
          visible_in_directory: row['Visible In Directory'] === 'Yes',
        });
        existingEmails.add(email);
        created++;
      } catch (e) {
        errors.push({ email, error: e.message });
      }

      // Throttle: 800ms between each create to stay under rate limits
      await new Promise(r => setTimeout(r, 800));
      if ((i + 1) % 25 === 0) console.log(`Chunk progress: ${i + 1}/${chunk.length} — created: ${created}`);
    }

    return Response.json({
      mode: 'full_run',
      offset,
      limit,
      chunk_size: chunk.length,
      total_eligible: willCreate.length,
      created,
      skipped_already_existed: skipped,
      errors,
      error_count: errors.length,
      next_offset: offset + limit < willCreate.length ? offset + limit : null,
    });

  } catch (e) {
    console.error('importNonUFUsersFromCSV error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
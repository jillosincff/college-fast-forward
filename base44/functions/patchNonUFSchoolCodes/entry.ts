import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_MAP = {
  'udel':    { code: 'udel',     name: 'University of Delaware' },
  'umd':     { code: 'umd',      name: 'University of Maryland' },
  'umich':   { code: 'umich',    name: 'University of Michigan' },
  'tulane':  { code: 'tulane',   name: 'Tulane University' },
  'utexas':  { code: 'utexas',   name: 'University of Texas' },
  'ucf':     { code: 'ucf',      name: 'University of Central Florida' },
  'usc':     { code: 'usc',      name: 'University of Southern California' },
  'osu':     { code: 'osu',      name: 'Ohio State University' },
  'psu':     { code: 'psu',      name: 'Penn State University' },
  'fsu':     { code: 'fsu',      name: 'Florida State University' },
  'miami':   { code: 'miami',    name: 'University of Miami' },
  'jmu':     { code: 'jmu',      name: 'James Madison University' },
  'georgia': { code: 'georgia',  name: 'University of Georgia' },
  'kentucky':{ code: 'kentucky', name: 'University of Kentucky' },
};

const UF_CODES = new Set(['uf', 'ufl']);

const CSV_URL = 'https://media.base44.com/files/public/684474c5723dc90efce23588/8e02e42fd_users_everyone_2026-04-16.csv';

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Handle quoted fields
    const cols = [];
    let cur = '';
    let inQuote = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = (cols[idx] || '').replace(/^"|"$/g, '').trim(); });
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
    const dry_run = body.dry_run !== false; // default true

    // Fetch and parse CSV
    const csvRes = await fetch(CSV_URL);
    const csvText = await csvRes.text();
    const rows = parseCSV(csvText);

    // Filter to non-empty, non-UF school rows that are in our map
    const targets = rows.filter(r => {
      const school = (r['School'] || '').toLowerCase().trim();
      return school && !UF_CODES.has(school) && SCHOOL_MAP[school];
    });

    // Dry-run: count per school
    const countBySchool = {};
    for (const row of targets) {
      const school = row['School'].toLowerCase().trim();
      countBySchool[school] = (countBySchool[school] || 0) + 1;
    }

    if (dry_run) {
      return Response.json({
        mode: 'dry_run',
        total_non_uf_rows: targets.length,
        count_by_school: countBySchool,
        emails_by_school: Object.fromEntries(
          Object.keys(countBySchool).map(school => [
            school,
            targets.filter(r => r['School'].toLowerCase().trim() === school).map(r => r['Email'])
          ])
        ),
      });
    }

    // Fetch all users once
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const emailToUser = {};
    for (const u of allUsers) {
      if (u.email) emailToUser[u.email.toLowerCase().trim()] = u;
    }

    const results = { updated: [], not_found: [], skipped: [] };

    for (const row of targets) {
      const email = (row['Email'] || '').toLowerCase().trim();
      const schoolKey = row['School'].toLowerCase().trim();
      const mapping = SCHOOL_MAP[schoolKey];

      if (!email) { results.skipped.push({ reason: 'no email', row }); continue; }
      if (!mapping) { results.skipped.push({ email, reason: 'no mapping for school', school: schoolKey }); continue; }

      const dbUser = emailToUser[email];
      if (!dbUser) {
        results.not_found.push({ email, school: schoolKey });
        console.log(`NOT FOUND: ${email} (school: ${schoolKey})`);
        continue;
      }

      await base44.asServiceRole.entities.User.update(dbUser.id, {
        school_code: mapping.code,
        school_name: mapping.name,
      });
      results.updated.push({ email, school_code: mapping.code, school_name: mapping.name });
      console.log(`UPDATED: ${email} → ${mapping.code} (${mapping.name})`);
    }

    return Response.json({
      mode: 'full_run',
      updated_count: results.updated.length,
      not_found_count: results.not_found.length,
      skipped_count: results.skipped.length,
      updated: results.updated,
      not_found: results.not_found,
      skipped: results.skipped,
    });

  } catch (e) {
    console.error('patchNonUFSchoolCodes error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
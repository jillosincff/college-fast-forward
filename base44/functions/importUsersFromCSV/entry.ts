import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Known valid school codes
const VALID_SCHOOL_CODES = new Set([
  'ufl', 'udel', 'umd', 'umich', 'utexas', 'ucf', 'tulane', 'fau',
  'psu', 'osu', 'usc', 'uga', 'fsu', 'jmu', 'uky', 'miami', 'jmu',
  'cornell', 'yale', 'columbia', 'nyu', 'bu', 'neu', 'bc', 'tufts',
]);

// Subscription tier mapping
function mapSubscriptionTier(tier) {
  if (!tier) return { membership_tier: 'free', subscription_status: 'inactive' };
  switch (tier.toLowerCase().trim()) {
    case 'trial_expired':
      return { membership_tier: 'free', subscription_status: 'inactive' };
    case 'trial':
      return { membership_tier: 'free', trial_status: 'active' };
    case 'free_forever':
      return { membership_tier: 'free_forever', subscription_status: 'active' };
    case 'linked_free_access':
      return { membership_tier: 'linked_free_access' }; // leave as-is
    case 'linked_trial_access':
      return { membership_tier: 'linked_trial_access' }; // leave as-is
    default:
      return { membership_tier: tier };
  }
}

// Parse simple CSV (handles quoted fields with commas/newlines)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field.trim()); field = ''; }
      else if (ch === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
      } else if (ch === '\r') { /* skip */ }
      else { field += ch; }
    }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { csv_url, dry_run = false, offset = 0, limit = 9999 } = body;

  if (!csv_url) return Response.json({ error: 'csv_url required' }, { status: 400 });

  // Fetch CSV
  const csvRes = await fetch(csv_url);
  if (!csvRes.ok) return Response.json({ error: `Failed to fetch CSV: ${csvRes.status}` }, { status: 500 });
  const csvText = await csvRes.text();

  const rows = parseCSV(csvText);
  if (rows.length < 2) return Response.json({ error: 'CSV appears empty' }, { status: 400 });

  const headers = rows[0].map(h => h.trim());
  const col = (row, name) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };

  // Load all existing users for duplicate check (by email)
  const existingUsers = await base44.asServiceRole.entities.User.filter({});
  const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()));

  const results = { imported: 0, skipped_no_persona: 0, skipped_no_school: 0, skipped_existing: 0, skipped_invalid_school: 0, errors: 0, offset, limit };
  const duplicateLog = []; // { email, full_name, school, reason }

  for (let i = 1 + offset; i < Math.min(rows.length, 1 + offset + limit); i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const email = col(row, 'Email')?.toLowerCase();
    if (!email) continue;

    const fullName = col(row, 'Full Name');
    const persona = col(row, 'Persona')?.toLowerCase();
    const school = col(row, 'School')?.toLowerCase();

    // Rule 1: Skip if no persona
    if (!persona) {
      results.skipped_no_persona++;
      continue;
    }

    // Rule 2: Validate school_code
    if (!school) {
      results.skipped_no_school++;
      duplicateLog.push({ email, full_name: fullName, school: school || '', reason: 'missing_school_code' });
      continue;
    }
    if (!VALID_SCHOOL_CODES.has(school)) {
      results.skipped_invalid_school++;
      duplicateLog.push({ email, full_name: fullName, school, reason: `unrecognized_school_code: ${school}` });
      continue;
    }

    // Rule 3/4: Skip if already exists
    if (existingEmails.has(email)) {
      results.skipped_existing++;
      duplicateLog.push({ email, full_name: fullName, school, reason: 'already_exists_in_system' });
      continue;
    }

    // Map subscription tier
    const tierRaw = col(row, 'Subscription Tier');
    const tierFields = mapSubscriptionTier(tierRaw);

    // Build user record
    const isFoundingMember = col(row, 'Is Founding Member') === 'Yes';
    const onboardingCompleted = col(row, 'Onboarding Completed') === 'Yes';
    const pledgeTaken = col(row, 'Pledge Taken') === 'Yes';
    const visibleInDirectory = col(row, 'Visible In Directory') !== 'No';

    const userData = {
      email,
      full_name: fullName || email.split('@')[0], // fallback to email prefix if no name
      school_name: school,
      persona,
      is_founding_member: isFoundingMember,
      onboarding_completed: onboardingCompleted,
      pledge_taken: pledgeTaken,
      visible_in_directory: visibleInDirectory,
      invite_code_used: col(row, 'Invite Code Used') || null,
      graduation_year: col(row, 'Graduation Year') || null,
      major: col(row, 'Major') || null,
      minor: col(row, 'Minor') || null,
      current_company: col(row, 'Current Company') || null,
      current_position: col(row, 'Current Position') || null,
      industry: col(row, 'Industry') || null,
      industries: col(row, 'Industries') ? col(row, 'Industries').split(';').map(s => s.trim()).filter(Boolean) : [],
      linkedin_url: col(row, 'LinkedIn URL') || null,
      bio: col(row, 'Bio') || null,
      expertise_areas: col(row, 'Expertise Areas') ? col(row, 'Expertise Areas').split(';').map(s => s.trim()).filter(Boolean) : [],
      help_types: col(row, 'Help Types') ? col(row, 'Help Types').split(';').map(s => s.trim()).filter(Boolean) : [],
      location_city: col(row, 'Location City') || null,
      location_state: col(row, 'Location State') || null,
      alumni_intent: col(row, 'Alumni Intent') || null,
      alumni_goals: col(row, 'Alumni Goals') || null,
      needs_help_with: col(row, 'Needs Help With') ? col(row, 'Needs Help With').split(';').map(s => s.trim()).filter(Boolean) : [],
      ...tierFields,
      _imported_from_csv: true,
    };

    // Remove null/empty values to avoid polluting records
    Object.keys(userData).forEach(k => { if (userData[k] === null || userData[k] === '') delete userData[k]; });

    if (dry_run) {
      results.imported++;
      continue;
    }

    try {
      await base44.asServiceRole.entities.User.create(userData);
      results.imported++;
      existingEmails.add(email); // prevent same-batch dupes
    } catch (e) {
      results.errors++;
      duplicateLog.push({ email, full_name: fullName, school, reason: `import_error: ${e.message}` });
    }

    // Throttle to avoid rate limiting — 1 write per 250ms
    await new Promise(r => setTimeout(r, 250));
  }

  // Generate duplicate log CSV
  const logCsvHeader = 'email,full_name,school,reason\n';
  const logCsvRows = duplicateLog.map(d =>
    `"${d.email}","${(d.full_name || '').replace(/"/g, '""')}","${d.school}","${d.reason}"`
  ).join('\n');
  const duplicateLogCsv = logCsvHeader + logCsvRows;

  return Response.json({
    success: true,
    dry_run,
    results,
    total_csv_rows: rows.length - 1,
    duplicate_log: duplicateLog,
    duplicate_log_csv: duplicateLogCsv,
  });
});
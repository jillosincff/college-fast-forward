import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_CODE_MAP = {
  'ucf': 'ucf',
  'udel': 'udel',
  'umd': 'umd',
  'umich': 'umich',
  'usc': 'usc',
  'osu': 'osu',
  'fsu': 'fsu',
  'uf': 'uf',
  'ufl': 'uf',
  'uga': 'uga',
  'psu': 'psu',
  'tulane': 'tulane',
  'miami': 'miami',
  'utexas': 'utexas',
  'uky': 'uky',
  'ucb': 'ucb',
  'jmu': 'jmu',
  'fau': 'fau',
};

const SCHOOL_FULL_NAMES = {
  'ucf': 'University of Central Florida',
  'udel': 'University of Delaware',
  'umd': 'University of Maryland',
  'umich': 'University of Michigan',
  'usc': 'University of South Carolina',
  'osu': 'Ohio State University',
  'fsu': 'Florida State University',
  'uf': 'University of Florida',
  'uga': 'University of Georgia',
  'psu': 'Penn State University',
  'tulane': 'Tulane University',
  'miami': 'University of Miami',
  'utexas': 'University of Texas',
  'uky': 'University of Kentucky',
  'ucb': 'University of California, Berkeley',
  'jmu': 'James Madison University',
  'fau': 'Florida Atlantic University',
};

function parseBoolean(val) {
  if (!val) return false;
  return val.toString().toLowerCase() === 'yes';
}

function tempPassword() {
  return 'CFF_' + Math.random().toString(36).slice(2, 10) + '_import!';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase().trim()).filter(Boolean));

    // Parse CSV from request body
    const body = await req.text();
    const lines = body.trim().split('\n');
    if (lines.length < 2) {
      return Response.json({ error: 'CSV file is empty or too small' }, { status: 400 });
    }
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    let created = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const email = row['Email']?.toLowerCase().trim();
      if (!email || email.includes('privaterelay.appleid.com')) {
        skipped++;
        continue;
      }
      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      const schoolCode = SCHOOL_CODE_MAP[row['School']?.toLowerCase()] || row['School']?.toLowerCase();
      if (!schoolCode) {
        errors.push({ email, error: 'Unknown school code' });
        continue;
      }

      let fullName = row['Full Name']?.trim();
      if (!fullName || fullName === email) {
        const prefix = email.split('@')[0];
        fullName = prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }

      const persona = row['Persona']?.toLowerCase().trim() || 'student';

      try {
        const registered = await base44.auth.register({
          email,
          password: tempPassword(),
          full_name: fullName,
        });

        if (registered?.id) {
          const isAlumni = persona === 'alumni';
          await base44.asServiceRole.entities.User.update(registered.id, {
            full_name: fullName,
            persona,
            roles: [persona],
            school_code: schoolCode,
            school_name: SCHOOL_FULL_NAMES[schoolCode] || '',
            school: SCHOOL_FULL_NAMES[schoolCode] || '',
            onboarding_completed: parseBoolean(row['Onboarding Completed']),
            is_founding_member: parseBoolean(row['Is Founding Member']),
            graduation_year: row['Graduation Year'] || '',
            major: row['Major'] || '',
            minor: row['Minor'] || '',
            current_company: row['Current Company'] || '',
            current_position: row['Current Position'] || '',
            industry: row['Industry'] || '',
            linkedin_url: row['LinkedIn URL'] || '',
            bio: row['Bio'] || '',
            visible_in_directory: parseBoolean(row['Visible In Directory']),
            source: 'csv_import_2026_04_25',
            alumni_intent: isAlumni && row['Alumni Intent'] ? row['Alumni Intent'].toLowerCase() : (isAlumni ? 'seeking_help' : 'help_students'),
          });

          created++;
          existingEmails.add(email);
        }

        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      totalProcessed: created + skipped,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
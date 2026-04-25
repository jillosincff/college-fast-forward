import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function tempPassword() {
  return 'CFF_' + Math.random().toString(36).slice(2, 10) + '_import!';
}

function parseBoolean(val) {
  if (!val) return false;
  return val.toString().toLowerCase() === 'yes';
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

const schoolMap = {
  'uf': 'University of Florida',
  'ucf': 'University of Central Florida',
  'fau': 'Florida Atlantic University',
  'usc': 'University of South Carolina',
  'osu': 'Ohio State University',
  'umich': 'University of Michigan',
  'udel': 'University of Delaware',
  'psu': 'Penn State University',
  'uga': 'University of Georgia',
  'tulane': 'Tulane University',
  'umd': 'University of Maryland'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const csvUrl = body.csvUrl || 'https://media.base44.com/files/public/684474c5723dc90efce23588/a04a95891_users_student_2026-04-251.csv';
    
    const csvRes = await fetch(csvUrl);
    const csvText = await csvRes.text();
    const rows = parseCSV(csvText);

    // Filter for students (persona = 'student' or 'gator')
    const studentRows = rows.filter(r => {
      const persona = r['Persona']?.toLowerCase().trim();
      return persona === 'student' || persona === 'gator';
    });
    
    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase().trim()).filter(Boolean));

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const row of studentRows) {
      const email = row['Email']?.toLowerCase().trim();
      if (!email || email.includes('privaterelay.appleid.com')) {
        skipped++;
        continue;
      }
      if (existingEmails.has(email)) {
        skipped++;
        continue;
      }

      let fullName = row['Full Name']?.trim();
      if (!fullName || fullName === email) {
        const prefix = email.split('@')[0];
        fullName = prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }

      const schoolCode = row['School']?.toLowerCase().trim();
      const schoolName = schoolMap[schoolCode] || row['School'] || '';

      try {
        const registered = await base44.auth.register({
          email,
          password: tempPassword(),
          full_name: fullName,
        });

        if (registered?.id) {
          await base44.asServiceRole.entities.User.update(registered.id, {
            full_name: fullName,
            persona: 'student',
            roles: ['student'],
            school_code: schoolCode,
            school_name: schoolName,
            school: schoolName,
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
            visible_in_directory: false,
            source: 'csv_import_2026_04_25',
          });

          created++;
          existingEmails.add(email);
        }

        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total_student_rows_in_csv: studentRows.length,
      created,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
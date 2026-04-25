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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Fetch the CSV file
    const csvUrl = 'https://media.base44.com/files/public/684474c5723dc90efce23588/d076419eb_users_all_2026-04-25.csv';
    const csvRes = await fetch(csvUrl);
    const csvText = await csvRes.text();
    const rows = parseCSV(csvText);

    // Filter for FAU users
    const fauRows = rows.filter(r => r['School']?.toLowerCase() === 'fau');
    
    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase().trim()).filter(Boolean));

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const row of fauRows) {
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

      const persona = row['Persona']?.toLowerCase().trim() || 'parent';

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
            school_code: 'fau',
            school_name: 'Florida Atlantic University',
            school: 'Florida Atlantic University',
            onboarding_completed: parseBoolean(row['Onboarding Completed']),
            is_founding_member: parseBoolean(row['Is Founding Member']),
            graduation_year: row['Graduation Year'] || '',
            major: row['Major'] || '',
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

        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      fau_rows_in_csv: fauRows.length,
      created,
      skipped,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
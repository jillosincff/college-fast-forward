import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SKIP_EMAIL = 'josinoff@gmail.com';

function parseBoolean(val) {
  if (!val) return false;
  return val.toString().trim().toLowerCase() === 'yes' || val === true;
}

function parseArray(val) {
  if (!val || !val.toString().trim()) return [];
  return val.toString().split(',').map(s => s.trim()).filter(Boolean);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin' && !user?.roles?.includes('admin')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { rows, dryRun = true } = await req.json();

    if (!rows || !Array.isArray(rows)) {
      return Response.json({ error: 'rows array required' }, { status: 400 });
    }

    // Fetch all existing users to detect duplicates
    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set((existingUsers || []).map(u => (u.email || '').toLowerCase().trim()));

    const report = {
      total: rows.length,
      willCreate: 0,
      skippedDuplicates: 0,
      skippedFounder: 0,
      missingSchool: 0,
      appleRelay: 0,
      blankNames: 0,
      foundingMembers: 0,
      errors: [],
    };

    const toCreate = [];

    for (const row of rows) {
      const email = (row['Email'] || '').toString().trim().toLowerCase();
      if (!email) { report.errors.push('Row missing email, skipped'); continue; }

      // Skip founder
      if (email === SKIP_EMAIL.toLowerCase()) { report.skippedFounder++; continue; }

      // Skip duplicates
      if (existingEmails.has(email)) { report.skippedDuplicates++; continue; }

      const isFoundingMember = parseBoolean(row['Is Founding Member']);
      const rawName = (row['Full Name'] || '').toString().trim();
      const schoolCode = (row['School'] || '').toString().trim();
      const isAppleRelay = email.includes('@privaterelay.appleid.com');
      const isBlankName = !rawName;

      if (isAppleRelay) report.appleRelay++;
      if (isBlankName) report.blankNames++;
      if (!schoolCode) report.missingSchool++;
      if (isFoundingMember) report.foundingMembers++;

      // Build user record
      const membershipTier = isFoundingMember ? 'founding_gator' : (row['Subscription Tier'] || '').toString().trim() || undefined;

      const record = {
        email,
        full_name: rawName || email,
        school_code: schoolCode || undefined,
        school: schoolCode || undefined,
        school_name: schoolCode || undefined,
        persona: (row['Persona'] || '').toString().trim() || undefined,
        membership_tier: membershipTier,
        is_founding_member: isFoundingMember,
        founding_offer_redeemed: isFoundingMember ? true : undefined,
        onboarding_completed: parseBoolean(row['Onboarding Completed']),
        graduation_year: (row['Graduation Year'] || '').toString().trim() || undefined,
        major: (row['Major'] || '').toString().trim() || undefined,
        minor: (row['Minor'] || '').toString().trim() || undefined,
        company: (row['Current Company'] || '').toString().trim() || undefined,
        current_company: (row['Current Company'] || '').toString().trim() || undefined,
        job_title: (row['Current Position'] || '').toString().trim() || undefined,
        industry: (row['Industry'] || '').toString().trim() || undefined,
        linkedin_url: (row['LinkedIn URL'] || '').toString().trim() || undefined,
        bio: (row['Bio'] || '').toString().trim() || undefined,
        expertise_areas: parseArray(row['Expertise Areas']),
        ways_to_help: parseArray(row['Help Types']),
        location_city: (row['Location City'] || '').toString().trim() || undefined,
        location_state: (row['Location State'] || '').toString().trim() || undefined,
        alumni_intent: (row['Alumni Intent'] || '').toString().trim() || undefined,
        visible_in_directory: parseBoolean(row['Visible In Directory']),
        needs_school_assignment: !schoolCode ? true : undefined,
        // Never trigger emails
        skip_welcome_email: true,
      };

      // Clean up undefined values
      Object.keys(record).forEach(k => record[k] === undefined && delete record[k]);

      toCreate.push(record);
      report.willCreate++;
    }

    if (dryRun) {
      return Response.json({
        dryRun: true,
        report,
        message: 'Dry run complete. Call again with dryRun: false to execute.',
      });
    }

    // Execute import in batches of 50
    const batchSize = 50;
    let created = 0;
    const importErrors = [];

    for (let i = 0; i < toCreate.length; i += batchSize) {
      const batch = toCreate.slice(i, i + batchSize);
      try {
        await base44.asServiceRole.entities.User.bulkCreate(batch);
        created += batch.length;
      } catch (err) {
        importErrors.push(`Batch ${i}-${i + batchSize}: ${err.message}`);
        // Try one-by-one as fallback
        for (const rec of batch) {
          try {
            await base44.asServiceRole.entities.User.create(rec);
            created++;
          } catch (e2) {
            importErrors.push(`Failed to create ${rec.email}: ${e2.message}`);
          }
        }
      }
    }

    return Response.json({
      dryRun: false,
      report,
      created,
      importErrors,
      message: `Import complete. ${created} users created.`,
    });

  } catch (error) {
    console.error('importUsersFromCSV error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
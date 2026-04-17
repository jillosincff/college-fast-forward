import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Canonical map: full lower-cased name → school_code
const NAME_TO_CODE = {
  'university of florida': 'uf',
  'university of southern california': 'usc',
  'ohio state university': 'osu',
  'ohio state': 'osu',
  'university of central florida': 'ucf',
  'university of michigan': 'umich',
  'university of delaware': 'udel',
  'university of georgia': 'uga',
  'penn state university': 'psu',
  'pennsylvania state university': 'psu',
  'penn state': 'psu',
  'tulane university': 'tulane',
  'university of maryland': 'umd',
  'florida atlantic university': 'fau',
  'florida state university': 'fsu',
  'james madison university': 'jmu',
  'university of miami': 'miami',
  'university of texas': 'utexas',
  'university of texas at austin': 'utexas',
  'university of kentucky': 'uky',
};

// Common abbreviation/alias map → school_code
const ALIAS_TO_CODE = {
  'uf': 'uf',
  'ufl': 'uf',
  'usc': 'usc',
  'osu': 'osu',
  'ucf': 'ucf',
  'umich': 'umich',
  'udel': 'udel',
  'uga': 'uga',
  'psu': 'psu',
  'tulane': 'tulane',
  'umd': 'umd',
  'fau': 'fau',
  'fsu': 'fsu',
  'jmu': 'jmu',
  'miami': 'miami',
  'utexas': 'utexas',
  'ut austin': 'utexas',
  'uky': 'uky',
  'uk': 'uky',
};

function resolveSchoolCode(user) {
  const candidates = [user.school_name, user.school, user.university].filter(Boolean);
  for (const raw of candidates) {
    const normalized = raw.toLowerCase().trim();
    // Try exact full name first
    if (NAME_TO_CODE[normalized]) return NAME_TO_CODE[normalized];
    // Try alias/abbreviation
    if (ALIAS_TO_CODE[normalized]) return ALIAS_TO_CODE[normalized];
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default true

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Only process users missing school_code
    const missing = allUsers.filter(u => !u.school_code?.trim());

    const categoryA = []; // Has school name, maps via alias (needs verification)
    const categoryB = []; // Has school name, maps cleanly via canonical name
    const categoryC = []; // No school data at all — do not touch

    for (const u of missing) {
      const hasSchoolData = !!(u.school_name || u.school || u.university)?.trim();

      if (!hasSchoolData) {
        // Category C: nothing to work with
        categoryC.push({
          id: u.id,
          email: u.email,
          persona: u.persona || null,
          created_date: u.created_date,
        });
        continue;
      }

      const candidates = [u.school_name, u.school, u.university].filter(Boolean);
      const rawValue = candidates[0]; // best available value
      const normalized = rawValue.toLowerCase().trim();

      const isCanonical = !!NAME_TO_CODE[normalized];
      const resolvedCode = resolveSchoolCode(u);

      if (!resolvedCode) {
        // Has school name but it doesn't match any known name or alias → manual review
        categoryA.push({
          id: u.id,
          email: u.email,
          persona: u.persona || null,
          raw_school_value: rawValue,
          action: 'FLAG_FOR_MANUAL_REVIEW',
        });
      } else if (isCanonical) {
        // Clean reverse-map from canonical name → safe to auto-backfill
        categoryB.push({
          id: u.id,
          email: u.email,
          persona: u.persona || null,
          raw_school_value: rawValue,
          resolved_code: resolvedCode,
          action: 'SAFE_TO_BACKFILL',
        });
      } else {
        // Matched via alias — treat same as Category A for safety, flag for review
        categoryA.push({
          id: u.id,
          email: u.email,
          persona: u.persona || null,
          raw_school_value: rawValue,
          resolved_code: resolvedCode,
          action: 'ALIAS_MATCH_NEEDS_CONFIRMATION',
        });
      }
    }

    if (dryRun) {
      return Response.json({
        mode: 'dry_run',
        summary: {
          total_missing_school_code: missing.length,
          category_b_safe_to_backfill: categoryB.length,
          category_a_needs_review: categoryA.length,
          category_c_no_data_do_not_touch: categoryC.length,
        },
        category_b_safe_to_backfill: categoryB,
        category_a_needs_manual_review: categoryA,
        category_c_no_school_data: categoryC,
      });
    }

    // Full update — only apply Category B (safe, canonical matches)
    let updated = 0, failed = 0;
    const errors = [];
    for (const u of categoryB) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, { school_code: u.resolved_code });
        updated++;
      } catch (e) {
        failed++;
        errors.push({ email: u.email, error: e.message });
      }
    }

    return Response.json({
      mode: 'full_update',
      summary: {
        total_missing_school_code: missing.length,
        updated,
        failed,
        category_a_skipped_needs_review: categoryA.length,
        category_c_skipped_no_data: categoryC.length,
      },
      category_a_needs_manual_review: categoryA,
      category_c_no_school_data: categoryC,
      errors,
    });

  } catch (e) {
    console.error('backfillAlumniSchoolCode error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
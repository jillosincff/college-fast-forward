import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const SCHOOL_NAMES = {
  'uf': 'University of Florida',
  'usc': 'University of Southern California',
  'osu': 'Ohio State University',
  'ucf': 'University of Central Florida',
  'umich': 'University of Michigan',
  'udel': 'University of Delaware',
  'uga': 'University of Georgia',
  'psu': 'Penn State University',
  'tulane': 'Tulane University',
  'umd': 'University of Maryland',
  'fau': 'Florida Atlantic University',
  'fsu': 'Florida State University',
  'jmu': 'James Madison University',
  'miami': 'University of Miami',
  'utexas': 'University of Texas',
  'uky': 'University of Kentucky',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);
    const toUpdate = allUsers.filter(u => {
      const school = u.school?.toLowerCase?.() ?? '';
      return SCHOOL_NAMES[school] !== undefined && u.school !== SCHOOL_NAMES[school];
    });

    console.log(`Found ${toUpdate.length} users with short school codes to normalize`);

    const results = { updated: 0, errors: 0 };

    for (const u of toUpdate) {
      const normalized = SCHOOL_NAMES[u.school.toLowerCase()];
      try {
        await base44.asServiceRole.entities.User.update(u.id, { school: normalized });
        console.log(`Updated ${u.email}: "${u.school}" -> "${normalized}"`);
        results.updated++;
      } catch (e) {
        console.error(`Failed ${u.email}:`, e.message);
        results.errors++;
      }
    }

    // Verify
    const remaining = (await base44.asServiceRole.entities.User.list('-created_date', 2000))
      .filter(u => {
        const s = u.school?.toLowerCase?.() ?? '';
        return SCHOOL_NAMES[s] && u.school !== SCHOOL_NAMES[s];
      });

    console.log(`Remaining short-code records: ${remaining.length}`);

    return Response.json({ success: true, results, remaining: remaining.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
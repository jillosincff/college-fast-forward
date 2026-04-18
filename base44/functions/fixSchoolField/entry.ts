import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_NAMES = {
  uf:     'University of Florida',
  ufl:    'University of Florida',
  usc:    'University of Southern California',
  osu:    'Ohio State University',
  ucf:    'University of Central Florida',
  umich:  'University of Michigan',
  udel:   'University of Delaware',
  uga:    'University of Georgia',
  psu:    'Penn State University',
  tulane: 'Tulane University',
  umd:    'University of Maryland',
  fau:    'Florida Atlantic University',
  fsu:    'Florida State University',
  jmu:    'James Madison University',
  miami:  'University of Miami',
  utexas: 'University of Texas',
  uky:    'University of Kentucky',
  ucb:    'University of California, Berkeley',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const dry_run = body.dry_run !== false;

    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);

    // Find users where school is missing OR is still a raw code (not a full name)
    const knownCodes = new Set(Object.keys(SCHOOL_NAMES));
    const needsFix = users.filter(u => {
      if (!u.school_code) return false;
      const code = u.school_code.toLowerCase();
      const schoolName = SCHOOL_NAMES[code];
      if (!schoolName) return false;
      // Needs fix if school is blank OR school is still the raw code
      return !u.school || u.school === u.school_code || knownCodes.has((u.school || '').toLowerCase());
    });

    const breakdown = {};
    for (const u of needsFix) {
      const code = u.school_code.toLowerCase();
      const name = SCHOOL_NAMES[code] || u.school_code;
      breakdown[code] = (breakdown[code] || 0) + 1;
    }

    if (dry_run) {
      return Response.json({ mode: 'dry_run', total: needsFix.length, breakdown });
    }

    const batchSize = 25;
    const offset = body.offset || 0;
    const limit = body.limit || 50;
    const chunk = needsFix.slice(offset, offset + limit);
    let updated = 0;

    for (let i = 0; i < chunk.length; i++) {
      const u = chunk[i];
      const code = u.school_code.toLowerCase();
      const schoolName = SCHOOL_NAMES[code] || u.school_code;
      await base44.asServiceRole.entities.User.update(u.id, { school: schoolName });
      updated++;
      await new Promise(r => setTimeout(r, 400));
      if ((i + 1) % 10 === 0) console.log(`Progress: ${updated}/${chunk.length}`);
    }

    return Response.json({
      mode: 'full_run',
      offset,
      limit,
      chunk_size: chunk.length,
      total_needing_fix: needsFix.length,
      updated,
      next_offset: offset + limit < needsFix.length ? offset + limit : null,
    });

  } catch (e) {
    console.error('fixSchoolField error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
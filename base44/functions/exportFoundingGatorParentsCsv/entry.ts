import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Read-only admin export: founding_gator parents who have a ParentNetworkProfile.
// Match on email first, then name only if no email match. Returns the CSV string
// plus match stats; the admin dashboard triggers a browser download from the
// Revenue section. Never mutates any record.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !(user.role === 'admin' || user.roles?.includes('admin'))) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }
    const db = base44.asServiceRole.entities;
    const [users, pnp] = await Promise.all([
      db.User.list('-created_date', 5000),
      db.ParentNetworkProfile.list('-created_date', 5000),
    ]);
    const userList = Array.isArray(users) ? users : (users?.data || []);
    const pnpList = Array.isArray(pnp) ? pnp : (pnp?.data || []);

    const fg = userList.filter(u => u.membership_tier === 'founding_gator');
    const isParent = u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
    const isStudent = u => u.persona === 'student' || (Array.isArray(u.roles) && u.roles.includes('student'));
    const fgParents = fg.filter(isParent);
    // "other" = the cohort reported as ~211 in the prior audit: not parent and
    // not student (role-aware; 'gator' persona falls here because isStudent
    // checks 'student' only — same definition as that report).
    const fgOther = fg.filter(u => !isParent(u) && !isStudent(u));

    const pnpByName = new Map();
    const pnpByEmail = new Map();
    for (const p of pnpList) {
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().trim();
      if (name) pnpByName.set(name, p);
      const em = (p.email || p.contact_email || '').toLowerCase().trim();
      if (em) pnpByEmail.set(em, p);
    }

    const esc = v => {
      if (v == null) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const header = ['name', 'email', 'match_type', 'industry', 'company', 'job title', "school/kid's school", 'city'];
    const rows = [];
    for (const u of fgParents) {
      let match = null, mt = null;
      const em = (u.email || '').toLowerCase().trim();
      if (em && pnpByEmail.has(em)) { match = pnpByEmail.get(em); mt = 'email'; }
      else {
        const name = (u.full_name || '').toLowerCase().trim();
        if (name && pnpByName.has(name)) { match = pnpByName.get(name); mt = 'name'; }
      }
      if (!match) continue;
      const industry = u.industry || (Array.isArray(u.preferred_industries) ? u.preferred_industries[0] : '') || u.preferred_industry || '';
      const company = match.company_name || u.company || '';
      const jobTitle = match.role_title || u.role_title || '';
      const school = match.school_code || u.school_code || u.school_name || u.school || '';
      const city = u.city || u.location || '';
      rows.push([u.full_name || `${match.first_name} ${match.last_name}`, u.email || '', mt, industry, company, jobTitle, school, city]);
    }
    const csv = [header.map(esc).join(',')].concat(rows.map(r => r.map(esc).join(','))).join('\n');

    // Of the "other" cohort, how many are really parents: by role, or by a
    // linked ParentNetworkProfile (name match). Role-parents are already in
    // fgParents by construction, so this is effectively the PNP-match count.
    let otherReallyParents = 0, otherByRole = 0, otherByPnp = 0;
    for (const u of fgOther) {
      if (Array.isArray(u.roles) && u.roles.includes('parent')) { otherByRole++; otherReallyParents++; continue; }
      const name = (u.full_name || '').toLowerCase().trim();
      if (name && pnpByName.has(name)) { otherByPnp++; otherReallyParents++; }
    }

    return Response.json({
      csv,
      count: rows.length,
      emailMatches: rows.filter(r => r[2] === 'email').length,
      nameMatches: rows.filter(r => r[2] === 'name').length,
      otherTotal: fgOther.length,
      otherReallyParents,
      otherByRole,
      otherByPnp,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('exportFoundingGatorParentsCsv error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
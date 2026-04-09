import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.persona !== 'parent') {
      return Response.json({ error: 'Only parents can search for students' }, { status: 403 });
    }

    const { firstName, lastName } = await req.json();

    if (!firstName || !lastName) {
      return Response.json({ error: 'First and last name required' }, { status: 400 });
    }

    const normalizedFirst = firstName.trim().toLowerCase();
    const normalizedLast = lastName.trim().toLowerCase();

    // Search students at same school only
    const allStudents = await base44.asServiceRole.entities.User.filter({
      persona: 'student',
      school_code: user.school_code,
    });

    // Match on name — case insensitive
    const matches = (allStudents || []).filter(s => {
      const first = (s.first_name || '').toLowerCase().trim();
      const last = (s.last_name || '').toLowerCase().trim();
      const fullName = (s.full_name || '').toLowerCase().trim();

      const firstMatch = first === normalizedFirst ||
                         fullName.startsWith(normalizedFirst);
      const lastMatch = last === normalizedLast ||
                        fullName.endsWith(normalizedLast);

      return firstMatch && lastMatch;
    });

    // Never expose emails — return privacy-safe results only
    const safeResults = matches.map(s => ({
      id: s.id,
      first_name: s.first_name || s.full_name?.split(' ')[0] || '',
      last_name: s.last_name || s.full_name?.split(' ').slice(-1)[0] || '',
      school_name: s.school_name || '',
      avatar_initials: `${(s.first_name || ' ')[0]}${(s.last_name || ' ')[0]}`.toUpperCase(),
      already_has_fastiq: !!(
        s.fastiq_setup_complete ||
        s.subscription_status === 'active' ||
        s.membership_tier === 'fastiq' ||
        s.trial_status === 'active' ||
        s.fastiq_trial_active === true
      ),
    }));

    return Response.json({
      success: true,
      matches: safeResults,
      count: safeResults.length,
    });

  } catch (e) {
    console.error('findStudentOnCFF error:', e.message);
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
});
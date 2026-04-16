import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list();

    const ucfKeywords = ['ucf', 'university of central florida', 'central florida'];

    const ucfUsers = (allUsers || []).filter(u => {
      const fields = [
        u.university,
        u.school_name,
        u.school_code,
        u.invite_code_used,
        u.email,
      ].map(f => (f || '').toLowerCase());

      return ucfKeywords.some(kw => fields.some(f => f.includes(kw)));
    });

    return Response.json({
      total: allUsers.length,
      ucfCount: ucfUsers.length,
      ucfUsers: ucfUsers.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        university: u.university,
        school_name: u.school_name,
        school_code: u.school_code,
        invite_code_used: u.invite_code_used,
        persona: u.persona,
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
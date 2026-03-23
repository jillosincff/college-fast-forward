import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      company, role, industry, location, offer_type,
      base_salary, signing_bonus, hourly_rate, housing_stipend,
      how_they_got_it
    } = body;

    if (!company || !role || !offer_type) {
      return Response.json({ error: 'Missing required fields: company, role, offer_type' }, { status: 400 });
    }

    // Step 1: Award karma BEFORE stripping user identity
    let karmaResult = null;
    try {
      karmaResult = await base44.functions.invoke('awardStudentKarma', {
        userId: user.id,
        userEmail: user.email,
        actionType: 'share_salary',
        description: `Shared anonymous salary data for ${role} at ${company}`
      });
    } catch (e) {
      console.log('Karma award failed (non-critical):', e.message);
    }

    // Step 2: Create the salary report anonymously via service role
    // No user_id, no created_by linkage — truly anonymous
    const report = await base44.asServiceRole.entities.SalaryReport.create({
      company: company.trim(),
      role: role.trim(),
      industry: industry || '',
      location: location || '',
      offer_type,
      base_salary: base_salary || null,
      signing_bonus: signing_bonus || null,
      hourly_rate: hourly_rate || null,
      housing_stipend: housing_stipend || null,
      how_they_got_it: how_they_got_it || '',
      submitted_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      karma_awarded: 25,
      karma_result: karmaResult?.data || null,
    });
  } catch (error) {
    console.error('submitSalaryReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
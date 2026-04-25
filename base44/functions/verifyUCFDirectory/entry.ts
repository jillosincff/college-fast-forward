import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const allUCFUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const ucfUsers = allUCFUsers.filter(u => u.school_code === 'ucf');

    const directoryEligible = ucfUsers.filter(u => {
      const isParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const isAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      const isStudent = u.persona === 'gator' || u.persona === 'student' || (Array.isArray(u.roles) && (u.roles.includes('gator') || u.roles.includes('student')));
      
      if (!isParent && !isAlumni && !isStudent) return false;
      if (u.visible_in_directory === false) return false;
      
      const hasName = !!(u.full_name || u.first_name);
      if (!hasName) return false;

      const company = u.company || u.current_company;
      const industry = u.industry;
      const isFounding = u.is_founding_member === true;
      
      if (isParent || isAlumni) {
        return !!(hasName && (u.onboarding_completed || company || u.job_title || u.current_position || isFounding));
      }
      return !!(hasName && (company || industry || u.onboarding_completed));
    });

    return Response.json({
      success: true,
      total_ucf_users: ucfUsers.length,
      directory_eligible: directoryEligible.length,
      parents_eligible: directoryEligible.filter(u => u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'))).length,
      alumni_eligible: directoryEligible.filter(u => u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'))).length,
      sample: directoryEligible.slice(0, 5).map(u => ({
        email: u.email,
        name: u.full_name,
        persona: u.persona,
        company: u.company || u.current_company,
        onboarding: u.onboarding_completed,
        founding: u.is_founding_member
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
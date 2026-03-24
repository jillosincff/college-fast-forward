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
  'uky': 'University of Kentucky'
};

const normalizeSchool = (s) =>
  SCHOOL_NAMES[s?.toLowerCase?.()?.trim?.()] ||
  s?.trim?.() || '';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id } = await req.json();

    if (student_id !== user.id) {
      return Response.json({ error: 'Can only fetch own leads' }, { status: 403 });
    }

    const student = await base44.asServiceRole.entities.User.get(student_id);

    if (!student) {
      return Response.json({ redHot: [], redHotFallback: [], redHotTotal: 0, error: 'Student not found' });
    }

    const studentSchool = normalizeSchool(student.school || student.university || '');

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    // Only same-school CFF members (parents + willing alumni)
    const sameSchoolMembers = allUsers.filter(u => {
      if (u.id === student_id) return false;
      if (u.show_in_directory === false) return false;
      const ms = normalizeSchool(u.school || u.university || '');
      if (ms !== studentSchool || ms === '') return false;
      return (
        u.persona === 'parent' ||
        u.roles?.includes('parent') ||
        (
          u.persona === 'alumni' &&
          (
            u.alumni_intent === 'giving_help' ||
            u.help_types?.includes('career') ||
            u.intro_availability === 'happy_to_help'
          )
        )
      );
    });

    // Industry/role matching from student's career goals
    const careerGoals = student.career_goals || {};
    const industries = [
      ...(Array.isArray(careerGoals.target_industries) ? careerGoals.target_industries : [careerGoals.target_industries].filter(Boolean)),
      ...(Array.isArray(student.target_industries) ? student.target_industries : [student.target_industries].filter(Boolean)),
    ];
    const roles = [
      ...(Array.isArray(careerGoals.target_roles) ? careerGoals.target_roles : [careerGoals.target_roles].filter(Boolean)),
      ...(Array.isArray(student.target_roles) ? student.target_roles : [student.target_roles].filter(Boolean)),
    ];

    const scoreMatch = (member) => {
      const text = [
        member.industry, member.industries, member.job_title,
        member.current_role, member.current_position,
        member.company, member.current_company,
        member.expertise_areas, member.bio
      ].filter(Boolean).join(' ').toLowerCase();

      const keywords = [...industries, ...roles]
        .map(k => k?.toLowerCase?.())
        .filter(Boolean);

      return keywords.filter(k => text.includes(k)).length;
    };

    const mapMember = (u) => ({
      id: u.id,
      full_name: u.full_name || u.name || '',
      job_title: u.job_title || u.current_role || u.current_position || '',
      company: u.company || u.current_company || u.employer || '',
      industry: u.industry || '',
      school: normalizeSchool(u.school || u.university || ''),
      persona: u.persona,
      email: u.email,
      linkedin_url: u.linkedin_url || '',
      intro_availability: u.intro_availability || 'happy_to_help',
      match_score: scoreMatch(u)
    });

    // RED HOT — same school, matched by career goals
    const redHot = sameSchoolMembers
      .filter(u => scoreMatch(u) > 0)
      .sort((a, b) => scoreMatch(b) - scoreMatch(a))
      .slice(0, 20)
      .map(mapMember);

    // Fallback: same-school members when no exact keyword matches (show all, sorted best-effort)
    const redHotFallback = redHot.length === 0
      ? sameSchoolMembers
          .sort((a, b) => scoreMatch(b) - scoreMatch(a))
          .slice(0, 10)
          .map(mapMember)
      : [];

    return Response.json({
      redHot,
      redHotFallback,
      redHotTotal: redHot.length + redHotFallback.length,
      studentSchool,
      debug: {
        totalUsersInDB: allUsers.length,
        sameSchoolTotal: sameSchoolMembers.length,
        studentSchool,
        studentIndustries: industries,
        studentRoles: roles
      }
    });
  } catch (error) {
    console.error('getLeadsForStudent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
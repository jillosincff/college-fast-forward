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
  SCHOOL_NAMES[s?.toLowerCase?.()?.trim?.()] || s?.trim?.() || '';

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

    // Multi-school support: use schools array if available
    const studentSchools = Array.isArray(student.schools) && student.schools.length > 0
      ? student.schools.map(s => normalizeSchool(s)).filter(Boolean)
      : [studentSchool].filter(Boolean);
    // Always include primary school
    if (studentSchool && !studentSchools.includes(studentSchool)) {
      studentSchools.push(studentSchool);
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    // Career goals for keyword matching
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

    // Which schools does this student share with the member?
    const getSharedSchools = (member) => {
      const ms = normalizeSchool(member.school || member.university || '');
      const memberSchools = Array.isArray(member.schools) && member.schools.length > 0
        ? member.schools.map(s => normalizeSchool(s)).filter(Boolean)
        : [ms].filter(Boolean);
      return studentSchools.filter(ss => memberSchools.includes(ss) || ss === ms);
    };

    const mapMember = (member) => {
      const shared = getSharedSchools(member);
      return {
        id: member.id,
        full_name: member.full_name || member.name || '',
        job_title: member.job_title || member.current_role || member.current_position || '',
        company: member.company || member.current_company || member.employer || '',
        industry: member.industry || '',
        school: normalizeSchool(member.school || member.university || ''),
        shared_schools: shared,
        persona: member.persona,
        email: member.email,
        linkedin_url: member.linkedin_url || '',
        intro_availability: member.intro_availability || 'happy_to_help',
        match_score: scoreMatch(member) + (shared.length > 1 ? 2 : 0)
      };
    };

    // Only same-school CFF members (parents + willing alumni) across all affiliated schools
    const sameSchoolMembers = allUsers.filter(u => {
      if (u.id === student_id) return false;
      if (u.show_in_directory === false) return false;
      const ms = normalizeSchool(u.school || u.university || '');
      if (!studentSchools.includes(ms) || ms === '') return false;
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

    // RED HOT — any affiliated school, matched by career goals
    const redHot = sameSchoolMembers
      .filter(u => scoreMatch(u) > 0)
      .sort((a, b) => (scoreMatch(b) + (getSharedSchools(b).length > 1 ? 2 : 0)) - (scoreMatch(a) + (getSharedSchools(a).length > 1 ? 2 : 0)))
      .slice(0, 20)
      .map(mapMember);

    // Fallback: same-school members when no exact keyword matches
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
      studentSchools,
      debug: {
        totalUsersInDB: allUsers.length,
        sameSchoolTotal: sameSchoolMembers.length,
        studentSchool,
        studentSchools,
        studentIndustries: industries,
        studentRoles: roles
      }
    });
  } catch (error) {
    console.error('getLeadsForStudent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
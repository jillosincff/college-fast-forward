export default async function getLeadsForStudent(
  { student_id }, 
  context
) {
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

  // Get the student
  const student = await context.db.User.findOne({
    id: student_id
  });

  if (!student) {
    return {
      redHot: [],
      hot: [],
      redHotTotal: 0,
      hotTotal: 0,
      error: 'Student not found'
    };
  }

  const studentSchool = normalizeSchool(
    student.school || student.university || ''
  );

  // Fetch ALL users server-side (backend has permission)
  const allUsers = await context.db.User.find({});

  // CFF members = parents + giving_help alumni
  const cffMembers = allUsers.filter(u =>
    u.id !== student_id &&
    u.show_in_directory !== false &&
    (
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
    )
  );

  // Industry/role matching
  const industries = Array.isArray(student.target_industries)
    ? student.target_industries
    : [student.target_industries].filter(Boolean);

  const roles = Array.isArray(student.target_roles)
    ? student.target_roles
    : [student.target_roles].filter(Boolean);

  const scoreMatch = (member) => {
    const text = [
      member.industry,
      member.industries,
      member.job_title,
      member.current_role,
      member.current_position,
      member.company,
      member.current_company,
      member.expertise_areas,
      member.bio
    ].filter(Boolean).join(' ').toLowerCase();

    const keywords = [...industries, ...roles]
      .map(k => k?.toLowerCase?.())
      .filter(Boolean);

    return keywords.filter(k => text.includes(k)).length;
  };

  // RED HOT — same school
  const redHot = cffMembers
    .filter(u => {
      const ms = normalizeSchool(u.school || u.university || '');
      return ms === studentSchool && ms !== '';
    })
    .sort((a, b) => scoreMatch(b) - scoreMatch(a))
    .slice(0, 20)
    .map(u => ({
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
    }));

  // HOT — different school
  const hot = cffMembers
    .filter(u => {
      const ms = normalizeSchool(u.school || u.university || '');
      return ms !== studentSchool && ms !== '';
    })
    .sort((a, b) => scoreMatch(b) - scoreMatch(a))
    .slice(0, 20)
    .map(u => ({
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
    }));

  return {
    redHot,
    hot,
    redHotTotal: redHot.length,
    hotTotal: hot.length,
    studentSchool,
    debug: {
      totalUsersInDB: allUsers.length,
      totalCffMembers: cffMembers.length,
      studentSchool,
      studentIndustries: industries,
      studentRoles: roles
    }
  };
}
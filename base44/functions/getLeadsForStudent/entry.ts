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

const normalizeSchool = (school) =>
  SCHOOL_NAMES[school?.toLowerCase?.()?.trim?.()] ||
  school?.trim?.() || '';

const scoreMatch = (member, goals) => {
  const text = [
    member.industry,
    member.industries,
    member.job_title,
    member.current_role,
    member.company
  ].filter(Boolean).join(' ').toLowerCase();

  return [
    ...(goals.industries || []),
    ...(goals.roles || [])
  ].filter(k => k && text.includes(k.toLowerCase())).length;
};

export async function getLeadsForStudent({ student_id }) {
  try {
    const base44 = createClientFromRequest(request);
    const user = await base44.auth.me();

    if (!user || user.id !== student_id) {
      return { error: 'Unauthorized', redHot: [], hot: [], warm: [] };
    }

    // Get student record
    const student = await base44.asServiceRole.entities.User.get(student_id);
    if (!student) {
      return { error: 'Student not found', redHot: [], hot: [], warm: [] };
    }

    const studentSchool = normalizeSchool(student.school || student.university);

    // Get ALL users — backend has permission
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 2000);

    // Filter to CFF members only (parents + alumni giving help)
    const cffMembers = allUsers.filter(u =>
      u.id !== student_id &&
      u.show_in_directory !== false &&
      u.onboarding_completed !== false &&
      (
        u.persona === 'parent' ||
        u.roles?.includes('parent') ||
        (u.persona === 'alumni' && u.alumni_intent === 'giving_help')
      )
    );

    // RED HOT — same school
    const redHot = cffMembers.filter(u => {
      const memberSchool = normalizeSchool(u.school || u.university || '');
      return memberSchool === studentSchool && memberSchool !== '';
    });

    // HOT — different school, has school value
    const hot = cffMembers.filter(u => {
      const memberSchool = normalizeSchool(u.school || u.university || '');
      return memberSchool !== studentSchool && memberSchool !== '';
    });

    // Goals for scoring
    const goals = {
      industries: student.target_industries || [],
      roles: student.target_roles || []
    };

    // Sort both by industry relevance
    redHot.sort((a, b) => scoreMatch(b, goals) - scoreMatch(a, goals));
    hot.sort((a, b) => scoreMatch(b, goals) - scoreMatch(a, goals));

    return {
      redHot: redHot.slice(0, 20),
      hot: hot.slice(0, 20),
      redHotTotal: redHot.length,
      hotTotal: hot.length,
      studentSchool,
      success: true
    };
  } catch (error) {
    console.error('getLeadsForStudent error:', error);
    return { error: error.message, redHot: [], hot: [], warm: [] };
  }
}

Deno.serve(async (req) => {
  try {
    const { student_id } = await req.json();
    const result = await getLeadsForStudent({ student_id });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
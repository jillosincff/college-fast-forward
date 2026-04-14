import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SAFE_STUDENT_FIELDS = ['id', 'first_name', 'last_name_initial', 'persona', 'school_name', 'school_code', 'graduation_year', 'major'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();

    if (!currentUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only parents and alumni can search for students
    const isParent = currentUser.persona === 'parent' || currentUser.roles?.includes('parent');
    const isAlumni = currentUser.persona === 'alumni' || currentUser.roles?.includes('alumni');
    const isAdmin = currentUser.role === 'admin' || currentUser.roles?.includes('admin');

    if (!isParent && !isAlumni && !isAdmin) {
      return Response.json({ error: 'Only parents and alumni can search for students' }, { status: 403 });
    }

    // School isolation — only search within current user's school
    const userSchoolCode = currentUser.school_code || currentUser.school || currentUser.university;
    if (!userSchoolCode && !isAdmin) {
      return Response.json({ error: 'School not set on your profile. Please complete your profile first.' }, { status: 400 });
    }

    const { query } = await req.json();

    if (!query || query.trim().length < 2) {
      return Response.json({ error: 'Search query too short' }, { status: 400 });
    }

    const searchTerm = query.trim().toLowerCase();
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);

    // Fetch users in batches to cover the full database
    let allUsers = [];
    let offset = 0;
    const batchSize = 500;

    while (true) {
      const batch = await base44.asServiceRole.entities.User.list('-created_date', batchSize, offset);
      if (!batch || batch.length === 0) break;
      allUsers = allUsers.concat(batch);
      if (batch.length < batchSize) break;
      offset += batchSize;
      if (allUsers.length >= 5000) break;
    }

    console.log(`[searchGatorStudents] Total users fetched: ${allUsers.length}, query: "${searchTerm}"`);

    // Filter for students matching the search
    const results = allUsers.filter(u => {
      const uIsParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const uIsAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (uIsParent || uIsAlumni) return false;

      const email = (u.email || '').toLowerCase();
      const fullName = (u.full_name || '').toLowerCase();
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      const nameParts = fullName.split(/[\s,]+/).filter(p => p.length > 0);

      if (email.includes(searchTerm)) return true;
      if (fullName.includes(searchTerm)) return true;
      if (firstName.includes(searchTerm)) return true;
      if (lastName.includes(searchTerm)) return true;

      const anyWordMatch = searchWords.some(word =>
        email.includes(word) ||
        fullName.includes(word) ||
        firstName.includes(word) ||
        lastName.includes(word) ||
        nameParts.some(part => part.includes(word) || word.includes(part))
      );
      if (anyWordMatch) return true;

      if (searchWords.length > 1) {
        const allWordsMatch = searchWords.every(word =>
          email.includes(word) ||
          fullName.includes(word) ||
          firstName.includes(word) ||
          lastName.includes(word) ||
          nameParts.some(part => part.includes(word))
        );
        if (allWordsMatch) return true;
      }

      return false;
    });

    console.log(`[searchGatorStudents] Found ${results.length} matches for "${searchTerm}"`);

    // School isolation — only return students from the same school, then strip all PII
    const safeResults = results
      .filter(u => {
        if (isAdmin) return true;
        const uSchool = u.school_code || u.school || u.university || '';
        return uSchool.toLowerCase().trim() === userSchoolCode.toLowerCase().trim();
      })
      .map(u => ({
        id: u.id,
        first_name: u.first_name || (u.full_name || '').split(' ')[0] || '',
        last_name_initial: (u.last_name || (u.full_name || '').split(' ').slice(1).join(' '))?.[0] || '',
        persona: u.persona,
        school_name: u.school_name || u.school || u.university || '',
        school_code: u.school_code || '',
        graduation_year: u.graduation_year || u.grad_year || '',
        major: u.major || '',
      }));

    return Response.json({
      success: true,
      students: safeResults,
      count: safeResults.length
    });

  } catch (error) {
    console.error('Search students error:', error);
    return Response.json({
      error: 'Failed to search students'
    }, { status: 500 });
  }
});
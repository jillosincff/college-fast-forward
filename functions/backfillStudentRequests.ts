import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can run this backfill
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Unauthorized - admin only' }, { status: 401 });
    }

    // Get all users who are students/gators and opted into directory
    const allUsers = await base44.asServiceRole.entities.User.list();
    const students = allUsers.filter(u => {
      const isStudent = u.persona === 'gator' || 
                       u.roles?.includes('gator') || 
                       u.email?.toLowerCase().endsWith('@ufl.edu');
      const hasContent = u.full_name || u.first_name || u.bio || u.major;
      return isStudent && hasContent;
    });

    // Get all existing job requests
    const existingRequests = await base44.asServiceRole.entities.JobRequest.list();
    const emailsWithRequests = new Set(existingRequests.map(r => r.created_by?.toLowerCase()));

    // Find students without job requests
    const studentsWithoutRequests = students.filter(s => 
      !emailsWithRequests.has(s.email?.toLowerCase())
    );

    const created = [];
    const errors = [];

    for (const student of studentsWithoutRequests) {
      try {
        // Build name
        const firstName = student.first_name || student.full_name?.split(' ')[0] || '';
        const lastName = student.last_name || student.full_name?.split(' ').slice(1).join(' ') || '';
        const fullName = (firstName && lastName) ? `${firstName} ${lastName}` : student.full_name || 'Student';

        // Infer role and description from profile
        let role = 'Seeking Opportunities';
        let description = '';
        let targetIndustry = student.major || 'Any';

        if (student.bio) {
          description = student.bio;
        } else if (student.major) {
          description = `Looking for opportunities in ${student.major}. Open to connecting with alumni and parents who can help with career guidance.`;
        } else {
          description = 'Open to opportunities and career guidance. Please reach out to learn more about my interests and goals.';
        }

        // Try to infer job type from bio
        let jobType = 'full_time';
        const bioLower = (student.bio || '').toLowerCase();
        if (bioLower.includes('internship') || bioLower.includes('intern')) {
          jobType = 'internship';
          role = 'Seeking Internship';
        } else if (bioLower.includes('full-time') || bioLower.includes('full time')) {
          jobType = 'full_time';
          role = 'Seeking Full-time Role';
        }

        // Create draft job request
        const newRequest = await base44.asServiceRole.entities.JobRequest.create({
          role: role,
          title: `${fullName} - ${role}`,
          description: description,
          target_industry: targetIndustry,
          job_type: jobType,
          role_type: jobType,
          status: 'draft',
          poster_name: fullName,
          poster_first_name: firstName,
          poster_last_name: lastName,
          poster_profile_image: student.profile_image || null,
          linkedin_url: student.linkedin_url || null,
          created_by: student.email
        });

        created.push({
          email: student.email,
          name: fullName,
          requestId: newRequest.id
        });

      } catch (err) {
        errors.push({
          email: student.email,
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      summary: {
        totalStudents: students.length,
        existingRequests: emailsWithRequests.size,
        studentsWithoutRequests: studentsWithoutRequests.length,
        created: created.length,
        errors: errors.length
      },
      created,
      errors
    });

  } catch (error) {
    console.error('Backfill error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
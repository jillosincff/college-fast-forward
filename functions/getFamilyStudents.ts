import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let students = [];
    
    // Method 1: Load by linked_students IDs
    if (user.linked_students && user.linked_students.length > 0) {
      console.log('Loading students by linked_students IDs:', user.linked_students);
      
      for (const studentId of user.linked_students) {
        try {
          const matches = await base44.asServiceRole.entities.User.filter({ id: studentId });
          if (matches && matches.length > 0) {
            const student = matches[0];
            students.push({
              id: student.id,
              full_name: student.full_name,
              email: student.email,
              major: student.major,
              persona: student.persona,
              roles: student.roles,
              family_group_id: student.family_group_id,
              profile_image: student.profile_image
            });
          }
        } catch (e) {
          console.log('Could not load student by ID:', studentId, e.message);
        }
      }
    }
    
    // Method 2: Load by family_group_id if no linked_students found
    if (students.length === 0 && user.family_group_id) {
      console.log('Loading students by family_group_id:', user.family_group_id);
      
      const familyMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: user.family_group_id
      });
      
      students = familyMembers
        .filter(m => (m.persona === 'gator' || m.roles?.includes('gator')) && m.id !== user.id)
        .map(student => ({
          id: student.id,
          full_name: student.full_name,
          email: student.email,
          major: student.major,
          persona: student.persona,
          roles: student.roles,
          family_group_id: student.family_group_id,
          profile_image: student.profile_image
        }));
    }
    
    // Method 3: Legacy student_emails
    if (students.length === 0 && user.student_emails && user.student_emails.length > 0) {
      console.log('Loading students by student_emails:', user.student_emails);
      
      for (const email of user.student_emails) {
        try {
          const matches = await base44.asServiceRole.entities.User.filter({ email });
          if (matches && matches.length > 0) {
            const student = matches[0];
            students.push({
              id: student.id,
              full_name: student.full_name,
              email: student.email,
              major: student.major,
              persona: student.persona,
              roles: student.roles,
              family_group_id: student.family_group_id,
              profile_image: student.profile_image
            });
          }
        } catch (e) {
          console.log('Could not load student by email:', email, e.message);
        }
      }
    }
    
    return Response.json({
      success: true,
      students,
      debug: {
        linked_students: user.linked_students,
        family_group_id: user.family_group_id,
        student_emails: user.student_emails
      }
    });
    
  } catch (error) {
    console.error('getFamilyStudents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow checking without auth for debugging
    const { studentEmail, parentEmail } = await req.json();
    
    // Get all users to check link status
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    let studentData = null;
    let parentData = null;
    
    if (studentEmail) {
      studentData = allUsers.find(u => u.email?.toLowerCase() === studentEmail.toLowerCase());
    }
    
    if (parentEmail) {
      parentData = allUsers.find(u => u.email?.toLowerCase() === parentEmail.toLowerCase());
    }
    
    return Response.json({
      student: studentData ? {
        id: studentData.id,
        email: studentData.email,
        full_name: studentData.full_name,
        persona: studentData.persona,
        roles: studentData.roles,
        family_group_id: studentData.family_group_id,
        parent_id: studentData.parent_id,
        parent_1_id: studentData.parent_1_id,
        parent_2_id: studentData.parent_2_id
      } : null,
      parent: parentData ? {
        id: parentData.id,
        email: parentData.email,
        full_name: parentData.full_name,
        persona: parentData.persona,
        roles: parentData.roles,
        family_group_id: parentData.family_group_id,
        student_emails: parentData.student_emails,
        linked_students: parentData.linked_students
      } : null
    });
    
  } catch (error) {
    console.error('Check family link error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only parents can link students
    if (user.persona !== 'parent' && !user.roles?.includes('parent')) {
      return Response.json({ error: 'Only parents can link students' }, { status: 403 });
    }
    
    const { studentEmailsOrNames } = await req.json();
    
    if (!studentEmailsOrNames || !Array.isArray(studentEmailsOrNames) || studentEmailsOrNames.length === 0) {
      return Response.json({ error: 'Missing student emails or names' }, { status: 400 });
    }
    
    const linkedStudentIds = [];
    const results = [];
    
    // Get or create family_group_id for parent FIRST
    let familyGroupId = user.family_group_id;
    if (!familyGroupId) {
      familyGroupId = `family_${user.id}_${Date.now()}`;
      // Update parent with family_group_id immediately
      await base44.asServiceRole.entities.User.update(user.id, {
        family_group_id: familyGroupId
      });
    }
    
    // Search for each student
    for (const searchTerm of studentEmailsOrNames) {
      const trimmed = searchTerm.trim().toLowerCase();
      if (!trimmed) continue;
      
      try {
        // Get all users
        const allUsers = await base44.asServiceRole.entities.User.list();
        
        // Find matching students
        const matchedStudent = allUsers.find(u => {
          const isGator = u.persona === 'gator' || u.roles?.includes('gator') || u.email?.toLowerCase().endsWith('@ufl.edu');
          if (!isGator) return false;
          
          // Match by email or name
          if (u.email?.toLowerCase() === trimmed) return true;
          if (u.full_name?.toLowerCase().includes(trimmed)) return true;
          if (u.email?.toLowerCase().includes(trimmed)) return true;
          
          return false;
        });
        
        if (matchedStudent) {
          // Link student to parent via family_group_id
          // Update student's linked_parent_emails and linked_parent_ids arrays
          const studentParentEmails = matchedStudent.linked_parent_emails || [];
          const studentParentIds = matchedStudent.linked_parent_ids || [];
          
          if (!studentParentEmails.includes(user.email)) {
            studentParentEmails.push(user.email);
          }
          if (!studentParentIds.includes(user.id)) {
            studentParentIds.push(user.id);
          }
          
          await base44.asServiceRole.entities.User.update(matchedStudent.id, {
            parent_id: user.id,
            family_group_id: familyGroupId,
            linked_parent_emails: studentParentEmails,
            linked_parent_ids: studentParentIds
          });
          
          linkedStudentIds.push(matchedStudent.id);
          
          results.push({
            searchTerm,
            found: true,
            student: {
              id: matchedStudent.id,
              name: matchedStudent.full_name,
              email: matchedStudent.email,
              major: matchedStudent.major
            }
          });
        } else {
          results.push({
            searchTerm,
            found: false
          });
        }
      } catch (err) {
        console.error(`Error searching for student "${searchTerm}":`, err);
        results.push({
          searchTerm,
          found: false,
          error: err.message
        });
      }
    }
    
    // Update parent's student_emails and student_ids arrays (append, don't overwrite)
    if (linkedStudentIds.length > 0) {
      const existingStudentEmails = user.student_emails || [];
      const existingStudentIds = user.student_ids || [];
      
      // Get emails of newly linked students
      const newStudentEmails = results
        .filter(r => r.found && r.student?.email)
        .map(r => r.student.email);
      
      // Merge and dedupe
      const mergedEmails = [...new Set([...existingStudentEmails, ...newStudentEmails])];
      const mergedIds = [...new Set([...existingStudentIds, ...linkedStudentIds])];
      
      await base44.asServiceRole.entities.User.update(user.id, {
        student_emails: mergedEmails,
        student_ids: mergedIds,
        // Keep legacy field in sync with first student
        student_email: mergedEmails[0] || user.student_email
      });
    }
    
    return Response.json({
      success: true,
      linkedCount: linkedStudentIds.length,
      totalSearched: studentEmailsOrNames.length,
      results
    });
    
  } catch (error) {
    console.error('Link students error:', error);
    return Response.json({ 
      error: error.message || 'Failed to link students' 
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
          // Generate family_group_id if parent doesn't have one
          let familyGroupId = user.family_group_id;
          if (!familyGroupId) {
            familyGroupId = `family_${user.id}_${Date.now()}`;
            // Update parent with family_group_id
            await base44.asServiceRole.entities.User.update(user.id, {
              family_group_id: familyGroupId
            });
          }
          
          // Link student to parent via family_group_id
          await base44.asServiceRole.entities.User.update(matchedStudent.id, {
            parent_id: user.id,
            family_group_id: familyGroupId
          });
          
          linkedStudentIds.push(matchedStudent.id);
          
          results.push({
            searchTerm,
            found: true,
            student: {
              id: matchedStudent.id,
              name: matchedStudent.full_name,
              email: matchedStudent.email
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
    
    // Update parent's linked_students array
    if (linkedStudentIds.length > 0) {
      await base44.asServiceRole.entities.User.update(user.id, {
        linked_students: linkedStudentIds
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
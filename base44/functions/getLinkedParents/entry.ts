import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let parents = [];
    
    // Method 1: Load by family_group_id
    if (user.family_group_id) {
      console.log('Loading parents by family_group_id:', user.family_group_id);
      
      const familyMembers = await base44.asServiceRole.entities.User.filter({
        family_group_id: user.family_group_id
      });
      
      parents = familyMembers
        .filter(m => (m.persona === 'parent' || m.roles?.includes('parent')) && m.id !== user.id)
        .map(parent => ({
          id: parent.id,
          full_name: parent.full_name,
          email: parent.email,
          company: parent.company,
          job_title: parent.job_title,
          persona: parent.persona,
          roles: parent.roles,
          family_group_id: parent.family_group_id,
          profile_image: parent.profile_image
        }));
    }
    
    // Method 2: Check if any parent has this student in linked_students
    if (parents.length === 0) {
      console.log('Checking for parents with this student in linked_students');
      
      // Find parents who have linked this student
      const allParents = await base44.asServiceRole.entities.User.filter({
        persona: 'parent'
      });
      
      parents = allParents
        .filter(p => p.linked_students?.includes(user.id))
        .map(parent => ({
          id: parent.id,
          full_name: parent.full_name,
          email: parent.email,
          company: parent.company,
          job_title: parent.job_title,
          persona: parent.persona,
          roles: parent.roles,
          family_group_id: parent.family_group_id,
          profile_image: parent.profile_image
        }));
    }
    
    return Response.json({
      success: true,
      parents,
      debug: {
        family_group_id: user.family_group_id
      }
    });
    
  } catch (error) {
    console.error('getLinkedParents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
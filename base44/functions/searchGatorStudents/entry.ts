import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parents, alumni, or admins can search for students
    const isParent = user.persona === 'parent' || user.roles?.includes('parent');
    const isAlumni = user.persona === 'alumni' || user.roles?.includes('alumni');
    const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
    
    if (!isParent && !isAlumni && !isAdmin) {
      return Response.json({ error: 'Only parents and alumni can search for students' }, { status: 403 });
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
      // Safety limit
      if (allUsers.length >= 5000) break;
    }
    
    console.log(`[searchGatorStudents] Total users fetched: ${allUsers.length}, query: "${searchTerm}"`);
    
    // Filter for students matching the search
    const results = allUsers.filter(u => {
      // Only skip if explicitly a parent or alumni
      const uIsParent = u.persona === 'parent' || (Array.isArray(u.roles) && u.roles.includes('parent'));
      const uIsAlumni = u.persona === 'alumni' || (Array.isArray(u.roles) && u.roles.includes('alumni'));
      if (uIsParent || uIsAlumni) return false;
      
      const email = (u.email || '').toLowerCase();
      const fullName = (u.full_name || '').toLowerCase();
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      
      // Also try to extract name parts from full_name (handles "Last, First" format)
      const nameParts = fullName.split(/[\s,]+/).filter(p => p.length > 0);
      
      // Match exact phrase anywhere
      if (email.includes(searchTerm)) return true;
      if (fullName.includes(searchTerm)) return true;
      if (firstName.includes(searchTerm)) return true;
      if (lastName.includes(searchTerm)) return true;
      
      // Match any search word in any field
      const anyWordMatch = searchWords.some(word => 
        email.includes(word) || 
        fullName.includes(word) || 
        firstName.includes(word) || 
        lastName.includes(word) ||
        nameParts.some(part => part.includes(word) || word.includes(part))
      );
      
      if (anyWordMatch) return true;
      
      // Match all words across any fields (for multi-word names)
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
    
    // Return only safe fields
    const safeResults = results.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      first_name: u.first_name,
      last_name: u.last_name,
      persona: u.persona,
      roles: u.roles
    }));
    
    return Response.json({
      success: true,
      students: safeResults,
      count: safeResults.length
    });
    
  } catch (error) {
    console.error('Search students error:', error);
    return Response.json({ 
      error: error.message || 'Failed to search students' 
    }, { status: 500 });
  }
});
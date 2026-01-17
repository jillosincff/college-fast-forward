import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only parents can search for students
    if (user.persona !== 'parent' && !user.roles?.includes('parent')) {
      return Response.json({ error: 'Only parents can search for students' }, { status: 403 });
    }
    
    const { query } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return Response.json({ error: 'Search query too short' }, { status: 400 });
    }
    
    const searchTerm = query.trim().toLowerCase();
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);
    
    // Get all users with service role - fetch more to ensure we get everyone
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
    
    console.log(`[searchGatorStudents] Total users fetched: ${allUsers.length}`);
    console.log(`[searchGatorStudents] Search term: "${searchTerm}", words: ${JSON.stringify(searchWords)}`);
    
    // Filter for students matching the search - SIMPLIFIED: just search all non-parent users
    const results = allUsers.filter(u => {
      // Skip parents and alumni
      if (u.persona === 'parent' || u.persona === 'alumni') return false;
      if (u.roles?.includes('parent') || u.roles?.includes('alumni')) return false;
      
      const email = (u.email || '').toLowerCase();
      const fullName = (u.full_name || '').toLowerCase();
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      
      // Also try to extract name parts from full_name
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
      const allWordsMatch = searchWords.length > 1 && searchWords.every(word => 
        email.includes(word) || 
        fullName.includes(word) || 
        firstName.includes(word) || 
        lastName.includes(word) ||
        nameParts.some(part => part.includes(word))
      );
      
      if (allWordsMatch) return true;
      
      return false;
    });
    
    console.log(`[searchGatorStudents] Found ${results.length} matches`);
    
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
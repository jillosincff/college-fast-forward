import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
    
    // Get all users with service role
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Filter for gators matching the search
    const results = allUsers.filter(u => {
      // Must be a gator
      const isGator = u.persona === 'gator' || u.roles?.includes('gator') || u.email?.toLowerCase().endsWith('@ufl.edu');
      if (!isGator) return false;
      
      const email = u.email?.toLowerCase() || '';
      const fullName = u.full_name?.toLowerCase() || '';
      const firstName = u.first_name?.toLowerCase() || '';
      const lastName = u.last_name?.toLowerCase() || '';
      
      // Match exact phrase
      if (email.includes(searchTerm)) return true;
      if (fullName.includes(searchTerm)) return true;
      if (firstName.includes(searchTerm)) return true;
      if (lastName.includes(searchTerm)) return true;
      
      // Match all words (for "Lindsey Osinoff" to match "lindseyosinoff")
      const allWordsMatch = searchWords.every(word => 
        email.includes(word) || 
        fullName.includes(word) || 
        firstName.includes(word) || 
        lastName.includes(word)
      );
      
      if (allWordsMatch) return true;
      
      return false;
    });
    
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
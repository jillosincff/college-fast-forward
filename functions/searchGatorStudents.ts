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
    
    // Get all users with service role
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Filter for gators matching the search
    const results = allUsers.filter(u => {
      // Must be a gator
      const isGator = u.persona === 'gator' || u.roles?.includes('gator') || u.email?.toLowerCase().endsWith('@ufl.edu');
      if (!isGator) return false;
      
      // Match by email or name
      if (u.email?.toLowerCase().includes(searchTerm)) return true;
      if (u.full_name?.toLowerCase().includes(searchTerm)) return true;
      if (u.first_name?.toLowerCase().includes(searchTerm)) return true;
      if (u.last_name?.toLowerCase().includes(searchTerm)) return true;
      
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
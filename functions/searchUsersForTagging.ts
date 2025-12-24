import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

console.log('🔍 searchUsersForTagging loaded');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit = 10 } = await req.json();
    
    if (!query || query.length < 2) {
      return Response.json({ users: [] });
    }

    const searchTerm = query.trim().toLowerCase();
    console.log('Searching for:', searchTerm);

    // Get all users with service role (to bypass RLS)
    const allUsers = await base44.asServiceRole.entities.User.filter({}, '-created_date', 500);
    
    console.log('Total users fetched:', allUsers.length);

    // Filter users that match the search query
    const matchedUsers = allUsers.filter(u => {
      // Skip users without names
      if (!u.full_name && !u.first_name) return false;
      
      const fullName = (u.full_name || '').toLowerCase();
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const company = (u.current_company || '').toLowerCase();
      
      return fullName.includes(searchTerm) ||
             firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             email.includes(searchTerm) ||
             company.includes(searchTerm);
    });

    console.log('Matched users:', matchedUsers.length);

    // Return limited results with only necessary fields
    const results = matchedUsers.slice(0, limit).map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      current_company: u.current_company,
      current_position: u.current_position,
      persona: u.persona,
      profile_image: u.profile_image
    }));

    return Response.json({ users: results });

  } catch (error) {
    console.error('Search error:', error);
    return Response.json({
      error: 'Search failed',
      details: error.message
    }, { status: 500 });
  }
});
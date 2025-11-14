import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Ensure the user making the request is authenticated
        const userMakingRequest = await base44.auth.me();
        if (!userMakingRequest) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const { email } = await req.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'Email parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('Looking up user with email:', email);

        // Use service role to safely look up a single user by email
        // Try case-insensitive search
        const users = await base44.asServiceRole.entities.User.list();
        const userToDisplay = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

        if (!userToDisplay) {
            console.log('User not found for email:', email);
            // Return a generic response instead of 404
            return new Response(JSON.stringify({ 
                id: null,
                full_name: 'A Gator',
                email: email,
                headline: 'UF Community Member',
                persona: 'student',
                profile_image_url: null,
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        console.log('Found user:', userToDisplay.email);

        // Sanitize the output to ONLY return public-facing data
        const sanitizedUser = {
            id: userToDisplay.id,
            full_name: userToDisplay.full_name,
            email: userToDisplay.email,
            headline: userToDisplay.headline || userToDisplay.bio,
            persona: userToDisplay.persona,
            major: userToDisplay.major,
            graduation_year: userToDisplay.graduation_year,
            profile_image_url: userToDisplay.profile_image_url,
            location: userToDisplay.location,
        };

        return new Response(JSON.stringify(sanitizedUser), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in getPublicUserInfo function:', error);
        return new Response(JSON.stringify({ error: error.message || 'An internal error occurred' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
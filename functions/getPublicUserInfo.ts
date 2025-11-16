import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

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
        
        const { userId, email } = await req.json();

        if (!userId && !email) {
            return new Response(JSON.stringify({ error: 'userId or email parameter is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log('Looking up user with:', { userId, email });

        // Use service role to safely look up a single user
        let userToDisplay;
        
        if (userId) {
            // Look up by userId
            const users = await base44.asServiceRole.entities.User.list();
            userToDisplay = users.find(u => u.id === userId);
        } else if (email) {
            // Look up by email (case-insensitive)
            const users = await base44.asServiceRole.entities.User.list();
            userToDisplay = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        }

        if (!userToDisplay) {
            console.log('User not found');
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        console.log('Found user:', userToDisplay.email);

        // Return comprehensive user data
        const userData = {
            id: userToDisplay.id,
            full_name: userToDisplay.full_name,
            email: userToDisplay.email,
            bio: userToDisplay.bio,
            headline: userToDisplay.headline,
            persona: userToDisplay.persona,
            major: userToDisplay.major,
            graduation_year: userToDisplay.graduation_year,
            profile_image: userToDisplay.profile_image,
            location_city: userToDisplay.location_city,
            location_state: userToDisplay.location_state,
            company: userToDisplay.company,
            job_title: userToDisplay.job_title,
            industry: userToDisplay.industry,
            years_of_experience: userToDisplay.years_of_experience,
            linkedin_url: userToDisplay.linkedin_url,
            expertise_areas: userToDisplay.expertise_areas || [],
            mentorship_topics: userToDisplay.mentorship_topics || [],
            ways_to_help: userToDisplay.ways_to_help || [],
            companies_worked_at: userToDisplay.companies_worked_at || [],
            can_provide_referrals: userToDisplay.can_provide_referrals || false,
        };

        return new Response(JSON.stringify(userData), {
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
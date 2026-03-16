import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const userMakingRequest = await base44.auth.me();
        if (!userMakingRequest) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }
        
        const { userId, email } = await req.json();

        if (!userId && !email) {
            return Response.json({ error: 'userId or email parameter is required' }, { status: 400 });
        }

        console.log('Looking up user with:', { userId, email });

        let userToDisplay;
        
        if (userId) {
            // Use filter with id for efficient lookup
            const users = await base44.asServiceRole.entities.User.filter({ id: userId });
            userToDisplay = users?.[0];
        }
        
        if (!userToDisplay && email) {
            const users = await base44.asServiceRole.entities.User.filter({ email: email.toLowerCase() });
            userToDisplay = users?.[0];
        }

        if (!userToDisplay) {
            console.log('User not found');
            return Response.json({ error: 'User not found' }, { status: 404 });
        }
        
        console.log('Found user:', userToDisplay.email);

        const userData = {
            id: userToDisplay.id,
            first_name: userToDisplay.first_name,
            last_name: userToDisplay.last_name,
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
            company: userToDisplay.company || userToDisplay.current_company,
            job_title: userToDisplay.job_title || userToDisplay.current_position,
            industry: userToDisplay.industry,
            years_of_experience: userToDisplay.years_of_experience || userToDisplay.years_experience,
            linkedin_url: userToDisplay.linkedin_url,
            expertise_areas: userToDisplay.expertise_areas || [],
            mentorship_topics: userToDisplay.mentorship_topics || [],
            ways_to_help: userToDisplay.ways_to_help || [],
            companies_worked_at: userToDisplay.companies_worked_at || [],
            can_provide_referrals: userToDisplay.can_provide_referrals || false,
            skills: userToDisplay.skills || [],
            industries_of_interest: userToDisplay.industries_of_interest || userToDisplay.industries || [],
            open_to_coffee_chats: userToDisplay.open_to_coffee_chats,
            preferred_communication: userToDisplay.preferred_communication,
            response_time: userToDisplay.response_time,
            description_of_work: userToDisplay.description_of_work,
        };

        return Response.json(userData);

    } catch (error) {
        console.error('Error in getPublicUserInfo function:', error);
        return Response.json({ error: error.message || 'An internal error occurred' }, { status: 500 });
    }
});
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

        // Only allow alumni, parents, and admins to access talent spotlight
        const allowedRoles = ['alumni', 'parent', 'admin'];
        const hasAccess = userMakingRequest.persona && allowedRoles.includes(userMakingRequest.persona);
        
        if (!hasAccess) {
            return new Response(JSON.stringify({ 
                error: 'Access denied. Only alumni and parents can view Talent Spotlight.' 
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Use service role to fetch all users
        const allUsers = await base44.asServiceRole.entities.User.list();

        // Calculate 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Filter for students who have opted into Talent Spotlight within last 30 days
        const spotlightStudents = allUsers.filter(user => {
            // Basic requirements
            if (user.persona !== 'student' || 
                !user.onboarding_completed || 
                !user.includeInDirectory || 
                !user.talent_spotlight_enabled) {
                return false;
            }

            // Check if within 30-day window
            if (user.spotlight_enabled_date) {
                const enabledDate = new Date(user.spotlight_enabled_date);
                return enabledDate >= thirtyDaysAgo;
            }

            // If no spotlight_enabled_date, assume they just enabled it (legacy users)
            return true;
        });

        // Sort by profile completion score (highest first), then by spotlight enabled date (newest first)
        spotlightStudents.sort((a, b) => {
            const scoreA = a.profile_completion_score || 0;
            const scoreB = b.profile_completion_score || 0;
            
            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }
            
            // If scores are equal, sort by newest spotlight enabled date
            const dateA = a.spotlight_enabled_date ? new Date(a.spotlight_enabled_date).getTime() : 0;
            const dateB = b.spotlight_enabled_date ? new Date(b.spotlight_enabled_date).getTime() : 0;
            return dateB - dateA;
        });

        // Sanitize the data - only return public-facing fields
        const sanitizedStudents = spotlightStudents.map(student => {
            const daysRemaining = student.spotlight_enabled_date 
                ? 30 - Math.floor((Date.now() - new Date(student.spotlight_enabled_date).getTime()) / (1000 * 60 * 60 * 24))
                : 30;

            return {
                id: student.id,
                full_name: student.full_name,
                first_name: student.first_name,
                last_name: student.last_name,
                email: student.email,
                profile_image_url: student.profile_image_url,
                graduation_year: student.graduation_year,
                major: student.major,
                school: student.school,
                location: student.location,
                linkedin_url: student.linkedin_url,
                portfolio_url: student.portfolio_url,
                bio: student.bio,
                headline: student.headline,
                skills_showcase: student.skills_showcase || [],
                projects: student.projects || [],
                video_intro_url: student.video_intro_url,
                gpa: student.gpa,
                honors_awards: student.honors_awards || [],
                looking_for: student.looking_for || [],
                available_start: student.available_start,
                target_roles: student.target_roles,
                target_industries: student.target_industries,
                target_locations: student.target_locations,
                profile_completion_score: student.profile_completion_score || 0,
                spotlight_views: student.spotlight_views || 0,
                days_remaining: Math.max(0, daysRemaining),
                created_date: student.created_date
            };
        });

        return new Response(JSON.stringify({ 
            success: true,
            students: sanitizedStudents,
            count: sanitizedStudents.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in getTalentSpotlightStudents function:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to load talent spotlight students',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
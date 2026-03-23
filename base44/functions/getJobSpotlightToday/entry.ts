import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Ensure user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Find published spotlights - with error handling
        let allSpotlights = [];
        try {
            allSpotlights = await base44.entities.JobTitleSpotlight.filter({
                is_published: true
            }, '-publish_date');
        } catch (filterError) {
            console.error('Error filtering spotlights:', filterError);
            // Return empty state if entity doesn't exist or has issues
            return Response.json({ 
                success: true,
                spotlight: null,
                message: 'No spotlight available this week'
            });
        }

        if (!allSpotlights || allSpotlights.length === 0) {
            return Response.json({ 
                success: true,
                spotlight: null,
                message: 'No spotlight available this week'
            });
        }

        // Find the current or most recent spotlight
        // (the one with publish_date <= today, sorted descending by publish_date)
        let currentSpotlight = null;
        
        try {
            // Filter spotlights that should be visible by now
            const visibleSpotlights = allSpotlights.filter(s => {
                if (!s.publish_date) return false;
                try {
                    return s.publish_date <= today;
                } catch (e) {
                    console.warn('Invalid publish_date format:', s.publish_date);
                    return false;
                }
            });

            // Get the most recent one
            currentSpotlight = visibleSpotlights.length > 0 ? visibleSpotlights[0] : null;

            // If no spotlight has been published yet, return the first upcoming one
            if (!currentSpotlight && allSpotlights.length > 0) {
                currentSpotlight = allSpotlights[0];
            }
        } catch (dateError) {
            console.error('Error processing dates:', dateError);
            // Fallback: just return the first spotlight
            currentSpotlight = allSpotlights[0];
        }

        if (!currentSpotlight) {
            return Response.json({
                success: true,
                spotlight: null,
                message: 'No spotlight available this week'
            });
        }

        // Check if student has saved this spotlight
        let isSaved = false;
        try {
            const wishlistItems = await base44.entities.CareerWishlist.filter({
                student_id: user.id,
                job_title_id: currentSpotlight.id
            });
            isSaved = wishlistItems && wishlistItems.length > 0;
        } catch (wishlistError) {
            console.log('Could not check wishlist status:', wishlistError.message);
            // Continue without wishlist status - it's not critical
        }

        return Response.json({
            success: true,
            spotlight: {
                ...currentSpotlight,
                isSaved
            }
        });

    } catch (error) {
        console.error('Error in getJobSpotlightToday:', error);
        return Response.json({ 
            success: false,
            error: 'Failed to load job spotlight',
            details: error.message 
        }, { status: 500 });
    }
});
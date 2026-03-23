import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Ensure user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get student's wishlist
        let wishlistItems = [];
        try {
            wishlistItems = await base44.entities.CareerWishlist.filter({
                student_id: user.id
            }, '-created_date');
        } catch (filterError) {
            console.error('Error fetching wishlist:', filterError);
            return Response.json({
                success: true,
                wishlist: []
            });
        }

        if (!wishlistItems || wishlistItems.length === 0) {
            return Response.json({
                success: true,
                wishlist: []
            });
        }

        // Get the full job spotlight details for each saved item
        const jobTitleIds = wishlistItems.map(item => item.job_title_id);
        const wishlist = [];

        for (const id of jobTitleIds) {
            try {
                const spotlights = await base44.entities.JobTitleSpotlight.filter({
                    id: id,
                    is_published: true
                });
                
                if (spotlights && spotlights.length > 0) {
                    wishlist.push(spotlights[0]);
                }
            } catch (spotlightError) {
                console.warn('Could not fetch spotlight:', id, spotlightError.message);
                // Continue with other items
            }
        }

        return Response.json({
            success: true,
            wishlist: wishlist
        });

    } catch (error) {
        console.error('Error in getCareerWishlist:', error);
        return Response.json({ 
            error: 'Failed to load career wishlist',
            details: error.message 
        }, { status: 500 });
    }
});
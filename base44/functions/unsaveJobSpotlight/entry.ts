import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // Ensure user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get job_title_id from request body
        const { job_title_id } = await req.json();

        if (!job_title_id) {
            return Response.json({ 
                error: 'job_title_id is required' 
            }, { status: 400 });
        }

        // Find and delete the wishlist item
        const existingItems = await base44.entities.CareerWishlist.filter({
            student_id: user.id,
            job_title_id: job_title_id
        });

        if (existingItems && existingItems.length > 0) {
            // Delete all matching items (should only be one, but just in case)
            for (const item of existingItems) {
                await base44.entities.CareerWishlist.delete(item.id);
            }
        }

        return Response.json({
            success: true,
            message: 'Job spotlight removed from wishlist'
        });

    } catch (error) {
        console.error('Error in unsaveJobSpotlight:', error);
        return Response.json({ 
            error: 'Failed to remove from wishlist',
            details: error.message 
        }, { status: 500 });
    }
});
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

        // Check if already saved (prevent duplicates)
        try {
            const existingItems = await base44.entities.CareerWishlist.filter({
                student_id: user.id,
                job_title_id: job_title_id
            });

            if (existingItems && existingItems.length > 0) {
                return Response.json({
                    success: true,
                    message: 'Already saved',
                    student_id: user.id
                });
            }
        } catch (filterError) {
            console.error('Error checking existing items:', filterError);
            // Continue with save attempt
        }

        // Save to wishlist
        try {
            await base44.entities.CareerWishlist.create({
                student_id: user.id,
                job_title_id: job_title_id
            });

            return Response.json({
                success: true,
                message: 'Job spotlight saved to wishlist',
                student_id: user.id
            });
        } catch (createError) {
            console.error('Error creating wishlist item:', createError);
            return Response.json({ 
                error: 'Failed to save to wishlist',
                details: createError.message 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error in saveJobSpotlight:', error);
        return Response.json({ 
            error: 'Failed to save job spotlight',
            details: error.message 
        }, { status: 500 });
    }
});
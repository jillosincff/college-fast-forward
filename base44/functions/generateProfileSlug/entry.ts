import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Generates a unique shareable profile slug for a user.
 * Format: firstname-lastname-randomnumber (e.g., 'john-smith-1234')
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a slug
    if (user.shareable_profile_slug) {
      return Response.json({
        success: true,
        slug: user.shareable_profile_slug,
        url: `${req.headers.get('origin') || 'https://app.collegefastforward.com'}/profile/${user.shareable_profile_slug}`,
        existing: true
      });
    }

    // Generate slug from user's name
    const name = user.full_name || user.email.split('@')[0];
    const nameParts = name.toLowerCase().trim().split(/\s+/);
    const baseSlug = nameParts.join('-').replace(/[^a-z0-9-]/g, '');
    
    // Add random number to ensure uniqueness
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomNum}`;

    // Check if slug already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({
      shareable_profile_slug: slug
    });

    // If slug exists, try again with different number
    if (existingUsers && existingUsers.length > 0) {
      const newRandomNum = Math.floor(1000 + Math.random() * 9000);
      const newSlug = `${baseSlug}-${newRandomNum}`;
      
      await base44.auth.updateMe({
        shareable_profile_slug: newSlug
      });

      return Response.json({
        success: true,
        slug: newSlug,
        url: `${req.headers.get('origin') || 'https://app.collegefastforward.com'}/profile/${newSlug}`
      });
    }

    // Save slug to user profile
    await base44.auth.updateMe({
      shareable_profile_slug: slug
    });

    return Response.json({
      success: true,
      slug,
      url: `${req.headers.get('origin') || 'https://app.collegefastforward.com'}/profile/${slug}`
    });

  } catch (error) {
    console.error('Error generating profile slug:', error);
    return Response.json({ 
      success: false,
      error: 'Failed to generate profile slug',
      details: error.message 
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * One-time migration script to mark all existing users as founding members
 * 
 * Run this ONCE after implementing the tiered pricing system.
 * This ensures all existing users (before pricing was implemented) get:
 * - is_founding_member = true
 * - price_tier = 'founding'
 * - locked_price_monthly = 0
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { dry_run = true } = await req.json().catch(() => ({ dry_run: true }));

    console.log('🔄 Starting migration to mark existing users as founders...');
    console.log('Dry run:', dry_run);

    // Get all existing users
    const allUsers = await base44.asServiceRole.entities.User.list();
    console.log('Total users found:', allUsers.length);

    // Count existing founding members
    const alreadyFounders = allUsers.filter(u => u.is_founding_member || u.is_founding_gator);
    console.log('Already marked as founders:', alreadyFounders.length);

    // Users that need to be updated
    const needsUpdate = allUsers.filter(u => !u.is_founding_member && !u.is_founding_gator);
    console.log('Need to mark as founders:', needsUpdate.length);

    if (dry_run) {
      return Response.json({
        success: true,
        dry_run: true,
        message: 'Dry run complete - no changes made',
        stats: {
          total_users: allUsers.length,
          already_founders: alreadyFounders.length,
          will_be_updated: needsUpdate.length,
          users_to_update: needsUpdate.slice(0, 10).map(u => ({
            id: u.id,
            email: u.email,
            created_date: u.created_date
          }))
        }
      });
    }

    // Actually update users
    let updated = 0;
    let errors = [];

    for (const u of needsUpdate) {
      try {
        await base44.asServiceRole.entities.User.update(u.id, {
          is_founding_member: true,
          is_founding_gator: true,
          price_tier: 'founding',
          locked_price_monthly: 0,
          // Assign signup_order based on created_date order
          signup_order: allUsers
            .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
            .findIndex(x => x.id === u.id) + 1
        });
        updated++;
      } catch (err) {
        errors.push({ user_id: u.id, email: u.email, error: err.message });
      }
    }

    // Initialize the family counter
    const counters = await base44.asServiceRole.entities.GlobalCounter.filter({
      counter_name: 'family_count'
    });

    if (counters.length === 0) {
      // Estimate family count: ~70% of users in families of 2
      const estimatedFamilies = Math.ceil(allUsers.length * 0.7);
      await base44.asServiceRole.entities.GlobalCounter.create({
        counter_name: 'family_count',
        counter_value: estimatedFamilies,
        last_updated: new Date().toISOString()
      });
      console.log('Initialized family counter at:', estimatedFamilies);
    }

    console.log('✅ Migration complete');
    console.log('Updated:', updated);
    console.log('Errors:', errors.length);

    return Response.json({
      success: true,
      dry_run: false,
      message: 'Migration complete!',
      stats: {
        total_users: allUsers.length,
        already_founders: alreadyFounders.length,
        updated: updated,
        errors: errors.length,
        error_details: errors.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return Response.json({ 
      error: error.message || 'Migration failed'
    }, { status: 500 });
  }
});
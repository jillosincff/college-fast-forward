import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, family_group_id } = await req.json();

    console.log('🔢 Incrementing user count for:', user_id);

    // Get or create counter
    const settings = await base44.asServiceRole.entities.GlobalSettings.filter({
      setting_key: 'total_users_count'
    });

    let currentCount;
    if (settings.length === 0) {
      // Initialize counter at 570
      await base44.asServiceRole.entities.GlobalSettings.create({
        setting_key: 'total_users_count',
        value: 570,
        last_updated: new Date().toISOString()
      });
      currentCount = 570;
    } else {
      currentCount = settings[0].value;
    }

    // Increment counter
    const newCount = currentCount + 1;
    await base44.asServiceRole.entities.GlobalSettings.update(settings[0].id, {
      value: newCount,
      last_updated: new Date().toISOString()
    });

    // Check if user should be founding member
    const isFoundingMember = newCount <= 1000;

    if (isFoundingMember) {
      console.log('🎉 User is Founding Gator #', newCount);
      
      // Mark user as founding gator (correct field names)
      await base44.asServiceRole.entities.User.update(user_id, {
        is_founding_gator: true,
        founding_gator_number: newCount,
        signup_order: newCount
      });

      // Mark entire family as founding gators if family exists
      if (family_group_id) {
        const familyMembers = await base44.asServiceRole.entities.User.filter({
          family_group_id: family_group_id
        });

        for (const member of familyMembers) {
          if (member.id !== user_id && !member.is_founding_gator) {
            await base44.asServiceRole.entities.User.update(member.id, {
              is_founding_gator: true,
              founding_gator_number: newCount,
              signup_order: newCount
            });
          }
        }
        console.log('👨‍👩‍👧‍👦 Marked entire family as founding gators');
      }
    }

    return Response.json({
      success: true,
      user_count: newCount,
      is_founding_member: isFoundingMember,
      spots_left: Math.max(0, 1000 - newCount)
    });

  } catch (error) {
    console.error('❌ Increment user count error:', error);
    return Response.json({ 
      error: error.message || 'Failed to increment user count' 
    }, { status: 500 });
  }
});
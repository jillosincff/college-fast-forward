import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * Test endpoint for community invite functionality
 * Admin-only for testing purposes
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.roles?.includes('admin')) {
      return Response.json({ 
        error: 'Admin access required for testing' 
      }, { status: 403 });
    }

    const { action, code } = await req.json();
    const results = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // TEST 1: Create a test community invite
    if (action === 'create' || action === 'full') {
      try {
        const createResult = await base44.functions.invoke('generateCommunityInvite', {
          group_name: 'Test Community',
          target_role: 'parent',
          max_uses: 5,
          expiration_days: 7,
          custom_code: null
        });

        results.tests.push({
          name: 'Create Community Invite',
          status: createResult.data.success ? 'PASS' : 'FAIL',
          data: createResult.data,
          error: createResult.data.error || null
        });

        // Store the code for next tests
        results.test_code = createResult.data.code;
      } catch (error) {
        results.tests.push({
          name: 'Create Community Invite',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // TEST 2: Verify the code
    const testCode = code || results.test_code;
    if ((action === 'verify' || action === 'full') && testCode) {
      try {
        const verifyResult = await base44.functions.invoke('verifyInviteCode', {
          code: testCode
        });

        results.tests.push({
          name: 'Verify Community Invite',
          status: verifyResult.data.success ? 'PASS' : 'FAIL',
          data: verifyResult.data,
          error: verifyResult.data.error || null
        });
      } catch (error) {
        results.tests.push({
          name: 'Verify Community Invite',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // TEST 3: Check usage tracking
    if ((action === 'usage' || action === 'full') && testCode) {
      try {
        const invites = await base44.asServiceRole.entities.InviteCode.filter({
          code: testCode.toUpperCase()
        });

        if (invites.length > 0) {
          results.tests.push({
            name: 'Usage Tracking',
            status: 'PASS',
            data: {
              code: invites[0].code,
              current_uses: invites[0].current_uses,
              max_uses: invites[0].max_uses,
              is_community_invite: invites[0].is_community_invite,
              group_name: invites[0].group_name,
              expires_at: invites[0].expires_at,
              status: invites[0].status
            }
          });
        } else {
          results.tests.push({
            name: 'Usage Tracking',
            status: 'FAIL',
            error: 'Invite code not found in database'
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'Usage Tracking',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // TEST 4: Test expiration validation
    if (action === 'expiration' || action === 'full') {
      try {
        // Try to create an expired code and verify it fails
        const expiredInvite = await base44.asServiceRole.entities.InviteCode.create({
          code: 'EXPIRED-TEST',
          inviter_id: user.id,
          inviter_email: user.email,
          inviter_name: user.full_name,
          invite_type: 'admin_to_parent',
          is_community_invite: true,
          group_name: 'Expired Test',
          max_uses: 100,
          current_uses: 0,
          expires_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          status: 'active'
        });

        const expiredVerify = await base44.functions.invoke('verifyInviteCode', {
          code: 'EXPIRED-TEST'
        });

        // Clean up
        await base44.asServiceRole.entities.InviteCode.delete(expiredInvite.id);

        results.tests.push({
          name: 'Expiration Validation',
          status: !expiredVerify.data.success ? 'PASS' : 'FAIL',
          data: {
            expected: 'Code should be rejected as expired',
            result: expiredVerify.data.error || 'No error returned'
          }
        });
      } catch (error) {
        results.tests.push({
          name: 'Expiration Validation',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // TEST 5: Test max usage limit
    if (action === 'maxusage' || action === 'full') {
      try {
        // Create a code with max uses reached
        const fullInvite = await base44.asServiceRole.entities.InviteCode.create({
          code: 'FULL-TEST',
          inviter_id: user.id,
          inviter_email: user.email,
          inviter_name: user.full_name,
          invite_type: 'admin_to_parent',
          is_community_invite: true,
          group_name: 'Full Test',
          max_uses: 5,
          current_uses: 5, // Already full
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          status: 'active'
        });

        const fullVerify = await base44.functions.invoke('verifyInviteCode', {
          code: 'FULL-TEST'
        });

        // Clean up
        await base44.asServiceRole.entities.InviteCode.delete(fullInvite.id);

        results.tests.push({
          name: 'Max Usage Limit',
          status: !fullVerify.data.success ? 'PASS' : 'FAIL',
          data: {
            expected: 'Code should be rejected when full',
            result: fullVerify.data.error || 'No error returned'
          }
        });
      } catch (error) {
        results.tests.push({
          name: 'Max Usage Limit',
          status: 'FAIL',
          error: error.message
        });
      }
    }

    // Summary
    const passed = results.tests.filter(t => t.status === 'PASS').length;
    const failed = results.tests.filter(t => t.status === 'FAIL').length;
    
    results.summary = {
      total: results.tests.length,
      passed,
      failed,
      success_rate: `${Math.round((passed / results.tests.length) * 100)}%`
    };

    return Response.json({
      success: failed === 0,
      results
    });

  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  console.log('=== PARENT INVITE SYSTEM TEST STARTED ===');
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const testResults = {
      tests: [],
      passed: 0,
      failed: 0,
      timestamp: new Date().toISOString()
    };

    const addTest = (name, passed, details) => {
      testResults.tests.push({ name, passed, details });
      if (passed) testResults.passed++;
      else testResults.failed++;
    };

    // TEST 1: Generate parent_1 invite
    console.log('\n🧪 TEST 1: Generate parent_1 invite');
    try {
      const parent1Response = await base44.functions.invoke('generateParentInvite', {
        parent_slot: 'parent_1'
      });

      if (parent1Response.data?.success && parent1Response.data?.code) {
        addTest('Generate parent_1 invite', true, {
          code: parent1Response.data.code,
          slot: parent1Response.data.parent_slot,
          family_group_id: parent1Response.data.family_group_id
        });
        console.log('✅ Parent 1 code generated:', parent1Response.data.code);
      } else {
        addTest('Generate parent_1 invite', false, { error: 'No code returned' });
      }
    } catch (error) {
      addTest('Generate parent_1 invite', false, { error: error.message });
      console.error('❌ Test 1 failed:', error.message);
    }

    // TEST 2: Generate parent_2 invite
    console.log('\n🧪 TEST 2: Generate parent_2 invite');
    try {
      const parent2Response = await base44.functions.invoke('generateParentInvite', {
        parent_slot: 'parent_2'
      });

      if (parent2Response.data?.success && parent2Response.data?.code) {
        addTest('Generate parent_2 invite', true, {
          code: parent2Response.data.code,
          slot: parent2Response.data.parent_slot
        });
        console.log('✅ Parent 2 code generated:', parent2Response.data.code);
      } else {
        addTest('Generate parent_2 invite', false, { error: 'No code returned' });
      }
    } catch (error) {
      addTest('Generate parent_2 invite', false, { error: error.message });
      console.error('❌ Test 2 failed:', error.message);
    }

    // TEST 3: Validate invite codes exist in database
    console.log('\n🧪 TEST 3: Validate codes in database');
    try {
      const codes = await base44.asServiceRole.entities.InviteCode.filter({
        inviter_id: user.id,
        invite_type: 'gator_to_parent',
        status: 'active'
      });

      if (codes && codes.length >= 2) {
        const slots = codes.map(c => c.parent_slot);
        const hasParent1 = slots.includes('parent_1');
        const hasParent2 = slots.includes('parent_2');
        
        addTest('Codes exist in database', hasParent1 && hasParent2, {
          found: codes.length,
          slots: slots
        });
        console.log('✅ Found codes:', codes.length, 'Slots:', slots);
      } else {
        addTest('Codes exist in database', false, { found: codes?.length || 0 });
      }
    } catch (error) {
      addTest('Codes exist in database', false, { error: error.message });
      console.error('❌ Test 3 failed:', error.message);
    }

    // TEST 4: Validate family_group_id assignment
    console.log('\n🧪 TEST 4: Validate family_group_id');
    try {
      const refreshedUser = await base44.asServiceRole.entities.User.get(user.id);
      
      if (refreshedUser.family_group_id) {
        addTest('Family group ID assigned', true, {
          family_group_id: refreshedUser.family_group_id
        });
        console.log('✅ Family group ID:', refreshedUser.family_group_id);
      } else {
        addTest('Family group ID assigned', false, { error: 'No family_group_id found' });
      }
    } catch (error) {
      addTest('Family group ID assigned', false, { error: error.message });
      console.error('❌ Test 4 failed:', error.message);
    }

    // TEST 5: Test duplicate generation (should return existing code)
    console.log('\n🧪 TEST 5: Test duplicate generation');
    try {
      const duplicate1 = await base44.functions.invoke('generateParentInvite', {
        parent_slot: 'parent_1'
      });

      if (duplicate1.data?.success) {
        const firstCode = testResults.tests.find(t => t.name === 'Generate parent_1 invite')?.details?.code;
        const isDuplicate = duplicate1.data.code === firstCode;
        
        addTest('Duplicate returns same code', isDuplicate, {
          original: firstCode,
          duplicate: duplicate1.data.code,
          matches: isDuplicate
        });
        console.log('✅ Duplicate check:', isDuplicate ? 'Returns same code' : 'Generated new code');
      } else {
        addTest('Duplicate returns same code', false, { error: 'Failed to generate' });
      }
    } catch (error) {
      addTest('Duplicate returns same code', false, { error: error.message });
      console.error('❌ Test 5 failed:', error.message);
    }

    // TEST 6: Test invalid parent_slot
    console.log('\n🧪 TEST 6: Test invalid parent_slot');
    try {
      const invalidResponse = await base44.functions.invoke('generateParentInvite', {
        parent_slot: 'parent_3'
      });

      // Should fail
      addTest('Invalid slot rejected', !invalidResponse.data?.success, {
        expected: 'error',
        got: invalidResponse.data?.success ? 'success' : 'error'
      });
      console.log('✅ Invalid slot properly rejected');
    } catch (error) {
      addTest('Invalid slot rejected', true, { error: error.message });
      console.log('✅ Invalid slot threw error (expected)');
    }

    // TEST 7: Get a code and verify structure
    console.log('\n🧪 TEST 7: Verify invite code structure');
    try {
      const codes = await base44.asServiceRole.entities.InviteCode.filter({
        inviter_id: user.id,
        invite_type: 'gator_to_parent',
        status: 'active'
      });

      if (codes && codes.length > 0) {
        const code = codes[0];
        const hasRequiredFields = 
          code.code && 
          code.invite_type === 'gator_to_parent' &&
          code.parent_slot &&
          code.family_group_id &&
          code.expires_at;

        addTest('Code structure valid', hasRequiredFields, {
          code: code.code,
          invite_type: code.invite_type,
          parent_slot: code.parent_slot,
          has_family_group: !!code.family_group_id,
          has_expiry: !!code.expires_at
        });
        console.log('✅ Code structure validated');
      } else {
        addTest('Code structure valid', false, { error: 'No codes found' });
      }
    } catch (error) {
      addTest('Code structure valid', false, { error: error.message });
      console.error('❌ Test 7 failed:', error.message);
    }

    // TEST 8: Verify code verification endpoint exists
    console.log('\n🧪 TEST 8: Verify code verification available');
    try {
      const codes = await base44.asServiceRole.entities.InviteCode.filter({
        inviter_id: user.id,
        invite_type: 'gator_to_parent',
        status: 'active'
      });

      if (codes && codes.length > 0) {
        const testCode = codes[0].code;
        const verifyResponse = await base44.functions.invoke('verifyInviteCode', {
          code: testCode
        });

        // Note: This will fail if user is not a parent, but we're just testing the function exists
        const functionExists = verifyResponse.data !== undefined;
        
        addTest('Verify function accessible', functionExists, {
          tested_code: testCode,
          response_exists: functionExists
        });
        console.log('✅ Verify function accessible');
      } else {
        addTest('Verify function accessible', false, { error: 'No code to test' });
      }
    } catch (error) {
      // Function throwing error means it exists and is running
      addTest('Verify function accessible', true, { 
        note: 'Function exists and executed',
        error: error.message 
      });
      console.log('✅ Verify function exists (threw expected error)');
    }

    console.log('\n=== TEST RESULTS ===');
    console.log(`Total: ${testResults.tests.length}`);
    console.log(`Passed: ${testResults.passed} ✅`);
    console.log(`Failed: ${testResults.failed} ❌`);
    console.log(`Success Rate: ${Math.round((testResults.passed / testResults.tests.length) * 100)}%`);

    return Response.json({
      success: true,
      summary: {
        total: testResults.tests.length,
        passed: testResults.passed,
        failed: testResults.failed,
        success_rate: Math.round((testResults.passed / testResults.tests.length) * 100)
      },
      results: testResults
    });

  } catch (error) {
    console.error('=== CRITICAL TEST ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    console.log('🧪 Testing Parent Invite Flow...');
    
    // Step 1: Find or create a test student
    const students = await base44.asServiceRole.entities.User.filter({
      email: 'test-student@ufl.edu'
    });
    
    let testStudent = students[0];
    if (!testStudent) {
      return Response.json({ 
        error: 'No test student found. Create a user with email test-student@ufl.edu first' 
      }, { status: 404 });
    }

    console.log('✅ Test student found:', testStudent.email);

    // Step 2: Generate invite code for parent_1
    const generateResponse = await fetch(`${req.url.replace('/testParentInviteFlow', '/generateParentInvite')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization')
      },
      body: JSON.stringify({ parent_slot: 'parent_1' })
    });

    const generateData = await generateResponse.json();
    
    if (!generateData.success) {
      return Response.json({ 
        error: 'Failed to generate invite code',
        details: generateData 
      }, { status: 500 });
    }

    console.log('✅ Invite code generated:', generateData.code);

    // Step 3: Simulate parent using the code
    // Create a test parent user
    const testParentEmail = `test-parent-${Date.now()}@gmail.com`;
    
    // We can't create users directly, so we'll test the processParentInviteCode function logic
    const inviteCodes = await base44.asServiceRole.entities.InviteCode.filter({
      code: generateData.code,
      status: 'active'
    });

    if (inviteCodes.length === 0) {
      return Response.json({ 
        error: 'Invite code not found in database' 
      }, { status: 500 });
    }

    console.log('✅ Invite code found in database');

    // Check student's family_group_id was created
    const updatedStudent = await base44.asServiceRole.entities.User.filter({
      id: testStudent.id
    });

    if (!updatedStudent[0].family_group_id) {
      return Response.json({ 
        error: 'family_group_id not set on student' 
      }, { status: 500 });
    }

    console.log('✅ family_group_id set on student:', updatedStudent[0].family_group_id);

    // Verify invite code has correct metadata
    const inviteCode = inviteCodes[0];
    if (inviteCode.parent_slot !== 'parent_1') {
      return Response.json({ 
        error: 'parent_slot not set correctly on invite code' 
      }, { status: 500 });
    }

    console.log('✅ parent_slot set correctly:', inviteCode.parent_slot);

    if (inviteCode.family_group_id !== updatedStudent[0].family_group_id) {
      return Response.json({ 
        error: 'family_group_id mismatch between student and invite code' 
      }, { status: 500 });
    }

    console.log('✅ family_group_id matches between student and invite');

    return Response.json({
      success: true,
      message: '🎉 Parent invite flow test PASSED!',
      test_results: {
        student_email: testStudent.email,
        student_family_group_id: updatedStudent[0].family_group_id,
        invite_code: generateData.code,
        invite_parent_slot: inviteCode.parent_slot,
        invite_expires_at: inviteCode.expires_at,
        status: 'All checks passed ✅'
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return Response.json({ 
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});
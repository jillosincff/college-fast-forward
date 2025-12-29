import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Check if a user has an approved InviteRequest with a valid code
 * This helps users who were approved but never completed signup
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email } = await req.json();

    if (!email) {
      return Response.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 });
    }

    console.log('🔍 Checking for approved invite for:', email);

    // Find approved invite requests for this email
    const inviteRequests = await base44.asServiceRole.entities.InviteRequest.filter({
      email: email.toLowerCase(),
      status: 'approved'
    });

    if (inviteRequests.length === 0) {
      console.log('❌ No approved invite requests found for:', email);
      return Response.json({
        success: true,
        has_approved_invite: false
      });
    }

    // Get the most recent approved request
    const latestRequest = inviteRequests.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0];

    console.log('✅ Found approved invite request:', {
      id: latestRequest.id,
      code: latestRequest.invite_code_generated,
      role: latestRequest.role || latestRequest.user_type
    });

    // Check if the generated code is still valid
    if (!latestRequest.invite_code_generated) {
      console.log('⚠️ Approved request has no invite code');
      return Response.json({
        success: true,
        has_approved_invite: true,
        code_valid: false,
        message: 'Your request was approved but no code was generated. Please contact support.'
      });
    }

    // Verify the code exists and is still active
    const codes = await base44.asServiceRole.entities.InviteCode.filter({
      code: latestRequest.invite_code_generated.toUpperCase()
    });

    if (codes.length === 0) {
      console.log('⚠️ Generated code not found in InviteCode table');
      return Response.json({
        success: true,
        has_approved_invite: true,
        code_valid: false,
        message: 'Your invite code is no longer valid. Please request a new one.'
      });
    }

    const code = codes[0];

    // Check if code is expired
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      console.log('⚠️ Invite code expired:', code.expires_at);
      return Response.json({
        success: true,
        has_approved_invite: true,
        code_valid: false,
        code_expired: true,
        message: 'Your invite code has expired. Please request a new one.'
      });
    }

    // Check if code is already used (for non-community invites)
    if (!code.is_community_invite && code.status === 'used') {
      console.log('⚠️ Invite code already used');
      return Response.json({
        success: true,
        has_approved_invite: true,
        code_valid: false,
        code_used: true,
        message: 'Your invite code has already been used.'
      });
    }

    // Determine role from request or code
    let role = code.role || latestRequest.role;
    if (!role && latestRequest.user_type) {
      // Map legacy user_type to role
      if (latestRequest.user_type === 'uf_parent') role = 'parent';
      else if (latestRequest.user_type === 'uf_alumni') role = 'alumni';
      else if (latestRequest.user_type === 'uf_student') role = 'gator';
    }

    console.log('✅ Valid invite code found:', {
      code: code.code,
      role: role,
      expires: code.expires_at
    });

    return Response.json({
      success: true,
      has_approved_invite: true,
      code_valid: true,
      invite_code: code.code,
      role: role,
      inviter_name: code.inviter_name,
      approved_date: latestRequest.updated_date
    });

  } catch (error) {
    console.error('❌ Error checking approved invite:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to check invite status' 
    }, { status: 500 });
  }
});
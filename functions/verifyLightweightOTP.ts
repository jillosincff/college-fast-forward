import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Verify OTP and create lightweight user record
 * 
 * Creates a minimal user record for responders who come via shared questions
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, code, firstName, role, sourceQuestionId } = await req.json();

    if (!email || !code) {
      return Response.json({ 
        success: false, 
        error: 'Email and code are required' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    // Find valid OTP
    const otpRecords = await base44.asServiceRole.entities.LightweightOTP.filter({
      email: normalizedEmail,
      code: trimmedCode,
      used: false
    });

    if (!otpRecords || otpRecords.length === 0) {
      return Response.json({
        success: false,
        error: 'Invalid verification code'
      }, { status: 400 });
    }

    const otpRecord = otpRecords[0];

    // Check expiration
    if (new Date(otpRecord.expires_at) < new Date()) {
      return Response.json({
        success: false,
        error: 'Verification code has expired. Please request a new one.'
      }, { status: 400 });
    }

    // Mark OTP as used
    await base44.asServiceRole.entities.LightweightOTP.update(otpRecord.id, {
      used: true,
      used_at: new Date().toISOString()
    });

    // Check if lightweight responder already exists
    const existingResponders = await base44.asServiceRole.entities.LightweightResponder.filter({
      email: normalizedEmail
    });

    let responderId;

    if (existingResponders && existingResponders.length > 0) {
      // Update existing record
      responderId = existingResponders[0].id;
      await base44.asServiceRole.entities.LightweightResponder.update(responderId, {
        first_name: firstName || existingResponders[0].first_name,
        role: role || existingResponders[0].role,
        last_verified_at: new Date().toISOString(),
        verification_count: (existingResponders[0].verification_count || 0) + 1
      });
      console.log('Updated existing lightweight responder:', normalizedEmail);
    } else {
      // Create new lightweight responder record
      const newResponder = await base44.asServiceRole.entities.LightweightResponder.create({
        email: normalizedEmail,
        first_name: firstName,
        role: role || 'other',
        created_via: 'shared_question',
        source_question_id: sourceQuestionId,
        last_verified_at: new Date().toISOString(),
        verification_count: 1,
        response_count: 0,
        is_active: true
      });
      responderId = newResponder.id;
      console.log('Created new lightweight responder:', normalizedEmail);
    }

    return Response.json({
      success: true,
      responderId,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('verifyLightweightOTP error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user?.roles?.includes('admin')) {
      return Response.json({ 
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 });
    }

    // Generate a unique test email
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@testing.com`;

    // Check if any test users exist (for reference)
    let existingTestUsers = [];
    try {
      existingTestUsers = await base44.asServiceRole.entities.User.filter({
        email: { $regex: '^testuser.*@testing\\.com$' }
      });
    } catch (e) {
      console.log('Could not fetch existing test users:', e.message);
    }

    return Response.json({
      success: true,
      message: 'Test user email generated',
      test_email: testEmail,
      existing_test_users_count: existingTestUsers.length,
      instructions: {
        step1: 'Open an incognito/private browser window',
        step2: 'Go to your app and click "Sign In"',
        step3: `Sign up with a NEW email address (use any Gmail like: testparent${Math.floor(Math.random() * 10000)}@gmail.com)`,
        step4: 'Complete Google OAuth signup',
        step5: 'You will automatically land on the InviteRequired page!',
        step6: 'Enter your UFPARENTS code and test the flow',
        tip: '💡 Use a real Gmail account for most realistic testing. New Gmail accounts automatically have no persona/roles.'
      }
    });

  } catch (error) {
    console.error('Test user helper error:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate test instructions' 
    }, { status: 500 });
  }
});
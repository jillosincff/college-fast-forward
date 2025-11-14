import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized',
        tests: {}
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Run all tests
    const tests = {};
    
    try {
      const authResult = await runAuthFlowTest(base44);
      tests['Authentication Flow'] = {
        success: authResult.status === 'passed',
        details: authResult.details,
        steps: authResult.steps
      };
    } catch (error) {
      tests['Authentication Flow'] = {
        success: false,
        error: error.message
      };
    }

    try {
      const jobRequestResult = await runJobRequestFlowTest(base44);
      tests['Job Request Access'] = {
        success: jobRequestResult.status === 'passed',
        details: jobRequestResult.details
      };
    } catch (error) {
      tests['Job Request Access'] = {
        success: false,
        error: error.message
      };
    }

    try {
      const connectionResult = await runConnectionFlowTest(base44);
      tests['Connection Access'] = {
        success: connectionResult.status === 'passed',
        details: connectionResult.details
      };
    } catch (error) {
      tests['Connection Access'] = {
        success: false,
        error: error.message
      };
    }

    // Check if all tests passed
    const allPassed = Object.values(tests).every(test => test.success);

    return new Response(JSON.stringify({
      success: allPassed,
      tests,
      summary: {
        total: Object.keys(tests).length,
        passed: Object.values(tests).filter(t => t.success).length,
        failed: Object.values(tests).filter(t => !t.success).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('E2E Test Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Test execution failed',
      details: error.message,
      tests: {}
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

async function runAuthFlowTest(base44) {
  const startTime = Date.now();
  const testSteps = [];
  
  try {
    console.log('🧪 Starting Authentication Flow Test...');
    
    // Step 1: Test user retrieval
    testSteps.push({ step: 'user-retrieval', status: 'running' });
    
    try {
      const currentUser = await base44.auth.me();
      if (currentUser && currentUser.email) {
        testSteps[testSteps.length - 1].status = 'passed';
        testSteps[testSteps.length - 1].details = `✅ User: ${currentUser.email}`;
      } else {
        testSteps[testSteps.length - 1].status = 'failed';
        testSteps[testSteps.length - 1].details = '❌ No user data';
      }
    } catch (error) {
      testSteps[testSteps.length - 1].status = 'failed';
      testSteps[testSteps.length - 1].details = `❌ ${error.message}`;
    }
    
    // Step 2: Test entity access
    testSteps.push({ step: 'entity-access', status: 'running' });
    
    try {
      const users = await base44.entities.User.list();
      if (Array.isArray(users)) {
        testSteps[testSteps.length - 1].status = 'passed';
        testSteps[testSteps.length - 1].details = `✅ ${users.length} users accessible`;
      } else {
        testSteps[testSteps.length - 1].status = 'failed';
        testSteps[testSteps.length - 1].details = '❌ Invalid response';
      }
    } catch (error) {
      testSteps[testSteps.length - 1].status = 'failed';
      testSteps[testSteps.length - 1].details = `❌ ${error.message}`;
    }
    
    // Step 3: Test service role access
    testSteps.push({ step: 'service-role-access', status: 'running' });
    
    try {
      const allUsers = await base44.asServiceRole.entities.User.list();
      if (Array.isArray(allUsers)) {
        testSteps[testSteps.length - 1].status = 'passed';
        testSteps[testSteps.length - 1].details = `✅ Service role: ${allUsers.length} total users`;
      } else {
        testSteps[testSteps.length - 1].status = 'failed';
        testSteps[testSteps.length - 1].details = '❌ Service role failed';
      }
    } catch (error) {
      testSteps[testSteps.length - 1].status = 'failed';
      testSteps[testSteps.length - 1].details = `❌ ${error.message}`;
    }
    
    const duration = Date.now() - startTime;
    const allPassed = testSteps.every(step => step.status === 'passed');
    
    return {
      id: 'auth-flow',
      status: allPassed ? 'passed' : 'failed',
      timestamp: new Date(),
      duration,
      details: allPassed ? '✅ All auth steps passed' : '❌ Some auth steps failed',
      steps: testSteps
    };
    
  } catch (error) {
    return {
      id: 'auth-flow',
      status: 'failed',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      details: `❌ ${error.message}`,
      steps: testSteps
    };
  }
}

async function runJobRequestFlowTest(base44) {
  const startTime = Date.now();
  
  try {
    const jobRequests = await base44.entities.JobRequest.list();
    
    return {
      id: 'job-request-flow',
      status: 'passed',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      details: `✅ ${jobRequests.length} job requests found`
    };
  } catch (error) {
    return {
      id: 'job-request-flow',
      status: 'failed',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      details: `❌ ${error.message}`
    };
  }
}

async function runConnectionFlowTest(base44) {
  const startTime = Date.now();
  
  try {
    const connections = await base44.entities.Connection.list();
    
    return {
      id: 'connection-flow',
      status: 'passed',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      details: `✅ ${connections.length} connections found`
    };
  } catch (error) {
    return {
      id: 'connection-flow',
      status: 'failed',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      details: `❌ ${error.message}`
    };
  }
}
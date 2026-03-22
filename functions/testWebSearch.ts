import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const startTime = Date.now();

    console.log('🔍 Starting web search test...');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: 'nursing jobs Miami 2025',
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Search completed in ${elapsed}ms`);
    console.log('Raw result (first 500 chars):', JSON.stringify(result).substring(0, 500));

    return Response.json({
      success: true,
      elapsed_ms: elapsed,
      elapsed_seconds: (elapsed / 1000).toFixed(1),
      raw_preview: JSON.stringify(result).substring(0, 200),
      full_result: result,
    });

  } catch (error) {
    console.error('❌ Web search test failed:', error.message);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500),
    }, { status: 500 });
  }
});
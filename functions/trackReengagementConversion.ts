import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { questionId, userId } = await req.json().catch(() => ({}));
    
    if (!questionId || !userId) {
      return Response.json({ error: 'Missing questionId or userId' }, { status: 400 });
    }
    
    // Find re-engagement emails for this user that contain this question
    const emails = await base44.asServiceRole.entities.ReengagementEmail.filter({ user_id: userId });
    
    for (const email of emails) {
      if (email.question_ids?.includes(questionId) && !email.converted_at) {
        await base44.asServiceRole.entities.ReengagementEmail.update(email.id, {
          converted_at: new Date().toISOString(),
          status: 'converted'
        });
        console.log(`Marked email ${email.id} as converted`);
        break;
      }
    }
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Track conversion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trackingId } = await req.json().catch(() => ({}));
    
    if (!trackingId) {
      return Response.json({ error: 'Missing trackingId' }, { status: 400 });
    }
    
    // Find the email record by tracking ID
    const emails = await base44.asServiceRole.entities.ReengagementEmail.filter({ tracking_id: trackingId });
    
    if (emails.length > 0 && !emails[0].opened_at) {
      await base44.asServiceRole.entities.ReengagementEmail.update(emails[0].id, {
        opened_at: new Date().toISOString(),
        status: 'opened'
      });
      console.log(`Marked email ${emails[0].id} as opened`);
    }
    
    return Response.json({ success: true });
    
  } catch (error) {
    console.error('Track open error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
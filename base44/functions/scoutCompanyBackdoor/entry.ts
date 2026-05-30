import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { status: 401 });
    }

    const { jobId, companyName } = await req.json().catch(() => ({}));

    if (!jobId || !companyName) {
      return Response.json({ 
        success: false, 
        message: 'Missing target execution parameters: jobId and companyName required.' 
      }, { status: 400 });
    }

    // Clean company name for robust regex matching
    const cleanJobCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

    // Search for verified Alumni or Parents at this company
    const networkContacts = await base44.asServiceRole.entities.DiscoveredAlumni.list();
    const foundInsiders = networkContacts.filter(contact => {
      const contactCompany = (contact.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return contactCompany.includes(cleanJobCompany) || cleanJobCompany.includes(contactCompany);
    });

    if (foundInsiders.length > 0) {
      // Record the unlock
      const existingUnlocks = await base44.asServiceRole.entities.NetworkingPipeline.filter({
        user_id: user.id,
        job_id: jobId
      });
      const existingUnlock = existingUnlocks[0];

      if (existingUnlock) {
        await base44.asServiceRole.entities.NetworkingPipeline.update(existingUnlock.id, {
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          insider_count: foundInsiders.length,
          insider_type: foundInsiders[0].role || 'ALUMNI'
        });
      } else {
        await base44.asServiceRole.entities.NetworkingPipeline.create({
          user_id: user.id,
          job_id: jobId,
          company_name: companyName,
          unlocked: true,
          unlocked_at: new Date().toISOString(),
          insider_count: foundInsiders.length,
          insider_type: foundInsiders[0].role || 'ALUMNI',
          status: 'unlocked'
        });
      }

      return Response.json({
        success: true,
        insiderFound: true,
        message: `CLiFF successfully mapped ${foundInsiders.length} insider connection points for ${companyName}.`,
        connectionsCount: foundInsiders.length
      });
    }

    // No insiders found - queue for background crawling
    await base44.asServiceRole.entities.NetworkingPipeline.create({
      user_id: user.id,
      job_id: jobId,
      company_name: companyName,
      clean_name: cleanJobCompany,
      unlocked: false,
      status: 'pending_crawl',
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      insiderFound: false,
      message: `No immediate database records for ${companyName}. Escalated to background crawling queue.`
    });

  } catch (error) {
    console.error('On-Demand Crawler Pipeline Exception:', error);
    return Response.json({ 
      success: false, 
      message: 'Scout routing failed to process transaction.' 
    }, { status: 500 });
  }
});
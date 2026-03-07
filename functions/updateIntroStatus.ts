import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const user = await base44.auth.me();
    const { introId, status, candidate } = await req.json();

    if (!introId || !status) {
      return new Response(JSON.stringify({ error: 'Missing introId or status' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the intro offer
    const intro = await base44.entities.IntroOffer.get(introId);
    
    if (!intro) {
      return new Response(JSON.stringify({ error: 'Intro not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user has permission to update this intro
    const canUpdate = (
      (status === 'REQUESTED' && intro.student_id === user.id) ||
      (['SHARED', 'DECLINED', 'WITHDRAWN'].includes(status) && intro.helper_id === user.id) ||
      (['CONNECTED', 'INTERVIEW', 'NO_RESPONSE'].includes(status) && intro.student_id === user.id)
    );

    if (!canUpdate) {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update payload
    let updateData = { status };
    
    // If sharing, update candidate details if provided
    if (status === 'SHARED' && candidate) {
      updateData = {
        ...updateData,
        candidate_name: candidate.name || intro.candidate_name,
        candidate_company: candidate.company || intro.candidate_company,
        candidate_role: candidate.role || intro.candidate_role,
        candidate_linkedin: candidate.linkedin_url || intro.candidate_linkedin,
        candidate_email: candidate.email || intro.candidate_email,
        candidate_notes: candidate.notes || intro.candidate_notes,
      };
    }

    // Update the intro
    const updatedIntro = await base44.entities.IntroOffer.update(introId, updateData);

    // Log impact event
    // TODO: Create impact logging system

    return new Response(JSON.stringify({ 
      success: true,
      intro: updatedIntro
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating intro status:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
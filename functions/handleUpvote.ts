import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { answerId, action } = await req.json();

    if (!answerId) {
      return Response.json({ error: 'answerId is required' }, { status: 400 });
    }

    // Get the answer
    const answers = await base44.asServiceRole.entities.Answer.filter({ id: answerId });
    if (answers.length === 0) {
      return Response.json({ error: 'Answer not found' }, { status: 404 });
    }

    const answer = answers[0];

    // Check if user already upvoted
    const existingUpvotes = await base44.asServiceRole.entities.Upvote.filter({
      answer_id: answerId,
      user_id: user.id
    });

    if (action === 'add') {
      // Can't upvote own answer
      if (answer.answerer_user_id === user.id) {
        return Response.json({ error: "Can't upvote your own answer" }, { status: 400 });
      }

      if (existingUpvotes.length > 0) {
        return Response.json({ 
          success: false, 
          error: 'Already upvoted',
          upvote_count: answer.upvote_count || 0
        });
      }

      // Create upvote
      await base44.asServiceRole.entities.Upvote.create({
        answer_id: answerId,
        user_id: user.id,
        user_email: user.email
      });

      // Update answer count
      const newCount = (answer.upvote_count || 0) + 1;
      await base44.asServiceRole.entities.Answer.update(answerId, { upvote_count: newCount });

      // Update question total upvotes
      const questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: answer.question_id });
      if (questions.length > 0) {
        const question = questions[0];
        await base44.asServiceRole.entities.HelpRequest.update(answer.question_id, {
          total_upvotes: (question.total_upvotes || 0) + 1
        });
      }

      return Response.json({ 
        success: true, 
        upvote_count: newCount,
        action: 'added'
      });

    } else if (action === 'remove') {
      if (existingUpvotes.length === 0) {
        return Response.json({ 
          success: false, 
          error: 'No upvote found',
          upvote_count: answer.upvote_count || 0
        });
      }

      // Delete upvote
      await base44.asServiceRole.entities.Upvote.delete(existingUpvotes[0].id);

      // Update answer count
      const newCount = Math.max(0, (answer.upvote_count || 0) - 1);
      await base44.asServiceRole.entities.Answer.update(answerId, { upvote_count: newCount });

      // Update question total upvotes
      const questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: answer.question_id });
      if (questions.length > 0) {
        const question = questions[0];
        await base44.asServiceRole.entities.HelpRequest.update(answer.question_id, {
          total_upvotes: Math.max(0, (question.total_upvotes || 0) - 1)
        });
      }

      return Response.json({ 
        success: true, 
        upvote_count: newCount,
        action: 'removed'
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Upvote error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
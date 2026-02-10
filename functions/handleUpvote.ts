import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
    const answer = await base44.asServiceRole.entities.Answer.get(answerId);
    if (!answer) {
      return Response.json({ error: 'Answer not found' }, { status: 404 });
    }

    // Check if user already upvoted
    const existingUpvotes = await base44.asServiceRole.entities.Upvote.filter({
      answer_id: answerId,
      user_id: user.id
    });

    // Handle 'check' action - just return current state
    if (action === 'check') {
      return Response.json({
        success: true,
        hasUpvoted: existingUpvotes.length > 0,
        upvote_count: answer.upvote_count || 0
      });
    }

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

      // Update question total upvotes - try based on question_type, fallback to both
      try {
        if (answer.question_type === 'JobRequest') {
          const question = await base44.asServiceRole.entities.JobRequest.get(answer.question_id);
          if (question) {
            await base44.asServiceRole.entities.JobRequest.update(answer.question_id, {
              total_upvotes: (question.total_upvotes || 0) + 1
            });
          }
        } else {
          // Try HelpRequest first
          try {
            const question = await base44.asServiceRole.entities.HelpRequest.get(answer.question_id);
            if (question) {
              await base44.asServiceRole.entities.HelpRequest.update(answer.question_id, {
                total_upvotes: (question.total_upvotes || 0) + 1
              });
            }
          } catch (e) {
            // Fallback to JobRequest
            const question = await base44.asServiceRole.entities.JobRequest.get(answer.question_id);
            if (question) {
              await base44.asServiceRole.entities.JobRequest.update(answer.question_id, {
                total_upvotes: (question.total_upvotes || 0) + 1
              });
            }
          }
        }
      } catch (qErr) {
        console.log('Question upvote update failed (non-critical):', qErr.message);
      }

      // Award karma to the answer author (parents/alumni only)
      try {
        const answerAuthor = await base44.asServiceRole.entities.User.filter({ id: answer.answerer_user_id });
        if (answerAuthor.length > 0) {
          const author = answerAuthor[0];
          const isParentOrAlumni = author.persona === 'parent' || author.persona === 'alumni' || 
                                   author.roles?.includes('parent') || author.roles?.includes('alumni');
          
          if (isParentOrAlumni) {
            await base44.functions.invoke('awardKarma', {
              familyGroupId: author.family_group_id || null,
              parentUserId: answer.answerer_user_id,
              parentEmail: answer.answerer_email,
              actionType: 'upvote_received',
              referenceId: answerId,
              description: 'Answer upvoted'
            });
          }
        }
      } catch (karmaErr) {
        console.log('Karma award failed (non-critical):', karmaErr.message);
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

      // Update question total upvotes - try HelpRequest first, then JobRequest
      let questionUpdated = false;
      const helpRequests = await base44.asServiceRole.entities.HelpRequest.filter({ id: answer.question_id });
      if (helpRequests.length > 0) {
        const question = helpRequests[0];
        await base44.asServiceRole.entities.HelpRequest.update(answer.question_id, {
          total_upvotes: Math.max(0, (question.total_upvotes || 0) - 1)
        });
        questionUpdated = true;
      }
      
      if (!questionUpdated) {
        const jobRequests = await base44.asServiceRole.entities.JobRequest.filter({ id: answer.question_id });
        if (jobRequests.length > 0) {
          const question = jobRequests[0];
          await base44.asServiceRole.entities.JobRequest.update(answer.question_id, {
            total_upvotes: Math.max(0, (question.total_upvotes || 0) - 1)
          });
        }
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
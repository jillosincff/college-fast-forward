import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify user is authenticated
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { questionId, questionType } = await req.json();
        
        console.log('trackQuestionView called:', { questionId, questionType, user: user.email });
        
        if (!questionId) {
            return Response.json({ error: 'questionId is required' }, { status: 400 });
        }

        // Determine entity and field names
        const isHelpRequest = questionType === 'HelpRequest';
        const viewField = isHelpRequest ? 'view_count' : 'views_count';
        
        console.log('Using entity type:', questionType, 'field:', viewField);
        
        // Get current question using service role
        let question = null;
        let questions = [];
        
        try {
            if (isHelpRequest) {
                questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
            } else {
                questions = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
            }
            console.log('Filter result:', questions?.length, 'questions found');
            if (questions && questions.length > 0) {
                question = questions[0];
            }
        } catch (filterErr) {
            console.error('Filter error:', filterErr.message);
            return Response.json({ error: 'Filter failed: ' + filterErr.message }, { status: 500 });
        }
        
        if (!question) {
            console.log('Question not found, returning 404');
            return Response.json({ error: 'Question not found' }, { status: 404 });
        }
        
        const currentViews = Number(question[viewField]) || Number(question.view_count) || Number(question.views_count) || 0;
        console.log('Current views:', currentViews);
        
        // Increment view count using service role
        const updateData = {};
        updateData[viewField] = currentViews + 1;
        
        console.log('Updating with:', updateData);
        
        try {
            if (isHelpRequest) {
                await base44.asServiceRole.entities.HelpRequest.update(questionId, updateData);
            } else {
                await base44.asServiceRole.entities.JobRequest.update(questionId, updateData);
            }
            console.log('Update successful, new count:', currentViews + 1);
        } catch (updateErr) {
            console.error('Update error:', updateErr.message);
            return Response.json({ error: 'Update failed: ' + updateErr.message }, { status: 500 });
        }
        
        return Response.json({ 
            success: true, 
            newViewCount: currentViews + 1 
        });
        
    } catch (error) {
        console.error('Error tracking view:', error);
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});
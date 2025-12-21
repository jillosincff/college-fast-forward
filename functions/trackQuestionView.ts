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
        const entityName = questionType === 'HelpRequest' ? 'HelpRequest' : 'JobRequest';
        const viewField = questionType === 'HelpRequest' ? 'view_count' : 'views_count';
        
        console.log('Using entity:', entityName, 'field:', viewField);
        
        // Get current question using service role
        let question = null;
        try {
            const questions = await base44.asServiceRole.entities[entityName].filter({ id: questionId });
            console.log('Filter result:', questions?.length, 'questions found');
            if (questions && questions.length > 0) {
                question = questions[0];
            }
        } catch (filterErr) {
            console.error('Filter error:', filterErr);
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
        
        await base44.asServiceRole.entities[entityName].update(questionId, updateData);
        
        console.log('Update successful, new count:', currentViews + 1);
        
        return Response.json({ 
            success: true, 
            newViewCount: currentViews + 1 
        });
        
    } catch (error) {
        console.error('Error tracking view:', error);
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});
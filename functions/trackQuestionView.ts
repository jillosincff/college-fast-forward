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
        
        if (!questionId) {
            return Response.json({ error: 'questionId is required' }, { status: 400 });
        }

        // Use service role to bypass RLS and update view count
        const entityName = questionType === 'HelpRequest' ? 'HelpRequest' : 'JobRequest';
        const viewField = questionType === 'HelpRequest' ? 'view_count' : 'views_count';
        
        // Get current question
        const questions = await base44.asServiceRole.entities[entityName].filter({ id: questionId });
        
        if (!questions || questions.length === 0) {
            return Response.json({ error: 'Question not found' }, { status: 404 });
        }
        
        const question = questions[0];
        const currentViews = question[viewField] || question.view_count || question.views_count || 0;
        
        // Increment view count using service role
        const updateData = {};
        updateData[viewField] = currentViews + 1;
        
        await base44.asServiceRole.entities[entityName].update(questionId, updateData);
        
        return Response.json({ 
            success: true, 
            newViewCount: currentViews + 1 
        });
        
    } catch (error) {
        console.error('Error tracking view:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});
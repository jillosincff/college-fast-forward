import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
    console.log('trackQuestionView: Starting...');
    
    const base44 = createClientFromRequest(req);
    
    // Authenticate user first
    const user = await base44.auth.me();
    console.log('trackQuestionView: User:', user?.email);
    
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('trackQuestionView: Body:', body);
    
    const { questionId, questionType } = body;
    
    if (!questionId) {
        return Response.json({ error: 'questionId is required' }, { status: 400 });
    }

    const isHelpRequest = questionType === 'HelpRequest';
    const viewField = 'view_count'; // Use view_count for both entity types now
    
    console.log('trackQuestionView: Entity:', questionType, 'Field:', viewField);
    
    // Get current question - read is allowed for all per RLS
    let question = null;
    
    try {
        let questions;
        if (isHelpRequest) {
            questions = await base44.entities.HelpRequest.filter({ id: questionId });
        } else {
            questions = await base44.entities.JobRequest.filter({ id: questionId });
        }
        console.log('trackQuestionView: Found', questions?.length, 'questions');
        
        if (questions && questions.length > 0) {
            question = questions[0];
        }
    } catch (filterErr) {
        console.error('trackQuestionView: Filter error:', filterErr);
        return Response.json({ error: 'Filter failed', details: filterErr.message }, { status: 500 });
    }
    
    if (!question) {
        return Response.json({ error: 'Question not found' }, { status: 404 });
    }
    
    const currentViews = Number(question[viewField]) || Number(question.view_count) || Number(question.views_count) || 0;
    console.log('trackQuestionView: Current views:', currentViews);
    
    // Increment view count using asServiceRole - this bypasses RLS
    const updateData = {};
    updateData[viewField] = currentViews + 1;
    
    try {
        console.log('trackQuestionView: About to update with asServiceRole...');
        
        if (isHelpRequest) {
            await base44.asServiceRole.entities.HelpRequest.update(questionId, updateData);
        } else {
            await base44.asServiceRole.entities.JobRequest.update(questionId, updateData);
        }
        
        console.log('trackQuestionView: Update successful');
    } catch (updateErr) {
        console.error('trackQuestionView: Update error:', updateErr);
        return Response.json({ error: 'Update failed', details: updateErr.message }, { status: 500 });
    }
    
    return Response.json({ 
        success: true, 
        newViewCount: currentViews + 1 
    });
});
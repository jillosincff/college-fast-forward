import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    console.log('trackQuestionView: Starting...');
    
    let base44;
    try {
        base44 = createClientFromRequest(req);
        console.log('trackQuestionView: Client created');
    } catch (initErr) {
        console.error('trackQuestionView: Client init error:', initErr);
        return Response.json({ error: 'Client init failed', details: initErr.message }, { status: 500 });
    }
    
    let user;
    try {
        user = await base44.auth.me();
        console.log('trackQuestionView: User:', user?.email);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
    } catch (authErr) {
        console.error('trackQuestionView: Auth error:', authErr);
        return Response.json({ error: 'Auth failed', details: authErr.message }, { status: 500 });
    }

    let body;
    try {
        body = await req.json();
        console.log('trackQuestionView: Body:', body);
    } catch (parseErr) {
        console.error('trackQuestionView: Parse error:', parseErr);
        return Response.json({ error: 'Parse failed', details: parseErr.message }, { status: 500 });
    }
    
    const { questionId, questionType } = body;
    
    if (!questionId) {
        return Response.json({ error: 'questionId is required' }, { status: 400 });
    }

    const isHelpRequest = questionType === 'HelpRequest';
    const viewField = isHelpRequest ? 'view_count' : 'views_count';
    
    console.log('trackQuestionView: Entity:', questionType, 'Field:', viewField);
    
    // Get current question using service role
    let question = null;
    
    try {
        let questions;
        if (isHelpRequest) {
            questions = await base44.asServiceRole.entities.HelpRequest.filter({ id: questionId });
        } else {
            questions = await base44.asServiceRole.entities.JobRequest.filter({ id: questionId });
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
    
    // Increment view count using service role
    const updateData = {};
    updateData[viewField] = currentViews + 1;
    
    try {
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
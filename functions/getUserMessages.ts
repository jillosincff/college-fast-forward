import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Loading messages for:', user.email);

        // Use service role to bypass RLS and get all messages
        const allMessages = await base44.asServiceRole.entities.Message.list('-created_date', 100);
        
        // Filter to user's messages (as recipient or sender)
        const userMessages = allMessages.filter(m => 
            m.recipient_email === user.email || m.sender_email === user.email
        );

        console.log('Found messages:', userMessages.length);

        return Response.json({
            success: true,
            messages: userMessages,
            count: userMessages.length
        });

    } catch (error) {
        console.error('Error loading messages:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});
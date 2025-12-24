import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

console.log('🏷️ sendHelperRecommendation loaded');

Deno.serve(async (req) => {
    console.log('📨 Helper recommendation request received');
    
    try {
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            questionId,
            questionTitle,
            questionDescription,
            questionPosterName,
            recommendedUserEmail,
            recommendedUserName,
            recommenderName,
            recommenderEmail,
            personalNote
        } = body;
        
        // Validate required fields
        if (!questionId || !recommendedUserEmail || !recommenderEmail) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['questionId', 'recommendedUserEmail', 'recommenderEmail']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Init SDK');
        const base44 = createClientFromRequest(req);

        // Create in-app message
        console.log('Creating in-app message...');
        let messageCreated = false;
        
        try {
            await base44.asServiceRole.entities.Message.create({
                recipient_email: recommendedUserEmail,
                sender_email: recommenderEmail,
                subject: `🏷️ ${recommenderName} thinks you can help: "${questionTitle}"`,
                body: `${recommenderName} recommended you to help with a question!\n\n` +
                      `Question: "${questionTitle}"\n` +
                      (questionDescription ? `Details: ${questionDescription.substring(0, 200)}...\n\n` : '\n') +
                      (personalNote ? `${recommenderName}'s note: "${personalNote}"\n\n` : '') +
                      `Click to view and help: https://www.collegefastforward.com/#QuestionDetail?id=${questionId}`,
                is_read: false,
                post_id: questionId,
                post_title: questionTitle
            });
            messageCreated = true;
            console.log('✅ In-app message created');
        } catch (msgErr) {
            console.error('❌ Message creation failed:', msgErr.message);
        }

        // Send email notification
        console.log('Sending email notification to:', recommendedUserEmail);
        let emailSent = false;
        
        try {
            const recipientFirstName = recommendedUserName?.split(' ')[0] || 'there';
            
            const emailHtmlBody = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                            <h1 style="margin: 0; font-size: 24px;">🏷️ You've Been Tagged!</h1>
                        </div>
                        
                        <p style="font-size: 16px;">Hi ${recipientFirstName},</p>
                        
                        <p style="font-size: 16px;"><strong>${recommenderName}</strong> thinks you're the perfect person to help with this question:</p>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0021A5;">
                            <h3 style="margin: 0 0 10px 0; color: #0021A5;">"${questionTitle}"</h3>
                            ${questionDescription ? `<p style="margin: 0; color: #64748b; font-size: 14px;">${questionDescription.substring(0, 300)}${questionDescription.length > 300 ? '...' : ''}</p>` : ''}
                            ${questionPosterName ? `<p style="margin: 10px 0 0 0; font-size: 13px; color: #94a3b8;">Asked by ${questionPosterName}</p>` : ''}
                        </div>
                        
                        ${personalNote ? `
                        <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>${recommenderName} says:</strong> "${personalNote}"</p>
                        </div>
                        ` : ''}
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.collegefastforward.com/#QuestionDetail?id=${questionId}" 
                               style="background-color: #FA4616; color: white; padding: 14px 28px; 
                                      text-decoration: none; border-radius: 8px; display: inline-block; 
                                      font-weight: 600; font-size: 16px;">
                                View Question & Help →
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center;">
                            💡 Your expertise could make a real difference for this Gator!
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                            You were recommended by ${recommenderName} on College Fast Forward.
                        </p>
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 5px 0 0 0;">
                            Go Gators! 🧡💙
                        </p>
                    </div>
                </div>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: recommendedUserEmail,
                subject: `🏷️ ${recommenderName} tagged you to help: "${questionTitle}"`,
                body: emailHtmlBody,
                from_name: 'College Fast Forward'
            });
            
            emailSent = true;
            console.log('✅ Email sent to:', recommendedUserEmail);
        } catch (emailErr) {
            console.error('❌ Email error:', emailErr.message);
        }

        return new Response(JSON.stringify({
            success: messageCreated || emailSent,
            messageCreated,
            emailSent
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        return new Response(JSON.stringify({ 
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
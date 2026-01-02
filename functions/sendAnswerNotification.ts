import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

console.log('🚀 sendAnswerNotification loaded v2');

Deno.serve(async (req) => {
    console.log('📨 Answer notification request received');
    
    try {
        const body = await req.json();
        console.log('Body:', JSON.stringify(body));
        
        const {
            questionId,
            questionTitle,
            posterEmail,
            posterName,
            answererName,
            answererTitle,
            answererCompany,
            answerPreview
        } = body;
        
        // Validate required fields
        if (!posterEmail || !answererName || !answerPreview || !questionTitle) {
            console.error('Missing required fields');
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['posterEmail', 'answererName', 'answerPreview', 'questionTitle']
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Init SDK');
        const base44 = createClientFromRequest(req);

        // Send email notification
        console.log('Sending email notification to:', posterEmail);
        let emailSent = false;
        
        try {
            const posterFirstName = posterName?.split(' ')[0] || 'there';
            const displayAnswer = answerPreview.substring(0, 400);
            
            // Build answerer info line
            let answererInfo = answererName;
            if (answererTitle && answererCompany) {
                answererInfo = `${answererName}, ${answererTitle} at ${answererCompany}`;
            } else if (answererCompany) {
                answererInfo = `${answererName} from ${answererCompany}`;
            } else if (answererTitle) {
                answererInfo = `${answererName}, ${answererTitle}`;
            }
            
            const emailHtmlBody = `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                        <div style="background: linear-gradient(135deg, #0021A5 0%, #FA4616 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px;">
                            <h1 style="margin: 0; font-size: 24px;">🎉 New Answer to Your Question!</h1>
                        </div>
                        
                        <p style="font-size: 16px;">Hi ${posterFirstName},</p>
                        
                        <p style="font-size: 16px;">Great news! Someone answered your question:</p>
                        
                        <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; font-size: 15px; font-weight: 600; color: #92400e;">"${questionTitle}"</p>
                        </div>
                        
                        <p style="font-size: 16px;"><strong>${answererInfo}</strong> says:</p>
                        
                        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0021A5;">
                            <p style="margin: 0; font-size: 16px; font-style: italic; color: #1f2937;">"${displayAnswer}${answerPreview.length > 400 ? '...' : ''}"</p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://www.collegefastforward.com/#QuestionDetail?id=${questionId}" style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">View Full Answer →</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center;">
                            💡 Tip: If this answer was helpful, mark it as "Best Answer" to thank the helper!
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                            This notification was sent through College Fast Forward.
                        </p>
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 5px 0 0 0;">
                            Go Gators! 🧡💙
                        </p>
                    </div>
                </div>
            `;

            await base44.asServiceRole.integrations.Core.SendEmail({
                to: posterEmail,
                subject: `🎉 ${answererName} answered your question on College Fast Forward`,
                body: emailHtmlBody,
                from_name: 'College Fast Forward'
            });
            
            emailSent = true;
            console.log('✅ Email sent to:', posterEmail);
        } catch (emailErr) {
            console.error('❌ Email error:', emailErr.message);
        }

        return new Response(JSON.stringify({
            success: emailSent,
            emailSent,
            questionId
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
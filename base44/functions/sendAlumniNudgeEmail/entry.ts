import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Send nudge email to inactive alumni when a student asks a question in their field
 * 
 * Subject: A UF student needs advice in your field
 * Encourages reciprocity: "every answer earns karma that boosts your own requests"
 */
Deno.serve(async (req) => {
    console.log('📧 sendAlumniNudgeEmail called');
    
    try {
        const body = await req.json();
        const {
            alumniEmail,
            alumniName,
            studentName,
            questionTitle,
            questionId,
            industry
        } = body;
        
        if (!alumniEmail || !questionId) {
            return Response.json({ 
                error: 'Missing required fields: alumniEmail, questionId' 
            }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);
        
        const firstName = alumniName?.split(' ')[0] || 'there';
        const studentFirstName = studentName?.split(' ')[0] || 'A UF student';
        const industryText = industry ? ` in ${industry}` : '';

        const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background: linear-gradient(135deg, #0021A5 0%, #3B82F6 100%); color: white; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 24px -30px;">
                        <h1 style="margin: 0; font-size: 22px;">A UF student needs advice${industryText}</h1>
                    </div>
                    
                    <p style="font-size: 16px;">Hi ${firstName},</p>
                    
                    <p style="font-size: 16px;">${studentFirstName} asked a question that matches your expertise${industryText}.</p>
                    
                    <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #92400e;">"${questionTitle || 'Career advice question'}"</p>
                    </div>
                    
                    <p style="font-size: 15px; color: #4b5563;">
                        No pressure — but if you're open to sharing a quick perspective, it could really help.
                    </p>
                    
                    <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 0; font-size: 14px; color: #166534;">
                            <strong>💡 And every answer earns karma</strong> that boosts your own requests if you ever need support from the network.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.collegefastforward.com/#QuestionDetail?id=${questionId}" style="background-color: #0021A5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">View Question →</a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
                    
                    <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0;">
                        College Fast Forward — Helping UF students and alumni stay connected.
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 15px;">
                        <a href="https://www.collegefastforward.com/#ProfileEdit" style="color: #9ca3af;">Manage notification preferences</a>
                    </p>
                </div>
            </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
            to: alumniEmail,
            subject: `A UF student needs advice${industryText}`,
            body: emailHtml,
            from_name: 'College Fast Forward'
        });

        console.log('✅ Alumni nudge email sent to:', alumniEmail);

        return Response.json({
            success: true,
            sentTo: alumniEmail
        });

    } catch (error) {
        console.error('❌ sendAlumniNudgeEmail error:', error);
        return Response.json({
            error: error.message
        }, { status: 500 });
    }
});
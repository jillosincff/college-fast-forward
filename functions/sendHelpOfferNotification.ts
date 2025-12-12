import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { helpOffer, request, helper } = await req.json();

        // Get the student who posted the request using the User entity
        const students = await base44.asServiceRole.entities.User.filter({ email: request.created_by });
        const student = students && students.length > 0 ? students[0] : null;
        
        if (!student) {
            console.error('Student not found for email:', request.created_by);
            return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
        }

        const emailSubject = `🙋‍♂️ Someone stepped up to help with your ${request.role || request.title} request!`;
        
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0021A5;">Great news! A Gator is here to help 🐊</h2>
                
                <p>Hi ${student.full_name || 'fellow Gator'},</p>
                
                <p><strong>${helper.full_name || 'A Gator'}</strong> just stepped up to help with your request:</p>
                
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #334155;">${request.title || request.role}</h3>
                    <p style="color: #64748b; margin: 0;"><strong>Industry:</strong> ${request.target_industry}</p>
                    ${request.target_company ? `<p style="color: #64748b; margin: 5px 0 0 0;"><strong>Company:</strong> ${request.target_company}</p>` : ''}
                </div>
                
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #92400e;">Their message:</h4>
                    <p style="margin: 0; color: #451a03;">"${helpOffer.message}"</p>
                </div>
                
                <p><strong>Next steps:</strong></p>
                <ul>
                    <li>Check your Activity page to see this and other responses</li>
                    <li>The helper's contact info will be shared if you both agree to connect</li>
                    <li>You can respond directly through the platform</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://collegefastforward.com/#Activity" 
                       style="background-color: #0021A5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        View Your Activity →
                    </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px;">
                    This is why the Gator network is so powerful - we lift each other up! 🧡💙
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                <p style="color: #94a3b8; font-size: 12px;">
                    You're receiving this because someone responded to your help request on College Fast Forward. 
                    <a href="https://collegefastforward.com">Visit your dashboard</a> to manage notifications.
                </p>
            </div>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
            to: student.email,
            subject: emailSubject,
            body: emailBody
        });

        // If helper is a parent, notify the student's parents to "pay it forward"
        const isHelperParent = helper.persona === 'parent' || helper.roles?.includes('parent');
        
        if (isHelperParent && student.family_group_id) {
            try {
                // Find the student's parents
                const parents = await base44.asServiceRole.entities.User.filter({
                    family_group_id: student.family_group_id,
                    persona: 'parent'
                });

                // Send "pay it forward" notification to each parent
                for (const parent of parents) {
                    // Don't notify the helper parent themselves
                    if (parent.id === helper.id) continue;

                    const pifSubject = `🐊 Great news! ${student.full_name || 'Your Gator'} is being helped`;
                    const pifBody = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #FA4616;">❤️ Your Gator is being helped!</h2>
                            
                            <p>Hi ${parent.full_name || 'there'},</p>
                            
                            <p><strong>${student.full_name || 'Your student'}</strong> just received help from <strong>${helper.full_name || 'a Gator Parent'}</strong>!</p>
                            
                            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FA4616;">
                                <p style="margin: 0; color: #92400e; font-size: 16px;">
                                    <strong>💡 Pay it forward?</strong><br/>
                                    When another parent helps your Gator, it's the perfect moment to help another family's student.
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://collegefastforward.com/#Connections" 
                                   style="background-color: #FA4616; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                                    Help Another Gator Today 🐊
                                </a>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px;">
                                The Gator network works because we all lift each other up. When you help another student, their parents will get the same joy you're feeling right now! 🧡💙
                            </p>
                        </div>
                    `;

                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: parent.email,
                        subject: pifSubject,
                        body: pifBody
                    });

                    // Create PayItForwardNotification record
                    await base44.asServiceRole.entities.PayItForwardNotification.create({
                        recipient_parent_email: parent.email,
                        student_name: student.full_name,
                        student_email: student.email,
                        helper_parent_name: helper.full_name,
                        helper_parent_email: helper.email,
                        is_read: false
                    });

                    console.log('Sent pay-it-forward notification to:', parent.email);
                }
            } catch (pifError) {
                console.error('Failed to send pay-it-forward notifications:', pifError);
                // Don't block the main flow
            }
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error('Failed to send help offer notification:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to send notification',
            details: error.message 
        }), { status: 500 });
    }
});
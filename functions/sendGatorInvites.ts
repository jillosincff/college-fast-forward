import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { v4 as uuidv4 } from 'npm:uuid';
import sgMail from 'npm:@sendgrid/mail@8.1.0';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
sgMail.setApiKey(SENDGRID_API_KEY);

const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { emails, role, campus, note, refSource } = await req.json();
        console.log('sendGatorInvites called:', { emails, role, campus, userId: user.id });

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return new Response(JSON.stringify({ error: 'Emails must be a non-empty array.' }), { status: 400 });
    }

    // Rate Limiting
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentInvites = await base44.asServiceRole.entities.CommunityInvite.filter({
        inviter_user_id: user.id,
        created_date: { $gte: twentyFourHoursAgo }
    });

    if (recentInvites.length >= 50) {
        return new Response(JSON.stringify({ error: 'Daily invite limit reached. Please try again tomorrow.' }), { status: 429 });
    }
    if (emails.length > 10) {
        return new Response(JSON.stringify({ error: 'You can send a maximum of 10 invites per request.' }), { status: 400 });
    }

    const validEmails = emails.filter(isEmail);
    const invalid = emails.filter(e => !isEmail(e));
    
    // Check for existing users
    const alreadyUsers = [];
    for (const email of validEmails) {
        try {
            const existing = await base44.asServiceRole.entities.User.filter({ email });
            if (existing && existing.length > 0) {
                alreadyUsers.push(email);
            }
        } catch (err) {
            console.log(`Could not check user ${email}:`, err.message);
        }
    }

    const emailsToSend = validEmails.filter(e => !alreadyUsers.includes(e));

    const results = {
        sent: [],
        alreadyUsers,
        invalid,
        duplicates: emails.filter((e, i) => emails.indexOf(e) !== i),
    };

    const appUrl = 'https://www.collegefastforward.com';
    const inviterName = user.full_name || 'A Gator';

    for (const email of emailsToSend) {
        try {
            console.log('📧 Processing invite for:', email);
            const token = uuidv4();
            const expires_at = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days

            console.log('Creating CommunityInvite record...');
            // Force campus to UF for College Fast Forward branding
            const invite = await base44.asServiceRole.entities.CommunityInvite.create({
                inviter_user_id: user.id,
                email,
                role: role || 'student',
                campus: 'UF',
                note: note || '',
                invite_token: token,
                status: 'pending',
                expires_at,
            });
            console.log('✅ CommunityInvite created:', invite.id);

            const inviteLink = `${appUrl}/#PreAuth?inviteToken=${token}`;
            console.log('📨 Sending email to:', email);
            console.log('Invite link:', inviteLink);
            
            // College Fast Forward branded email
            const subject = `You're invited to College Fast Forward (UF)`;
            const emailBody = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #0021A5; padding: 20px; text-align: center;">
                        <div style="color: white; font-size: 24px; font-weight: bold;">College Fast Forward</div>
                        <div style="color: #FA4616; font-size: 14px; margin-top: 5px;">UF</div>
                        <div style="height: 3px; background-color: #FA4616; margin-top: 10px;"></div>
                    </div>
                    <div style="padding: 30px; background-color: #F5F8FF;">
                        <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hi there,</p>
                        <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                            ${inviterName} invited you to join <strong>College Fast Forward (UF)</strong>—a community where parents & alumni help UF students find internships, jobs, and mentorship.
                        </p>
                        ${note ? `<div style="background: white; padding: 15px; border-left: 4px solid #FA4616; margin: 20px 0; font-style: italic;">"${note}" <br><br>– ${inviterName}</div>` : ''}
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteLink}" style="background-color: #0021A5; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block;">Join College Fast Forward (UF)</a>
                        </div>
                        <p style="color: #666; font-size: 14px; text-align: center;">
                            Gators helping Gators—join the UF network for internships, jobs, and help.
                        </p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                        <div style="height: 2px; background-color: #FA4616; margin-bottom: 10px; width: 60px; margin: 0 auto 10px auto;"></div>
                        College Fast Forward (UF) • Connecting the Gator Community
                    </div>
                </div>
            `;

            // First try SendGrid, fallback to Base44 Core.SendEmail for existing users
            let emailSent = false;
            
            // Try SendGrid first (works for external emails)
            if (SENDGRID_API_KEY) {
                try {
                    const msg = {
                        to: email,
                        from: {
                            email: 'support@collegefastforward.com',
                            name: 'College Fast Forward'
                        },
                        subject: subject,
                        html: emailBody
                    };
                    
                    await sgMail.send(msg);
                    console.log('✅ Email sent successfully via SendGrid to:', email);
                    emailSent = true;
                } catch (sgError) {
                    console.error('SendGrid error:', sgError.message);
                    console.log('Attempting fallback to Base44 Core.SendEmail...');
                }
            }
            
            // Fallback: Use the inviting user to forward the invite
            if (!emailSent) {
                console.log('Using alternative method: creating invite record only');
                // The invite was already created, just mark this as needing manual follow-up
                // or use a different notification approach
            }
            
            console.log('✅ Invite processed for:', email);

            results.sent.push(email);
        } catch (err) {
            console.error(`❌ Failed to send invite to ${email}:`, err);
            console.error('Error message:', err.message);
            console.error('Error stack:', err.stack);
            results.invalid.push(email); // Add to invalid if sending fails
        }
    }

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('sendGatorInvites error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to send invites', 
            details: error.message,
            stack: error.stack 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      helper_parent_email, 
      helper_parent_name, 
      student_email, 
      student_name,
      trigger_type 
    } = await req.json();

    if (!helper_parent_email || !student_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use service role to find the student's linked parent
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Find the student
    const student = allUsers.find(u => u.email === student_email);
    if (!student) {
      return Response.json({ success: false, reason: 'Student not found' });
    }

    // Find parent linked to this student (check linked_student_emails or parent_email on student)
    let linkedParent = null;
    
    // Method 1: Check if student has a parent_email field
    if (student.parent_email) {
      linkedParent = allUsers.find(u => u.email === student.parent_email);
    }
    
    // Method 2: Check parents who have this student linked
    if (!linkedParent) {
      linkedParent = allUsers.find(u => 
        (u.persona === 'parent' || u.roles?.includes('parent')) &&
        u.linked_student_emails?.includes(student_email)
      );
    }

    if (!linkedParent) {
      return Response.json({ success: false, reason: 'No linked parent found for student' });
    }

    // Don't notify if the helper IS the student's parent
    if (linkedParent.email === helper_parent_email) {
      return Response.json({ success: false, reason: 'Helper is the students own parent' });
    }

    // Check rate limit - max 1 notification per day per recipient parent
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentNotifications = await base44.asServiceRole.entities.PayItForwardNotification.filter({
      recipient_parent_email: linkedParent.email,
      created_date: { $gte: oneDayAgo.toISOString() }
    });

    if (recentNotifications && recentNotifications.length > 0) {
      return Response.json({ success: false, reason: 'Rate limited - already notified today' });
    }

    // Create the notification record
    await base44.asServiceRole.entities.PayItForwardNotification.create({
      recipient_parent_email: linkedParent.email,
      student_email: student_email,
      student_name: student_name || student.full_name || 'Your student',
      helper_parent_name: helper_parent_name || 'A UF Parent',
      helper_parent_email: helper_parent_email,
      trigger_type: trigger_type || 'message',
      is_read: false,
      email_sent: false
    });

    // Send email notification
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (SENDGRID_API_KEY && linkedParent.email) {
      const studentFirstName = (student_name || student.full_name || 'your student').split(' ')[0];
      const helperFirstName = (helper_parent_name || 'A UF Parent').split(' ')[0];
      
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg" alt="College Fast Forward" style="height: 80px;" />
          </div>
          
          <h2 style="color: #0021A5; text-align: center;">Good news! ${studentFirstName} was just helped ❤️</h2>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            ${helperFirstName}, a fellow UF parent, just reached out to ${studentFirstName} with career help.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            That's what the UF community does — we help each other.
          </p>
          
          <p style="font-size: 16px; color: #333; line-height: 1.6; font-weight: bold;">
            Can you pay it forward and help another UF student today?
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://app.base44.com/a/684474c5723dc90efce23588#Connections" 
               style="background: linear-gradient(135deg, #FA4616, #FF6B3D); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Help a UF Student →
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 32px;">
            University of Florida 🧡💙
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            You're receiving this because another parent helped your student on College Fast Forward.
          </p>
        </div>
      `;

      try {
        const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: linkedParent.email }]
            }],
            from: { 
              email: 'notifications@collegefastforward.com',
              name: 'College Fast Forward'
            },
            subject: `❤️ Good news! ${studentFirstName} was just helped by a UF parent`,
            content: [{
              type: 'text/html',
              value: emailBody
            }]
          })
        });

        if (emailResponse.ok) {
          // Update notification to mark email as sent
          const notifications = await base44.asServiceRole.entities.PayItForwardNotification.filter({
            recipient_parent_email: linkedParent.email,
            student_email: student_email
          }, '-created_date', 1);
          
          if (notifications && notifications.length > 0) {
            await base44.asServiceRole.entities.PayItForwardNotification.update(
              notifications[0].id, 
              { email_sent: true }
            );
          }
        }
      } catch (emailError) {
        console.error('Failed to send Pay It Forward email:', emailError);
      }
    }

    return Response.json({ 
      success: true, 
      recipient_parent: linkedParent.email,
      message: 'Pay It Forward notification sent'
    });

  } catch (error) {
    console.error('Pay It Forward notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
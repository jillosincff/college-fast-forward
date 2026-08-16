import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// HTML escape utility
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

let base44;

async function findUserByCustomerId(customerId) {
  const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
  return users?.length > 0 ? users[0] : null;
}

async function findStudentByGiftSubscriptionId(subscriptionId) {
  let users = await base44.asServiceRole.entities.User.filter({ fastiq_gift_subscription_id: subscriptionId });
  if (!users?.length) {
    users = await base44.asServiceRole.entities.User.filter({ pro_gift_subscription_id: subscriptionId });
  }
  return users?.length > 0 ? users[0] : null;
}

async function revokeGiftedStudentAccess(subscriptionId) {
  const student = await findStudentByGiftSubscriptionId(subscriptionId);
  if (!student) return;
  await base44.asServiceRole.entities.User.update(student.id, {
    subscription_status: 'canceled',
    membership_tier: 'free',
    fastiq_active: false,
    is_fastiq: false,
    fastiq_setup_complete: false,
    trial_status: 'expired',
    fastiq_trial_active: false,
    // Clear stale gift fields so re-gifting works cleanly
    fastiq_gifted_by_user_id: null,
    fastiq_gift_subscription_id: null,
    pro_gift_subscription_id: null,
  });
  console.log('[stripeWebhook] Gifted FastIQ revoked for student:', student.id, 'sub:', subscriptionId);
}

async function findBillingUser(customerId, userId, userEmail) {
  if (customerId) {
    const user = await findUserByCustomerId(customerId);
    if (user) return user;
  }
  if (userId) {
    try {
      const user = await base44.asServiceRole.entities.User.get(userId);
      if (user) return user;
    } catch (e) {
      console.log('User not found by metadata user_id:', userId);
    }
  }
  if (userEmail) {
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    if (users?.length > 0) return users[0];
  }
  console.error('[stripeWebhook] CRITICAL: Could not find billing user. customerId:', customerId, 'userId:', userId, 'email:', userEmail);
  return null;
}

async function findFamily(familyId, customerId) {
  if (familyId) {
    try {
      const family = await base44.asServiceRole.entities.Family.get(familyId);
      if (family) return family;
    } catch (e) {
      console.log('Family not found by ID:', familyId);
    }
  }
  if (customerId) {
    const families = await base44.asServiceRole.entities.Family.filter({ stripe_customer_id: customerId });
    if (families?.length > 0) return families[0];
  }
  const user = await findUserByCustomerId(customerId);
  if (user?.family_id) {
    try {
      return await base44.asServiceRole.entities.Family.get(user.family_id);
    } catch (e) {
      console.log('Family not found by user.family_id:', user.family_id);
    }
  }
  return null;
}

async function updateAllFamilyMembers(family, updates) {
  if (!family) return;
  const allMemberIds = [...(family.parent_ids || []), ...(family.student_ids || [])];
  for (const memberId of allMemberIds) {
    try {
      await base44.asServiceRole.entities.User.update(memberId, updates);
    } catch (err) {
      console.error('Failed to update family member:', memberId, err.message);
    }
  }
}

async function getLinkedStudentEmails(billingUser, family) {
  const emails = [];
  if (billingUser?.student_emails?.length) {
    emails.push(...billingUser.student_emails);
  }
  if (family?.student_ids?.length) {
    for (const sid of family.student_ids) {
      try {
        const student = await base44.asServiceRole.entities.User.get(sid);
        if (student?.email && !emails.includes(student.email)) {
          emails.push(student.email);
        }
      } catch (e) {}
    }
  }
  return emails;
}

async function sendStudentActivationEmails(billingUser, family) {
  const studentEmails = await getLinkedStudentEmails(billingUser, family);
  const parentName = billingUser?.full_name?.split(' ')[0] || 'Your parent';

  for (const email of studentEmails) {
    try {
      let studentFirstName = 'there';
      try {
        const students = await base44.asServiceRole.entities.User.filter({ email });
        if (students?.length > 0) studentFirstName = students[0].full_name?.split(' ')[0] || 'there';
      } catch (e) {}

      await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
        studentEmail: email,
        studentFirstName,
        parentFirstName: parentName,
        trialDays: 5,
      });
      console.log('[stripeWebhook] Rich FastIQ gift email sent to student:', email);
    } catch (emailError) {
      console.error('[stripeWebhook] Student email failed:', { email, error: emailError.message });
    }
  }
}

Deno.serve(async (req) => {
  base44 = createClientFromRequest(req);
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')?.trim();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('Webhook received:', event.type);

    switch (event.type) {

      // CHECKOUT COMPLETED
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const subscriptionTier = session.metadata?.subscription_tier || 'cff';
        const familyId = session.metadata?.family_id;
        const billingUserEmail = session.metadata?.user_email;
        const billingUserId = session.metadata?.user_id;
        const isFoundingMember = session.metadata?.is_founding_member === 'true';
        const plan = session.metadata?.plan;
        // Parent gift purchase: Pro goes to the STUDENT, not the buyer
        const giftStudentEmail = session.metadata?.gift_student_email?.trim().toLowerCase() || null;

        console.log('Checkout completed:', { subscriptionTier, customerId, familyId, billingUserEmail, isFoundingMember, plan });

        const billingUser = await findBillingUser(customerId, billingUserId, billingUserEmail);
        if (billingUser) {
          const userUpdates = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
            fastiq_active: subscriptionTier === 'fastiq',
            is_fastiq: subscriptionTier === 'fastiq',
            membership_tier: subscriptionTier === 'fastiq' ? 'fastiq' : billingUser.membership_tier,
          };

          if (isFoundingMember) {
            userUpdates.founding_offer_redeemed = true;
            userUpdates.founding_offer_redeemed_at = new Date().toISOString();
            userUpdates.founding_member_plan = plan;
          }

          await base44.asServiceRole.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user:', billingUser.id, 'tier:', subscriptionTier, 'founding:', isFoundingMember);

          base44.asServiceRole.entities.AnalyticsEvent.create({
            event_name: 'subscription_activated',
            user_id: billingUser.id,
            user_email: billingUser.email,
            school_code: billingUser.school_name || billingUser.school || '',
            properties: { plan: plan || subscriptionTier, is_founding: isFoundingMember, persona: billingUser.persona || '' },
          }).catch(() => {});
          // Canonical conversion event — student self-pay activation.
          if (!giftStudentEmail) {
            base44.asServiceRole.entities.AnalyticsEvent.create({
              event_name: 'pro_activated',
              user_id: billingUser.id,
              user_email: billingUser.email,
              school_code: billingUser.school_name || billingUser.school || '',
              properties: { plan: plan || subscriptionTier, source: 'self_pay' },
            }).catch(() => {});
          }

          if (isFoundingMember) {
            try {
              await stripe.customers.update(customerId, {
                metadata: {
                  founding_offer_redeemed: 'true',
                  founding_offer_redeemed_at: new Date().toISOString(),
                },
              });
            } catch (e) {
              console.log('Could not update Stripe customer metadata:', e.message);
            }
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          const familyUpdates = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            billing_owner_id: billingUserId || billingUser?.id || '',
            billing_owner_email: billingUserEmail || billingUser?.email || '',
            billing_owner_name: billingUser?.full_name || '',
          };
          if (isFoundingMember) {
            familyUpdates.is_founding_subscriber = true;
            familyUpdates.founding_plan = 'fastiq_founding_annual';
          }

          await base44.asServiceRole.entities.Family.update(family.id, familyUpdates);
          console.log('Updated family:', family.id, 'tier:', subscriptionTier);

          const memberUpdates = {
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            fastiq_active: subscriptionTier === 'fastiq',
            is_fastiq: subscriptionTier === 'fastiq',
          };
          if (subscriptionTier === 'fastiq') {
            memberUpdates.membership_tier = 'fastiq';
          }
          await updateAllFamilyMembers(family, memberUpdates);
        }

        // Send confirmation email to the buyer (gifts get their own receipt below)
        if (billingUser?.email && !giftStudentEmail) {
          const userName = billingUser.full_name?.split(' ')[0] || 'there';
          const isFoundingEmail = isFoundingMember;
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: `Welcome to CLIFF Pro${isFoundingEmail ? ' — Founding Member' : ''}! 🎉`,
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:32px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">✨ CLIFF PRO ACTIVATED</p>
    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;">You're in, ${escapeHtml(userName)}!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">CLIFF is now working for you around the clock.</p>
  </div>
  <p style="font-size:15px;color:#0f172a;line-height:1.6;">Here's what just unlocked for you:</p>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:20px;margin:16px 0;">
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited CLIFF-powered applications</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited resume, interview &amp; company prep</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited outreach &amp; follow-ups</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Warm-connection searches at any company</p>
    <p style="font-size:14px;color:#4c1d95;margin:0;">✓ Proactive background work — CLIFF preps while you sleep</p>
  </div>
  ${isFoundingEmail ? '<div style="background:#f5f3ff;border:1px solid #c4b5fd;border-radius:14px;padding:16px 20px;margin:16px 0;"><p style="font-size:13px;color:#6d28d9;font-weight:700;margin:0 0 4px;">FOUNDING MEMBER</p><p style="font-size:13px;color:#475569;margin:0;">You locked in 50% off forever. Your rate never goes up.</p></div>' : ''}
  <div style="text-align:center;margin:32px 0;">
    <a href="https://collegefastforward.com/#/FreeTierDashboard" style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;">Go to My Dashboard</a>
  </div>
  <p style="font-size:12px;color:#94a3b8;text-align:center;">Questions? Reply to this email — we're real people.</p>
</div>`,
            });
            console.log('[stripeWebhook] Confirmation email sent to:', billingUser.email);
          } catch (emailError) {
            console.error('[stripeWebhook] Confirmation email failed:', emailError.message);
          }
        }

        // Send activation emails to non-parent FastIQ buyers with family-linked students
        // Parent buyers are handled by the gifting loop below to avoid duplicate emails
        if (subscriptionTier === 'fastiq' && billingUser && billingUser.persona !== 'parent') {
          await sendStudentActivationEmails(billingUser, family);
        }

        // Parent-gifted FastIQ: activate student account + send gift email
        if (subscriptionTier === 'fastiq' && billingUser?.persona === 'parent') {
          const studentEmailsToGift = [
            ...(billingUser.student_emails || []),
            billingUser.pending_student_invite_email,
          ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

          for (const studentEmail of studentEmailsToGift) {
            try {
              const studentMatches = await base44.asServiceRole.entities.User.filter({ email: studentEmail });
              const student = studentMatches?.[0];

              if (student) {
                if (student.stripe_customer_id && student.subscription_status === 'active' && !student.fastiq_trial_active) {
                  console.log('[stripeWebhook] Student already has paid FastIQ - skipping gift:', studentEmail);
                  continue;
                }

                await base44.asServiceRole.entities.User.update(student.id, {
                  subscription_status: 'active',
                  membership_tier: 'fastiq',
                  fastiq_active: true,
                  is_fastiq: true,
                  fastiq_setup_complete: true,
                  gifted_by_parent_email: billingUser.email,
                  linked_parent_name: billingUser.full_name?.split(' ')[0] || 'Your parent',
                  trial_start_date: new Date().toISOString(),
                  trial_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                  trial_status: 'active',
                  fastiq_trial_active: true,
                });

                await base44.asServiceRole.functions.invoke('sendParentGiftedFastIQEmail', {
                  studentEmail: student.email,
                  studentFirstName: student.full_name?.split(' ')[0] || 'there',
                  parentFirstName: billingUser.full_name?.split(' ')[0] || 'Your parent',
                  trialDays: 5,
                }).catch(e => console.error('[stripeWebhook] Student gift email failed:', e.message));

                console.log('[stripeWebhook] FastIQ gifted to student:', studentEmail);
              } else {
                const existingPending = billingUser.pending_fastiq_gift_emails || [];
                const updatedPending = existingPending.includes(studentEmail)
                  ? existingPending
                  : [...existingPending, studentEmail];
                await base44.asServiceRole.entities.User.update(billingUser.id, {
                  pending_fastiq_gift_emails: updatedPending,
                });
                console.log('[stripeWebhook] Student not yet signed up - gift pending:', studentEmail);
              }
            } catch (giftErr) {
              console.error('[stripeWebhook] Parent gift FastIQ error for', studentEmail, ':', giftErr.message);
            }
          }
        }

        // ── CLIFF Pro gift: parent bought Pro for a specific student email ──
        if (giftStudentEmail) {
          try {
            const parentFirst = billingUser?.full_name?.split(' ')[0] || 'Your parent';
            const studentMatches = await base44.asServiceRole.entities.User.filter({ email: giftStudentEmail });
            const giftStudent = studentMatches?.[0];

            if (giftStudent) {
              // Student is registered — activate Pro immediately
              await base44.asServiceRole.entities.User.update(giftStudent.id, {
                subscription_status: 'active',
                subscription_tier: 'cff',
                membership_tier: 'cff',
                fastiq_active: true,
                is_fastiq: true,
                gifted_by_parent_email: billingUser?.email || '',
                linked_parent_name: parentFirst,
                pro_gift_subscription_id: subscriptionId,
              });
              console.log('[stripeWebhook] CLIFF Pro gifted to student:', giftStudentEmail);
              // Canonical conversion events — parent paid + student upgraded.
              base44.asServiceRole.entities.AnalyticsEvent.create({
                event_name: 'parent_payment_completed',
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                properties: { parent_email: billingUser?.email || '', source: 'parent_invite' },
              }).catch(() => {});
              base44.asServiceRole.entities.AnalyticsEvent.create({
                event_name: 'pro_activated',
                user_id: giftStudent.id,
                user_email: giftStudent.email,
                properties: { source: 'parent_gift' },
              }).catch(() => {});

              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: giftStudent.email,
                  subject: `${parentFirst} just got you CLIFF Pro 🎁`,
                  body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;">
  <div style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);border-radius:20px;padding:32px;text-align:center;margin-bottom:32px;">
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">🎁 A GIFT FROM ${escapeHtml(parentFirst.toUpperCase())}</p>
    <h1 style="color:#fff;font-size:28px;margin:0 0 8px;">CLIFF Pro is now yours, ${escapeHtml(giftStudent.full_name?.split(' ')[0] || 'there')}!</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:0;">${escapeHtml(parentFirst)} just upgraded your account. CLIFF now works for you around the clock.</p>
  </div>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:14px;padding:20px;margin:16px 0;">
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited CLIFF-powered applications</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited resume, interview &amp; company prep</p>
    <p style="font-size:14px;color:#4c1d95;margin:0 0 8px;">✓ Unlimited outreach &amp; follow-ups</p>
    <p style="font-size:14px;color:#4c1d95;margin:0;">✓ Proactive background work — CLIFF preps while you sleep</p>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="https://collegefastforward.com/#/FreeTierDashboard" style="background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 32px;border-radius:14px;text-decoration:none;font-weight:700;font-size:15px;">Open My Dashboard</a>
  </div>
</div>`,
                });
              } catch (e) { console.error('[stripeWebhook] Student Pro gift email failed:', e.message); }
            } else {
              // Student hasn't signed up yet — store the pending gift on the parent
              if (billingUser) {
                await base44.asServiceRole.entities.User.update(billingUser.id, {
                  pending_pro_gift_email: giftStudentEmail,
                  pending_pro_gift_subscription_id: subscriptionId,
                });
              }
              console.log('[stripeWebhook] Pro gift pending — student not signed up yet:', giftStudentEmail);

              // Invite email via SendGrid (recipient isn't a registered app user yet)
              try {
                const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
                await fetch('https://api.sendgrid.com/v3/mail/send', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    personalizations: [{ to: [{ email: giftStudentEmail }] }],
                    from: { email: 'jill@collegefastforward.com', name: 'Jill at College Fast Forward' },
                    subject: `${parentFirst} got you CLIFF Pro — claim it 🎁`,
                    content: [{ type: 'text/html', value: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">${escapeHtml(parentFirst)} just bought you CLIFF Pro 🎁</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">CLIFF is an AI career agent that finds internships and jobs for you, tailors your resume for each one, preps you for interviews, and follows up — automatically.</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Your Pro access is paid for and waiting. Just sign up with this email address and it activates instantly.</p>
  <a href="https://collegefastforward.com/#/GatorAuth" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Claim My CLIFF Pro →</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">Warmly,<br><strong>Jill Osinoff</strong><br>Founder, College Fast Forward</p>
</div>` }],
                  }),
                });
              } catch (e) { console.error('[stripeWebhook] Pending gift invite email failed:', e.message); }
            }

            // Receipt email to the parent
            if (billingUser?.email) {
              try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                  to: billingUser.email,
                  subject: `You just gave ${giftStudentEmail} a real edge 💜`,
                  body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Your gift is on its way</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">Hi ${escapeHtml(parentFirst)},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:16px;">You've gifted <strong>CLIFF Pro</strong> to <strong>${escapeHtml(giftStudentEmail)}</strong>. ${giftStudent ? "It's active on their account right now, and we've emailed them the good news." : "The moment they sign up with that email, Pro activates automatically — we've sent them an invite."}</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">CLIFF will now find opportunities, tailor their resume, prep them for interviews, and follow up on applications — around the clock. You'll be billed $19.96/month; cancel anytime.</p>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">Thank you for investing in their search.<br>The College Fast Forward Team</p>
</div>`,
                });
              } catch (e) { console.error('[stripeWebhook] Parent gift receipt email failed:', e.message); }
            }

            base44.asServiceRole.entities.AnalyticsEvent.create({
              event_name: 'pro_gift_purchased',
              user_id: billingUser?.id || '',
              user_email: billingUser?.email || '',
              properties: { student_email: giftStudentEmail, student_registered: !!giftStudent },
            }).catch(() => {});
          } catch (proGiftErr) {
            console.error('[stripeWebhook] CLIFF Pro gift error:', proGiftErr.message);
          }
        }

        break;
      }

      // SUBSCRIPTION CREATED / UPDATED
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionTier = subscription.metadata?.subscription_tier;
        const familyId = subscription.metadata?.family_id;
        const status = subscription.status;

        console.log('Subscription event:', event.type, { status, subscriptionTier, familyId });

        const billingUser = await findUserByCustomerId(customerId);

        const isActiveSub = (status === 'active' || status === 'trialing');
        const userUpdates = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
          // Any active paid subscription = premium access, regardless of tier name
          fastiq_active: isActiveSub,
          is_fastiq: isActiveSub,
        };
        if (subscriptionTier) userUpdates.subscription_tier = subscriptionTier;
        if (subscription.trial_end) userUpdates.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
        if (subscription.current_period_end) userUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

        if (isActiveSub) {
          userUpdates.membership_tier = subscriptionTier || billingUser?.membership_tier || 'cff';
        } else if (subscriptionTier === 'fastiq') {
          userUpdates.membership_tier = (status === 'active' || status === 'trialing') ? 'fastiq' : billingUser?.membership_tier;
        }

        if (status === 'past_due' || status === 'canceled') {
          userUpdates.trial_status = 'expired';
          userUpdates.fastiq_trial_active = false;
          if (status === 'canceled') {
            userUpdates.subscription_status = 'canceled';
            userUpdates.fastiq_active = false;
            userUpdates.membership_tier = 'free';
          }
          // Revoke gifted student access if this is a parent-gifted subscription
          if (subscription.metadata?.gifted_by_parent_id) {
            await revokeGiftedStudentAccess(subscription.id);
          }
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user subscription:', billingUser.id, status);
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          const familyUpdates = {
            subscription_status: status,
            stripe_subscription_id: subscription.id,
          };
          if (subscriptionTier) familyUpdates.subscription_tier = subscriptionTier;
          if (subscription.trial_end) familyUpdates.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
          if (subscription.current_period_end) familyUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

          await base44.asServiceRole.entities.Family.update(family.id, familyUpdates);
          console.log('Updated family subscription:', family.id, status, subscriptionTier);

          const memberUpdates = { subscription_status: status };
          if (subscriptionTier) memberUpdates.subscription_tier = subscriptionTier;
          if (subscriptionTier === 'fastiq') {
            memberUpdates.fastiq_active = (status === 'active' || status === 'trialing');
          }
          await updateAllFamilyMembers(family, memberUpdates);
        }
        break;
      }

      // SUBSCRIPTION DELETED
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const customerId = deletedSub.customer;
        const familyId = deletedSub.metadata?.family_id;

        // Handle gifted subscription cancellation — revoke student access
        if (deletedSub.metadata?.gifted_by_parent_id) {
          await revokeGiftedStudentAccess(deletedSub.id);
        }

        const billingUser = await findUserByCustomerId(customerId);

        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member || billingUser.price_tier === 'founding' || billingUser.membership_tier === 'founding_gator')) {
          console.log('Skipping cancellation for founding member:', billingUser.id);
          break;
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
          console.log('Subscription canceled for billing user:', billingUser.id);

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: 'Your CLIFF Pro subscription has been canceled',
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Your CLIFF Pro subscription has been canceled</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Hi ${escapeHtml(billingUser.full_name?.split(' ')[0] || 'there')},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Your CLIFF Pro subscription has been canceled. The account will revert to the free tier — CLIFF stops working in the background, and unlimited applications, outreach, and prep are paused.</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">If this was a mistake, you can reactivate anytime from your dashboard.</p>
  <a href="https://collegefastforward.com/#/FreeTierDashboard" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Go to Dashboard</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">The College Fast Forward Team</p>
</div>`,
            });
            console.log('[stripeWebhook] Cancellation email sent:', billingUser.email);
          } catch (emailError) {
            console.error('[stripeWebhook] Cancellation email failed:', emailError.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          // Guard founding families from cancellation (check all possible flags)
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding' || family.is_founding_subscriber) {
            console.log('Skipping cancellation for founding family:', family.id);
            break;
          }

          await base44.asServiceRole.entities.Family.update(family.id, { subscription_status: 'canceled' });
          console.log('Family subscription canceled:', family.id);

          await updateAllFamilyMembers(family, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
        }
        break;
      }

      // PAYMENT FAILED
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        const attemptCount = invoice.attempt_count || 1;

        const billingUser = await findUserByCustomerId(customerId);
        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member)) {
          console.log('Skipping payment_failed for founding member:', billingUser.id);
          break;
        }

        let familyId = null;
        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            familyId = sub.metadata?.family_id;
          } catch (e) {
            console.log('Could not retrieve subscription for family_id');
          }
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, {
            subscription_status: 'past_due',
            payment_failed_at: new Date().toISOString(),
            payment_failure_count: attemptCount,
          });
          console.log('Marked billing user as past_due:', billingUser.id, 'attempt:', attemptCount);

          const isDay3 = attemptCount >= 2;
          const urgency = isDay3 ? 'Your access will be deactivated soon' : 'Please update your payment method';

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: `Action required: Payment failed for CLIFF Pro — ${urgency}`,
              body: `<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;color:#0f172a;">Payment failed</h1>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">Hi ${escapeHtml(billingUser.full_name?.split(' ')[0] || 'there')},</p>
  <p style="font-size:16px;line-height:1.65;color:#475569;margin-bottom:24px;">We couldn't process your payment for CLIFF Pro. ${isDay3 ? "Access will be deactivated within 24 hours unless payment is resolved." : "Please update your payment method to keep CLIFF Pro active."}</p>
  <a href="https://collegefastforward.com/#/FreeTierDashboard" style="display:inline-block;background:linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;">Update Payment</a>
  <p style="font-size:13px;color:#94a3b8;margin-top:32px;">The College Fast Forward Team</p>
</div>`,
            });
            console.log('[stripeWebhook] Payment failed email sent:', billingUser.email, 'attempt:', attemptCount);
          } catch (emailError) {
            console.error('[stripeWebhook] Payment failed email error:', emailError.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding' || family.is_founding_subscriber) break;
          await base44.asServiceRole.entities.Family.update(family.id, { subscription_status: 'past_due' });
          await updateAllFamilyMembers(family, { subscription_status: 'past_due' });
          console.log('Family marked past_due:', family.id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
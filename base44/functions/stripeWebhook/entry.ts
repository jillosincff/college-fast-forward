import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-11-20.acacia',
});

// ═══════════════════════════════════════════════════════════════
// CFF + FASTIQ Stripe Webhook Handler
// ═══════════════════════════════════════════════════════════════
// Family entity is the SOURCE OF TRUTH for billing.
// One subscription per family covers all linked members.
// Handles: checkout, subscription lifecycle, founding member,
//          payment failures, cancellation emails.
// ═══════════════════════════════════════════════════════════════

let base44;

async function findUserByCustomerId(customerId) {
  const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
  return users?.length > 0 ? users[0] : null;
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

/**
 * Find linked student emails for a parent user.
 */
async function getLinkedStudentEmails(billingUser, family) {
  const emails = [];
  // From user record
  if (billingUser?.student_emails?.length) {
    emails.push(...billingUser.student_emails);
  }
  // From family student_ids
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

/**
 * Send activation email to linked students.
 */
async function sendStudentActivationEmails(billingUser, family) {
  const studentEmails = await getLinkedStudentEmails(billingUser, family);
  const parentName = billingUser?.full_name?.split(' ')[0] || 'Your parent';

  for (const email of studentEmails) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: 'Your parent just turbocharged your job search 🚀',
        body: `
<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0A0A0A;color:#fff;">
  <h1 style="font-size:26px;font-weight:700;margin-bottom:20px;color:#fff;">Your parent just turbocharged your job search 🚀</h1>
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:24px;">${parentName} just activated FastIQ for you.</p>
  <p style="font-size:16px;line-height:1.65;color:#ccc;margin-bottom:8px;">You now have access to:</p>
  <ul style="font-size:15px;line-height:1.8;color:#ccc;margin-bottom:24px;padding-left:0;list-style:none;">
    <li>✓ Full alumni names and contacts at your target companies</li>
    <li>✓ Personalized outreach messages ready to send</li>
    <li>✓ A daily action plan built around your goals</li>
    <li>✓ Resume tailoring, LinkedIn review, and interview prep</li>
  </ul>
  <p style="font-size:16px;line-height:1.65;color:#fff;font-weight:600;margin-bottom:28px;">Your competition doesn't have this. You do.</p>
  <a href="https://www.collegefastforward.com/#Dashboard" style="display:inline-block;background:#E85D20;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:600;font-size:16px;">Start My Job Search →</a>
  <p style="font-size:13px;color:#666;margin-top:32px;">— The College Fast Forward Team</p>
</div>`,
      });
      console.log('Sent activation email to student:', email);
    } catch (e) {
      console.error('Failed to send activation email to:', email, e.message);
    }
  }
}

Deno.serve(async (req) => {
  base44 = createClientFromRequest(req);
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    console.log('Webhook received:', event.type);

    switch (event.type) {

      // ── CHECKOUT COMPLETED ──
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

        console.log('Checkout completed:', { subscriptionTier, customerId, familyId, billingUserEmail, isFoundingMember, plan });

        // Update billing user
        const billingUser = await findUserByCustomerId(customerId);
        if (billingUser) {
          const userUpdates = {
            stripe_subscription_id: subscriptionId,
            subscription_tier: subscriptionTier,
            subscription_status: 'active',
            fastiq_active: subscriptionTier === 'fastiq',
            is_fastiq: subscriptionTier === 'fastiq',
            membership_tier: subscriptionTier === 'fastiq' ? 'fastiq' : billingUser.membership_tier,
          };

          // Founding member metadata
          if (isFoundingMember) {
            userUpdates.founding_offer_redeemed = true;
            userUpdates.founding_offer_redeemed_at = new Date().toISOString();
            userUpdates.founding_member_plan = 'fastiq_founding_annual';
          }

          await base44.asServiceRole.entities.User.update(billingUser.id, userUpdates);
          console.log('Updated billing user:', billingUser.id, 'tier:', subscriptionTier, 'founding:', isFoundingMember);

          // Update Stripe customer metadata
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

        // Update Family record (source of truth)
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

          // Propagate to ALL family members
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

        // Send activation emails to linked students
        if (subscriptionTier === 'fastiq' && billingUser) {
          await sendStudentActivationEmails(billingUser, family);
        }

        break;
      }

      // ── SUBSCRIPTION CREATED / UPDATED ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionTier = subscription.metadata?.subscription_tier;
        const familyId = subscription.metadata?.family_id;
        const status = subscription.status;

        console.log('Subscription event:', event.type, { status, subscriptionTier, familyId });

        const billingUser = await findUserByCustomerId(customerId);

        const userUpdates = {
          stripe_subscription_id: subscription.id,
          subscription_status: status,
        };
        if (subscriptionTier) userUpdates.subscription_tier = subscriptionTier;
        if (subscription.trial_end) userUpdates.trial_end_date = new Date(subscription.trial_end * 1000).toISOString();
        if (subscription.current_period_end) userUpdates.current_period_end = new Date(subscription.current_period_end * 1000).toISOString();

        // Set fastiq_active based on status
        if (subscriptionTier === 'fastiq') {
          userUpdates.fastiq_active = (status === 'active' || status === 'trialing');
          userUpdates.membership_tier = (status === 'active' || status === 'trialing') ? 'fastiq' : billingUser?.membership_tier;
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

      // ── SUBSCRIPTION DELETED ──
      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object;
        const customerId = deletedSub.customer;
        const familyId = deletedSub.metadata?.family_id;

        const billingUser = await findUserByCustomerId(customerId);

        if (billingUser && (billingUser.subscription_tier === 'free_founding' || billingUser.is_founding_member || billingUser.price_tier === 'founding')) {
          console.log('Skipping cancellation for founding member:', billingUser.id);
          break;
        }

        if (billingUser) {
          await base44.asServiceRole.entities.User.update(billingUser.id, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
          console.log('Subscription canceled for billing user:', billingUser.id);

          // Send cancellation email
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: 'Your FastIQ subscription has been canceled',
              body: `
<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:16px;color:#333;">Your FastIQ subscription has been canceled</h1>
  <p style="font-size:16px;line-height:1.65;color:#666;margin-bottom:24px;">Hi ${billingUser.full_name?.split(' ')[0] || 'there'},</p>
  <p style="font-size:16px;line-height:1.65;color:#666;margin-bottom:24px;">Your FastIQ subscription has been canceled. Your student will revert to the free tier and lose access to full alumni contacts, personalized outreach, and the AI career engine.</p>
  <p style="font-size:16px;line-height:1.65;color:#666;margin-bottom:24px;">If this was a mistake, you can reactivate anytime from your dashboard.</p>
  <a href="https://www.collegefastforward.com/#ParentHome" style="display:inline-block;background:#E85D20;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:600;font-size:16px;">Go to Dashboard →</a>
  <p style="font-size:13px;color:#999;margin-top:32px;">— The College Fast Forward Team</p>
</div>`,
            });
          } catch (e) {
            console.error('Failed to send cancellation email:', e.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding') {
            console.log('Skipping cancellation for founding family:', family.id);
            break;
          }

          await base44.asServiceRole.entities.Family.update(family.id, { subscription_status: 'canceled' });
          console.log('Family subscription canceled:', family.id);

          // Deactivate all family members
          await updateAllFamilyMembers(family, {
            subscription_status: 'canceled',
            fastiq_active: false,
          });
        }
        break;
      }

      // ── PAYMENT FAILED ──
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

          // Send payment failure email
          const isDay1 = attemptCount <= 1;
          const isDay3 = attemptCount >= 2;
          const urgency = isDay3 ? 'Your access will be deactivated soon' : 'Please update your payment method';

          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: billingUser.email,
              subject: `Action required: Payment failed for FastIQ — ${urgency}`,
              body: `
<div style="font-family:'DM Sans',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
  <h1 style="font-size:24px;font-weight:700;margin-bottom:16px;color:#333;">Payment failed</h1>
  <p style="font-size:16px;line-height:1.65;color:#666;margin-bottom:24px;">Hi ${billingUser.full_name?.split(' ')[0] || 'there'},</p>
  <p style="font-size:16px;line-height:1.65;color:#666;margin-bottom:24px;">We couldn't process your payment for FastIQ. ${isDay3 ? 'Your student\'s access will be deactivated within 24 hours unless payment is resolved.' : 'Please update your payment method to keep your student\'s access active.'}</p>
  <a href="https://www.collegefastforward.com/#ParentHome" style="display:inline-block;background:#E85D20;color:#fff;padding:14px 36px;border-radius:100px;text-decoration:none;font-weight:600;font-size:16px;">Update Payment →</a>
  <p style="font-size:13px;color:#999;margin-top:32px;">— The College Fast Forward Team</p>
</div>`,
            });
          } catch (e) {
            console.error('Failed to send payment failure email:', e.message);
          }
        }

        const family = await findFamily(familyId, customerId);
        if (family) {
          if (family.subscription_tier === 'free_founding' || family.price_tier === 'founding') break;
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
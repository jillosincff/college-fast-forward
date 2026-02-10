import { base44 } from '@/api/base44Client';

/**
 * Checks if a user has a pending ActivationPrompt and marks it as activated.
 * Lightweight, non-blocking — failures are silently caught.
 *
 * @param {string} userId - The user's ID
 * @param {string} actionType - e.g. "answered_question", "sent_message", "linked_student", etc.
 */
export async function checkAndMarkActivation(userId, actionType) {
  try {
    if (!userId) return;

    const prompts = await base44.entities.ActivationPrompt.filter(
      { user_id: userId, action_taken: false },
      '-created_date',
      1
    );

    const prompt = prompts?.[0];
    if (!prompt) return;

    await base44.entities.ActivationPrompt.update(prompt.id, {
      action_taken: true,
      action_type: actionType,
      acted_at: new Date().toISOString(),
      status: 'acted',
    });

    console.log(`✅ Activation marked for user ${userId}: ${actionType}`);
  } catch (err) {
    // Non-blocking — never break the parent action
    console.log('Activation check failed (non-critical):', err.message);
  }
}
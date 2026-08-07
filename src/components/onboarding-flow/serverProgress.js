import { base44 } from '@/api/base44Client';

// Onboarding answers used to live only in localStorage, so anyone who signed in
// with Google and came back on another device (or after clearing their browser)
// restarted from zero — the single biggest signup drop-off. Authenticated users
// now mirror their progress onto their own account.

const KEYS = {
  cff_seeking: 'seeking',
  cff_college: 'college',
  cff_year: 'yearLevel',
  cff_goal_text: 'goalText',
  cff_blockers: 'blockers',
  cff_industries: 'selectedIndustries',
  cff_target_roles: 'targetRoles',
  cff_location_pref: 'locationPref',
  cff_location_city: 'locationCity',
  cff_work_location: 'workLocation',
  cff_resume_url: 'resumeUrl',
};

// Fire-and-forget — onboarding must never block or fail on a save.
export function saveServerProgress(screen, answers) {
  base44.auth
    .me()
    .then((user) => {
      if (!user) return null;
      return base44.auth.updateMe({
        onboarding_progress: { screen, answers, updated_at: new Date().toISOString() },
      });
    })
    .catch(() => {});
}

// Returns saved answers mapped to flow state names, or null.
export async function loadServerProgress() {
  try {
    const user = await base44.auth.me().catch(() => null);
    const progress = user?.onboarding_progress;
    if (!progress?.screen) return null;

    const answers = progress.answers || {};
    const mapped = {};
    for (const [storageKey, stateKey] of Object.entries(KEYS)) {
      const value = answers[storageKey];
      if (value === undefined || value === null || value === '') continue;
      mapped[stateKey] = value;
      // Mirror back into localStorage so saveAndAuth's existing handoff still works
      try {
        localStorage.setItem(storageKey, typeof value === 'object' ? JSON.stringify(value) : String(value));
      } catch {}
    }
    try { localStorage.setItem('cff_onboarding_screen', String(progress.screen)); } catch {}

    return { screen: progress.screen, ...mapped };
  } catch {
    return null;
  }
}
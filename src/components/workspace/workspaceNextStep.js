// Dynamic application plan: CLIFF decides the one next step for this pursuit.
// Steps are derived from real state — not every job goes through identical steps.

const resumeDone = s => ['ready_for_review', 'approved', 'complete'].includes(s || '');

export function computeVerdict(fit) {
  const label = fit?.fit_label || '';
  if (label === 'Strong Match') return { icon: '🔥', word: 'Pursue', tone: 'pursue' };
  return { icon: '⭐', word: 'Worth pursuing', tone: 'consider' };
}

// Returns { key, title, detail, time, ctaLabel, cta } — cta is 'tailor' | 'apply' | 'interview' | 'tracker' | 'back'
export function computeNextStep(pursuit, fit) {
  const appStatus = pursuit?.application_status || '';

  if (appStatus === 'interviewing' || pursuit?.interview_status === 'scheduled') {
    return {
      key: 'interview',
      title: 'Practice for your interview.',
      detail: 'You have an interview coming up — a focused practice round is the highest-leverage thing you can do.',
      time: '~10 min', ctaLabel: 'Start practice', cta: 'interview',
    };
  }
  if (appStatus === 'follow_up_due') {
    return {
      key: 'followup',
      title: 'Send your follow-up.',
      detail: "It's been long enough since you applied — a short, polite follow-up keeps you on their radar.",
      time: '~3 min', ctaLabel: 'Open tracker', cta: 'tracker',
    };
  }
  if (appStatus === 'applied') {
    return {
      key: 'applied',
      title: "You've applied — nothing urgent here.",
      detail: "I'm watching this one. If a follow-up or interview prep becomes worth your time, it'll show up on your dashboard.",
      time: '0 min', ctaLabel: 'View in tracker', cta: 'tracker',
    };
  }
  return {
    key: 'apply',
    title: 'Apply to this job.',
    detail: resumeDone(pursuit?.resume_status)
      ? 'Your tailored resume is ready — send this one today.'
      : 'This one is worth sending. Tailor your resume first if you want, then apply.',
    time: '~10 min', ctaLabel: 'Apply to this job', cta: 'apply',
  };
}

// Compact plan for display: only the steps THIS job actually needs, in order.
export function computePlan(pursuit, nextKey) {
  const steps = [
    { key: 'resume', label: 'Resume', done: resumeDone(pursuit?.resume_status) },
    { key: 'apply', label: 'Apply', done: ['applied', 'follow_up_due', 'interviewing', 'offer'].includes(pursuit?.application_status || '') },
  ];
  if (['followup', 'applied'].includes(nextKey) || pursuit?.application_status === 'follow_up_due') {
    steps.push({ key: 'followup', label: 'Follow-up', done: false });
  }
  if (nextKey === 'interview' || pursuit?.interview_status === 'scheduled' || pursuit?.interview_status === 'completed') {
    steps.push({ key: 'interview', label: 'Interview', done: pursuit?.interview_status === 'completed' });
  }
  return steps;
}
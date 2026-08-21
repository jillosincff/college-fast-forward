// Deterministic Magic Moment outreach draft. Uses ONLY facts we actually
// collected: school, this job's title + company, the insider's name, and the
// student's own name. Never guesses a major or embellishes. The apply line
// swaps based on whether the student has applied yet.
export function buildOutreachDraft({ school, jobTitle, company, insiderName, studentName, applied }) {
  const insiderFirst = (insiderName || '').trim().split(/\s+/)[0] || '';
  const opener = insiderFirst ? `Hi ${insiderFirst} — ` : 'Hi — ';
  const schoolBit = school ? ` at ${school}` : '';
  const applyLine = applied
    ? `I just applied for the ${jobTitle} role at ${company}.`
    : `I'm applying for the ${jobTitle} role at ${company}.`;
  const ask = insiderFirst
    ? `If you have a minute, I'd really appreciate any quick advice on standing out. Thanks either way!`
    : `If anyone on the team has a minute, I'd really appreciate any quick advice on standing out. Thanks either way!`;
  const body = `${opener}I'm a student${schoolBit}. ${applyLine} ${ask}`;
  const sig = (studentName || '').trim().split(/\s+/)[0] || '';
  return {
    subject: `Quick note about the ${jobTitle} role at ${company}`,
    message: sig ? `${body}\n\n${sig}` : body,
    cold: !insiderFirst,
  };
}
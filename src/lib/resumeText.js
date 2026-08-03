// Turns the structured resume the onboarding parser returns into the flat text
// that Resume.parsed_text stores — tailoring and overnight prep both read that field.
export function parsedResumeToText(p) {
  if (!p || typeof p !== 'object') return '';
  const lines = [];
  if (p.name) lines.push(p.name);
  const contact = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join(' | ');
  if (contact) lines.push(contact);
  if (p.summary) lines.push('', 'SUMMARY', p.summary);

  if (p.education?.length) {
    lines.push('', 'EDUCATION');
    p.education.forEach(e => {
      lines.push([e.school, e.degree, e.dates].filter(Boolean).join(' — '));
      if (e.gpa) lines.push(`GPA: ${e.gpa}`);
      if (e.honors) lines.push(e.honors);
    });
  }

  if (p.experience?.length) {
    lines.push('', 'EXPERIENCE');
    p.experience.forEach(x => {
      lines.push([x.title, x.company, x.location, x.dates].filter(Boolean).join(' — '));
      (x.bullets || []).forEach(b => lines.push(`- ${b}`));
    });
  }

  if (p.activities?.length) {
    lines.push('', 'ACTIVITIES');
    p.activities.forEach(a => lines.push([a.name, a.role, a.dates].filter(Boolean).join(' — ')));
  }

  if (p.skills?.length) lines.push('', 'SKILLS', p.skills.join(', '));

  return lines.join('\n').trim();
}

// Persists the parsed resume so CLIFF can actually use it later.
// Safe to call twice — the funnel and the post-OAuth finalizer both try.
export async function saveParsedResume(base44, email, parsed, fileUrl, fileName) {
  const text = parsedResumeToText(parsed);
  if (!email || text.length < 100) return null;
  const existing = await base44.entities.Resume.filter({ student_email: email }, '-created_date', 5).catch(() => []);
  if ((existing || []).some(r => (r.parsed_text || '').length > 100)) return null;
  return base44.entities.Resume.create({
    student_email: email,
    name: 'My Resume',
    original_file_name: fileName || '',
    original_file_url: fileUrl || '',
    parsed_text: text,
    is_active: true,
  });
}
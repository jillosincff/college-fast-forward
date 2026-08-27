import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { buildLiveJobsList } from '@/lib/jobsPipeline';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Paid-only people panel. Calls Layer 1 (findCliffPeople) first; if empty,
// calls Layer 2 (findJessePeople, ~18s hard cap). Falls back to pre-filled
// LinkedIn search if both are empty/slow. Best Path badge only when a
// returned person's company matches a LIVE job with a verified apply URL.
export default function JessePeopleCard({ user }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [bestPath, setBestPath] = useState(null); // { person, job }
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let mounted = true;
    (async () => {
      const cg = user.career_goals || {};
      const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
      const industries = cg.target_industries || [];
      const location = cg.location_preference || '';
      const chipParts = [role, ...industries].filter((p, i, a) => {
        const k = (p || '').toLowerCase().trim();
        return k && a.findIndex(x => (x || '').toLowerCase().trim() === k) === i;
      });
      const chipText = chipParts.join(' ').trim();
      const school = user.school || user.school_code || '';

      // Fetch people + live jobs in parallel (jobs for Best Path matching)
      const [peopleResult, jobsResult] = await Promise.all([
        fetchPeople(user, { role, industries, location, chipText, school }),
        buildLiveJobsList({ role, industries, location, seeking: cg.seeking, chipText }),
      ]);

      if (!mounted) return;
      setPeople(peopleResult.people);
      setSource(peopleResult.source);

      // Best Path: person.company matches a live job's company
      if (peopleResult.people.length && jobsResult.jobs.length) {
        const match = matchBestPath(peopleResult.people, jobsResult.jobs);
        if (match) setBestPath(match);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [user?.email]);

  const linkedInFallbackUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${user?.school || ''} ${source === 'jesse' ? '' : ''} ${user?.career_goals?.target_roles?.[0] || ''} ${user?.career_goals?.location_preference || ''}`.trim())}`;

  if (loading) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '24px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Users size={16} color="#7c3aed" />
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>People from your school</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #ede9fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#6b7280', margin: 0 }}>Finding people from your school…</p>
        </div>
      </div>
    );
  }

  // No people found — honest LinkedIn fallback
  if (people.length === 0) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Users size={16} color="#7c3aed" />
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>People from your school</span>
        </div>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No alumni found right now.</p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
          CLIFF couldn't find verified alumni for this search. Search LinkedIn directly — we've pre-filled it with your school and field.
        </p>
        <a href={linkedInFallbackUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff', background: '#0A66C2', border: 'none', padding: '12px 16px', borderRadius: 999, textDecoration: 'none', width: '100%' }}>
          Search LinkedIn <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '20px 20px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Users size={16} color="#7c3aed" />
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          People from your school
        </span>
        {source === 'jesse' && (
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#6d28d9', background: '#ede9fe', borderRadius: 999, padding: '2px 8px' }}>via Jesse</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {people.slice(0, 3).map((person, i) => (
          <PersonRow
            key={i}
            person={person}
            isBestPath={bestPath?.person === person}
            job={bestPath?.person === person ? bestPath.job : null}
            user={user}
            copied={copied === i}
            onCopy={() => { setCopied(i); setTimeout(() => setCopied(null), 2000); }}
          />
        ))}
      </div>
    </div>
  );
}

function PersonRow({ person, isBestPath, job, user, copied, onCopy }) {
  const draft = buildDraft(person, user, job);
  const linkedinUrl = person.linkedin_url || person.source_url || '';

  const handleCopy = () => {
    navigator.clipboard?.writeText(draft).catch(() => {});
    onCopy();
  };

  return (
    <div style={{ background: isBestPath ? '#f5f3ff' : '#f8f9fc', border: isBestPath ? '1px solid #ddd6fe' : '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: dm }}>
          {(person.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{person.name}</p>
            {isBestPath && (
              <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 999, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Sparkles size={9} /> Best Path
              </span>
            )}
          </div>
          {person.role_title && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '1px 0 0' }}>{person.role_title}{person.company ? ` · ${person.company}` : ''}</p>}
        </div>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, flexShrink: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'none', fontFamily: dm }}>in</a>
        )}
      </div>
      {/* CLIFF-written outreach draft */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{draft}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleCopy} style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: copied ? '#059669' : '#7c3aed', background: copied ? '#d1fae5' : '#fff', border: '1px solid ' + (copied ? '#a7f3d0' : '#ddd6fe'), borderRadius: 999, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy message</>}
        </button>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#0A66C2', border: 'none', borderRadius: 999, padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <ExternalLink size={13} /> Open LinkedIn
          </a>
        )}
      </div>
    </div>
  );
}

// CLIFF writes the draft: school + company + chip; if Best Path, name the open job.
function buildDraft(person, user, job) {
  const school = user?.school || user?.school_code || 'your school';
  const chip = (user?.career_goals?.target_roles || [])[0] || (user?.career_goals?.target_industries || [])[0] || 'this field';
  const firstName = (person.name || '').split(' ')[0];
  let msg = `Hi ${firstName}, I'm a student at ${school} interested in ${chip}. I came across your profile and noticed you're ${person.role_title || 'working'}${person.company ? ` at ${person.company}` : ''}.`;
  if (job) {
    msg += `\n\nI saw ${person.company} is hiring for ${job.job_title} — I'd love to hear about your experience there and any advice you might have.`;
  } else {
    msg += `\n\nI'd love to hear about your career path and any advice you might have for someone starting out.`;
  }
  msg += `\n\nThanks for your time!`;
  return msg;
}

// Best Path: person.company matches a live job's company (verified apply URL).
function matchBestPath(people, jobs) {
  const liveJobs = jobs.filter(j => j.live === true && (j.job_url || j.apply_url || j.url));
  for (const person of people) {
    const personCompany = (person.company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!personCompany) continue;
    const job = liveJobs.find(j => {
      const jobCompany = (j.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return jobCompany && (jobCompany.includes(personCompany) || personCompany.includes(jobCompany));
    });
    if (job) return { person, job };
  }
  return null;
}

// Layer 1 (findCliffPeople) → Layer 2 (findJessePeople) → empty fallback.
async function fetchPeople(user, { role, industries, location, chipText, school }) {
  const schoolCode = (user.school_code || '').toUpperCase();
  const params = {
    schoolName: school, schoolCode,
    chipText, location, targetRole: role,
    magic_moment: false, // paid dashboard, not onboarding
  };

  // Layer 1: opt-in graph + cached alumni + public web
  try {
    const r1 = await base44.functions.invoke('findCliffPeople', params);
    const c1 = r1?.data?.connections || r1?.connections || [];
    if (c1.length >= 3) return { people: c1, source: 'layer1' };
    // Layer 2: Jesse (paid only, ~18s hard cap)
    try {
      const r2 = await base44.functions.invoke('findJessePeople', {
        schoolName: school, schoolCode, chipText, location, targetRole: role,
      });
      const c2 = r2?.data?.connections || r2?.connections || [];
      if (c2.length > 0) return { people: c2, source: 'jesse' };
    } catch (e) { /* Jesse failed — fall through */ }
    // Return whatever Layer 1 found (even if < 3)
    if (c1.length > 0) return { people: c1, source: 'layer1' };
  } catch (e) { /* Layer 1 failed — try Jesse directly */ }
  // Last resort: try Jesse directly
  try {
    const r2 = await base44.functions.invoke('findJessePeople', {
      schoolName: school, schoolCode, chipText, location, targetRole: role,
    });
    const c2 = r2?.data?.connections || r2?.connections || [];
    if (c2.length > 0) return { people: c2, source: 'jesse' };
  } catch (e) {}
  return { people: [], source: 'none' };
}
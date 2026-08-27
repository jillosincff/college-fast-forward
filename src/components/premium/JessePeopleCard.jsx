import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ExternalLink, Copy, Check, Sparkles, Search } from 'lucide-react';
import { buildLiveJobsList } from '@/lib/jobsPipeline';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const MAX_JESSE_RETRIES = 5;
const RETRY_DELAY_MS = 12000;

// Paid-only people panel. Calls Layer 1 (findCliffPeople with school_level)
// first for a fast LLM-based public search. If empty, calls Layer 2
// (findJessePeople) which uses the Jesse agent — but Jesse takes ~60-90s, so
// it uses an async retry pattern: the function returns { pending: true,
// searchId } and this component retries with that searchId until results
// arrive. Results are cached 24h server-side, so repeat visits are instant.
export default function JessePeopleCard({ user }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // Jesse search in progress
  const [source, setSource] = useState('');
  const [bestPath, setBestPath] = useState(null);
  const [copied, setCopied] = useState(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    if (!user?.email) return;
    let mounted = true;
    let retryTimer = null;

    const run = async (retrySearchId = null) => {
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
      const schoolCode = (user.school_code || '').toUpperCase();

      // Fetch people + live jobs in parallel (jobs for Best Path matching)
      const [peopleResult, jobsResult] = await Promise.all([
        fetchPeople(user, { role, industries, location, chipText, school, schoolCode }, retrySearchId),
        buildLiveJobsList({ role, industries, location, seeking: cg.seeking, chipText }),
      ]);

      if (!mounted) return;
      setPeople(peopleResult.people);
      setSource(peopleResult.source);
      setSearching(peopleResult.pending || false);

      if (peopleResult.people.length && jobsResult.jobs.length) {
        const match = matchBestPath(peopleResult.people, jobsResult.jobs);
        if (match) setBestPath(match);
      }
      setLoading(false);

      // If Jesse is still searching, retry with the searchId after a delay
      if (peopleResult.pending && peopleResult.searchId && retryCountRef.current < MAX_JESSE_RETRIES && mounted) {
        retryCountRef.current += 1;
        retryTimer = setTimeout(() => run(peopleResult.searchId), RETRY_DELAY_MS);
      } else if (peopleResult.pending) {
        // Exhausted retries — stop searching, show LinkedIn fallback
        setSearching(false);
      }
    };

    run();
    return () => { mounted = false; if (retryTimer) clearTimeout(retryTimer); };
  }, [user?.email]);

  const linkedInFallbackUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${user?.school || ''} ${user?.career_goals?.target_roles?.[0] || ''} ${user?.career_goals?.location_preference || ''}`.trim())}`;

  // Loading state — first call, no results yet
  if (loading && !searching) {
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

  // Jesse search in progress — show searching state (not the LinkedIn fallback)
  if (searching) {
    return (
      <div style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: 16, padding: '20px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Users size={16} color="#7c3aed" />
          <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>People from your school</span>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 700, color: '#6d28d9', background: '#ede9fe', borderRadius: 999, padding: '2px 8px' }}>searching</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #ede9fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#6b7280', margin: 0 }}>CLIFF is searching LinkedIn for alumni at your school…</p>
        </div>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
          This takes about a minute. We're finding real people from {user?.school || 'your school'} in your field — check back shortly.
        </p>
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
          <Search size={14} /> Search LinkedIn <ExternalLink size={14} />
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
        {(source === 'jesse' || source === 'cache') && (
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

// Layer 1 (findCliffPeople with school_level) → Layer 2 (findJessePeople with
// async retry). If Jesse is still searching, returns { pending: true, searchId }
// so the caller can retry.
async function fetchPeople(user, { role, industries, location, chipText, school, schoolCode }, retrySearchId = null) {
  // On first call (no retrySearchId), try Layer 1: findCliffPeople with
  // school_level=true runs a fast LLM + internet search (~5-10s). If it finds
  // people, we skip Jesse entirely.
  if (!retrySearchId) {
    try {
      const r1 = await base44.functions.invoke('findCliffPeople', {
        schoolName: school, schoolCode,
        chipText, location, targetRole: role,
        magic_moment: false, school_level: true,
      });
      const c1 = r1?.data?.connections || r1?.connections || [];
      if (c1.length > 0) return { people: c1, source: 'layer1', pending: false };
    } catch (e) { /* Layer 1 failed — fall through to Jesse */ }
  }

  // Layer 2: Jesse (paid only, async retry pattern)
  try {
    const r2 = await base44.functions.invoke('findJessePeople', {
      schoolName: school, schoolCode, chipText, location, targetRole: role,
      searchId: retrySearchId,
    });
    const c2 = r2?.data?.connections || r2?.connections || [];
    if (c2.length > 0) return { people: c2, source: 'jesse', pending: false };
    // If pending, return the searchId for retry
    const pending = r2?.data?.pending || r2?.pending;
    const searchId = r2?.data?.searchId || r2?.searchId;
    if (pending && searchId) return { people: [], source: 'jesse', pending: true, searchId };
  } catch (e) { /* Jesse failed — fall through */ }

  return { people: [], source: 'none', pending: false };
}
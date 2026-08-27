import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ExternalLink, Copy, Check, Sparkles, Search, Loader2, Mail } from 'lucide-react';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

const MAX_JESSE_RETRIES = 5;
const RETRY_DELAY_MS = 12000;

// Pro people panel — company-first, Jesse on demand.
//
// Flow:
// 1. Jobs load (live Apply only) — passed from ProHomeFeed.
// 2. Fast people: Layer 1 + cache, company-scoped to the employers in the
//    jobs list. Hit → show 3 + Best Path. Miss → honest message + explicit ask.
// 3. Ask: "Want CLIFF to find where [school] alumni in [chip] landed in [city]?"
//    [Find them] [Not now]
// 4. Only when the user clicks [Find them] does Jesse start. Show progress.
//    Results cached 24h server-side.
//
// Never starts Jesse on page load. Never runs for free users (findJessePeople
// gates on isProUser server-side).
export default function JessePeopleCard({ user, jobs, jobsLoading }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [bestPath, setBestPath] = useState(null);
  const [copied, setCopied] = useState(null);
  const [jesseState, setJesseState] = useState('idle'); // 'idle' | 'searching' | 'done'
  const [jessePeople, setJessePeople] = useState([]);
  const [jesseError, setJesseError] = useState(false);
  const retryCountRef = useRef(0);
  const jesseTimerRef = useRef(null);

  // Derive career context once
  const cg = user?.career_goals || {};
  const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
  const industries = cg.target_industries || [];
  const location = cg.location_preference || '';
  const school = user?.school || user?.school_code || 'your school';
  const schoolCode = (user?.school_code || '').toUpperCase();
  const chipParts = [role, ...industries].filter((p, i, a) => {
    const k = (p || '').toLowerCase().trim();
    return k && a.findIndex(x => (x || '').toLowerCase().trim() === k) === i;
  });
  const chipText = chipParts.join(' ').trim() || role || 'your field';

  // ── Phase 1: company-scoped fast search (Layer 1 + cache, no LLM, no Jesse)
  useEffect(() => {
    if (!user?.email || jobsLoading) return;
    let mounted = true;

    const run = async () => {
      const liveJobs = (jobs || []).filter(j => j.live !== false && (j.job_url || j.apply_url || j.url));
      const companies = [...new Set(liveJobs.map(j => j.name).filter(Boolean))].slice(0, 6);

      if (companies.length === 0) {
        // No live jobs → no companies to search → straight to ask
        if (mounted) { setPeople([]); setLoading(false); }
        return;
      }

      // One fast findCliffPeople call per company — opt-in graph + cache only
      const results = await Promise.all(
        companies.map(c =>
          base44.functions.invoke('findCliffPeople', {
            schoolName: school, schoolCode,
            companyName: c, targetRole: role,
            magic_moment: false, fast_only: true,
          }).catch(() => ({ connections: [] }))
        )
      );

      if (!mounted) return;
      const all = results.flatMap(r => r?.data?.connections || r?.connections || []);
      const seen = new Set();
      const deduped = all.filter(c => {
        const k = (c.name || '').toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k); return true;
      });

      setPeople(deduped.slice(0, 3));
      setSource(deduped.length > 0 ? 'cliff' : '');

      if (deduped.length && liveJobs.length) {
        const match = matchBestPath(deduped, liveJobs);
        if (match) setBestPath(match);
      }
      setLoading(false);
    };

    run();
    return () => { mounted = false; };
  }, [user?.email, jobsLoading, jobs]);

  // ── Phase 2: Jesse search — only when user clicks [Find them]
  const startJesseSearch = () => {
    setJesseState('searching');
    setJesseError(false);
    setJessePeople([]);
    retryCountRef.current = 0;
    runJesseSearch(null);
  };

  const runJesseSearch = async (retrySearchId) => {
    try {
      const r = await base44.functions.invoke('findJessePeople', {
        schoolName: school, schoolCode, chipText, location, targetRole: role,
        searchId: retrySearchId,
      });
      const connections = r?.data?.connections || r?.connections || [];
      if (connections.length > 0) {
        setJessePeople(connections.slice(0, 3));
        setJesseState('done');
        const liveJobs = (jobs || []).filter(j => j.live !== false && (j.job_url || j.apply_url || j.url));
        if (liveJobs.length) {
          const match = matchBestPath(connections, liveJobs);
          if (match) setBestPath(match);
        }
        return;
      }
      const pending = r?.data?.pending || r?.pending;
      const searchId = r?.data?.searchId || r?.searchId;
      if (pending && searchId && retryCountRef.current < MAX_JESSE_RETRIES) {
        retryCountRef.current += 1;
        jesseTimerRef.current = setTimeout(() => runJesseSearch(searchId), RETRY_DELAY_MS);
      } else {
        // Exhausted retries or search failed with no results
        setJesseState('done');
        if (!connections.length) setJesseError(true);
      }
    } catch (e) {
      setJesseState('done');
      setJesseError(true);
    }
  };

  // Cleanup Jesse retry timer on unmount
  useEffect(() => () => { if (jesseTimerRef.current) clearTimeout(jesseTimerRef.current); }, []);

  // ── Render ──
  const showJesseResults = jesseState === 'done' && jessePeople.length > 0;
  const displayPeople = showJesseResults ? jessePeople : people;
  const linkedInFallbackUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${school} ${role} ${location}`.trim())}`;

  // Loading — fast search in progress
  if (loading) {
    return (
      <div style={cardStyle}>
        <Header label="People from your school" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #ede9fe', borderTop: '2px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <p style={{ ...bodyStyle, fontWeight: 600 }}>Finding people at these companies…</p>
        </div>
      </div>
    );
  }

  // Jesse searching — progress state
  if (jesseState === 'searching') {
    return (
      <div style={{ ...cardStyle, border: '1px solid #ddd6fe' }}>
        <Header label="People from your school" badge="searching" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Loader2 size={16} color="#7c3aed" style={{ animation: 'spin 0.7s linear infinite' }} />
          <p style={{ ...bodyStyle, fontWeight: 600 }}>CLIFF is searching for {school} alumni in {chipText}{location ? ` in ${location}` : ''}…</p>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
          This takes about a minute. CLIFF is scanning public sources to find real alumni who landed in your field — check back shortly.
        </p>
      </div>
    );
  }

  // People found (fast search or Jesse results)
  if (displayPeople.length > 0) {
    const sourceLabel = showJesseResults ? 'via CliFF' : (source === 'cliff' ? 'via CliFF' : '');
    return (
      <div style={cardStyle}>
        <Header label="People from your school" badge={sourceLabel} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayPeople.map((person, i) => (
            <PersonRow
              key={i}
              person={person}
              isBestPath={bestPath?.person === person}
              job={bestPath?.person === person ? bestPath.job : null}
              user={user}
              chipText={chipText}
              location={location}
              copied={copied === i}
              onCopy={() => { setCopied(i); setTimeout(() => setCopied(null), 2000); }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Jesse done but no results — honest message + LinkedIn fallback
  if (jesseState === 'done' && jesseError) {
    return (
      <div style={cardStyle}>
        <Header label="People from your school" />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No alumni found right now.</p>
        <p style={{ ...bodyStyle, margin: '0 0 12px' }}>
          CLIFF couldn't find verified {school} alumni in {chipText}{location ? ` in ${location}` : ''}. Search LinkedIn directly — we've pre-filled it.
        </p>
        <a href={linkedInFallbackUrl} target="_blank" rel="noopener noreferrer" style={linkedInBtnStyle}>
          <Search size={14} /> Search LinkedIn <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  // Fast search miss — honest message + explicit ask
  return (
    <div style={{ ...cardStyle, border: '1px solid #e9d5ff' }}>
      <Header label="People from your school" />
      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>
        Nobody from {school} at these companies yet.
      </p>
      <p style={{ ...bodyStyle, margin: '0 0 14px' }}>
        CLIFF checked your school's alumni network and the employers in your job matches — no warm connections surfaced.
      </p>
      {/* Explicit ask — not hidden in a tiny link */}
      <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '14px 14px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#4c1d95', margin: '0 0 4px' }}>
          Want CLIFF to find where {school} alumni in {chipText} landed{location ? ` in ${location}` : ''}?
        </p>
        <p style={{ fontSize: 12, color: '#7c3aed', margin: '0 0 12px' }}>
          Takes about a minute. CLIFF searches public sources for real alumni in your field.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startJesseSearch} style={findBtnStyle}>
            <Search size={14} /> Find them
          </button>
          <button onClick={() => setJesseState('done')} style={notNowBtnStyle}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Header({ label, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <Users size={16} color="#7c3aed" />
      <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      {badge && (
        <span style={{
          fontFamily: dm, fontSize: 9, fontWeight: 700,
          color: badge === 'searching' ? '#6d28d9' : '#4c1d95',
          background: badge === 'searching' ? '#ede9fe' : '#f5f3ff',
          borderRadius: 999, padding: '2px 8px',
        }}>{badge}</span>
      )}
    </div>
  );
}

function PersonRow({ person, isBestPath, job, user, chipText, location, copied, onCopy }) {
  const draft = buildDraft(person, user, job, chipText, location);
  const linkedinUrl = person.linkedin_url || person.source_url || '';
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = () => {
    if (!person.email) return;
    try { navigator.clipboard?.writeText(person.email); } catch {}
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
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
          {person.role_title && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '1px 0 0' }}>{person.role_title}{person.company ? ` · ${person.company}` : ''}{person.school ? ` · ${person.school}` : ''}</p>}
        </div>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, flexShrink: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'none', fontFamily: dm }}>in</a>
        )}
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{draft}</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCopy} style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: copied ? '#059669' : '#7c3aed', background: copied ? '#d1fae5' : '#fff', border: '1px solid ' + (copied ? '#a7f3d0' : '#ddd6fe'), borderRadius: 999, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy message</>}
        </button>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#0A66C2', border: 'none', borderRadius: 999, padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <ExternalLink size={13} /> Open LinkedIn
          </a>
        )}
      </div>
      {person.email && (
        <button onClick={copyEmail} style={{ width: '100%', marginTop: 8, fontFamily: dm, fontSize: 12, fontWeight: 600, color: emailCopied ? '#059669' : '#6b7280', background: emailCopied ? '#d1fae5' : '#f8f9fc', border: '1px solid ' + (emailCopied ? '#a7f3d0' : '#e5e7eb'), borderRadius: 999, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {emailCopied ? <><Check size={12} /> Email copied</> : <><Mail size={12} /> Copy email</>}
        </button>
      )}
    </div>
  );
}

// ── Helpers ──

function buildDraft(person, user, job, chipText, location) {
  const schoolShort = user?.school_code || user?.school || 'your school';
  const firstName = (person.name || '').split(' ')[0];
  const company = person.company || '';
  const field = chipText || 'this field';
  const locClause = location ? ` in ${location}` : '';

  if (job && company) {
    return `Hi ${firstName} — ${schoolShort} student looking at ${field}${locClause}. I saw ${company} is hiring for ${job.job_title}. Would you have 10 minutes to share how you got started there?`;
  }
  if (company) {
    return `Hi ${firstName} — ${schoolShort} student looking at ${field}${locClause}. Would you have 10 minutes to share how you got started at ${company}?`;
  }
  return `Hi ${firstName} — ${schoolShort} student looking at ${field}${locClause}. Would you have 10 minutes to share how you got started?`;
}

function matchBestPath(people, jobs) {
  const liveJobs = jobs.filter(j => (j.job_url || j.apply_url || j.url));
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

// ── Styles ──
const cardStyle = {
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
  padding: '20px 20px', marginBottom: 16,
};
const bodyStyle = {
  fontFamily: dm, fontSize: 13, color: '#6b7280', lineHeight: 1.5,
};
const linkedInBtnStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#fff',
  background: '#0A66C2', border: 'none', padding: '12px 16px',
  borderRadius: 999, textDecoration: 'none', width: '100%',
};
const findBtnStyle = {
  flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff',
  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none',
  borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
};
const notNowBtnStyle = {
  fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280',
  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999,
  padding: '12px 16px', cursor: 'pointer', minHeight: 'auto',
};
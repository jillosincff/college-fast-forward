import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parsedResumeToText, saveParsedResume } from '@/lib/resumeText';
import {
  FONT, CARD, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER,
  VIOLET, GRAD_INDIGO, SHADOW, SHADOW_MD, R,
} from '@/components/onboarding-flow/onboardingShared';
import { Briefcase, Users, Sparkles, Search, MapPin } from 'lucide-react';
import { trackMagicMomentStarted, trackMagicMomentCompleted, markMagicMomentCompleted } from '@/lib/tracking';
import ProUpgradeModal from '@/components/conversion/ProUpgradeModal';
import SoftWallModal from '@/components/conversion/SoftWallModal';
import { getChipCuratedJobs } from '../../base44/shared/curatedJobs';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';
import { checkJobLive } from '@/lib/jobFreshness';
import { gatePersonReal } from '@/lib/magicMomentGates';
import MagicMomentLoader from '@/components/magic-moment/MagicMomentLoader';
import HeroResume from '@/components/magic-moment/HeroResume';
import JobsList from '@/components/magic-moment/JobsList';
import PeopleList from '@/components/magic-moment/PeopleList';
import BestPathCard from '@/components/magic-moment/BestPathCard';

// The free Magic Moment — rebuilt as two independent lists (jobs + people)
// with an optional best-path highlight when they overlap. Neither list depends
// on the other to render. The empty screen only fires when BOTH are truly
// empty after the full cascade.

const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    linkedin: { type: 'string' },
    summary: { type: 'string' },
    education: { type: 'array', items: { type: 'object', properties: { school: { type: 'string' }, degree: { type: 'string' }, dates: { type: 'string' }, gpa: { type: 'string' }, honors: { type: 'string' } } } },
    experience: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, dates: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } } } } },
    activities: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, role: { type: 'string' }, dates: { type: 'string' } } } },
    skills: { type: 'array', items: { type: 'string' } },
  },
};

const pill = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
  border: 'none', borderRadius: 999, padding: '14px 22px', cursor: 'pointer', minHeight: 'auto',
  boxShadow: '0 6px 18px rgba(109,40,217,0.32)', display: 'inline-flex', alignItems: 'center', gap: 8,
  ...extra,
});

export default function MagicMoment() {
  const { user: initialUser } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  const [phase, setPhase] = useState('Finding jobs and people for you…');
  const [jobsList, setJobsList] = useState([]);
  const [peopleList, setPeopleList] = useState([]);
  const [bestPath, setBestPath] = useState(null);
  const [tailored, setTailored] = useState(null);
  const [showPro, setShowPro] = useState(false);
  const [showSoftWall, setShowSoftWall] = useState(false);
  const [error, setError] = useState('');
  const [heroMeta, setHeroMeta] = useState({ chipLabel: '', chipText: '' });

  // Search bar state — lets the user (or tester) override role/location directly
  const cg0 = initialUser?.career_goals || {};
  const [searchRole, setSearchRole] = useState((cg0.target_roles || [])[0] || '');
  const [searchLoc, setSearchLoc] = useState(cg0.location_preference || initialUser?.location || '');
  const [user, setUser] = useState(initialUser);

  // Re-run the Magic Moment with an explicit role/location override.
  // Used by the search bar so the user can try "HR in Miami, FL" without
  // having to edit career_goals via a separate modal.
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchRole.trim() && !searchLoc.trim()) return;
    const updatedGoals = {
      ...cg0,
      target_roles: searchRole.trim() ? [searchRole.trim()] : (cg0.target_roles || []),
      target_industries: [],
      location_preference: searchLoc.trim() || undefined,
      seeking: cg0.seeking || 'both',
      saved_at: new Date().toISOString(),
    };
    try { await base44.auth.updateMe({ career_goals: updatedGoals, location: searchLoc.trim() || undefined }); } catch (e) {}
    const freshUser = { ...initialUser, career_goals: updatedGoals, location: searchLoc.trim() };
    setUser(freshUser);
    ranRef.current = false;
    setPhase('Finding jobs and people for you…');
    setJobsList([]);
    setPeopleList([]);
    setBestPath(null);
    setTailored(null);
    setError('');
    // Force the effect to re-run with the new user object
    setRunKey(k => k + 1);
  };

  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    if (!user || ranRef.current) return;
    ranRef.current = true;
    trackMagicMomentStarted({
      target_field: ((user.career_goals?.target_industries) || []).join(', '),
      target_role: (user.career_goals?.target_roles || [])[0] || '',
      school: user.school || '',
    });
    (async () => {
      try {
        const cg = user.career_goals || {};
        const role = (cg.target_roles || [])[0] || '';
        const industries = cg.target_industries || [];
        const location = cg.location_preference || '';
        const chipText = `${role || ''} ${(industries || []).join(' ')}`.trim();
        const chipLabel = industries[0] || role || '';
        const chipKeywords = chipKeywordsFor(chipText);
        setHeroMeta({ chipLabel, chipText });

        // ── Location parsing ─────────────────────────────────────────────
        const locParts = (location || '').split(',').map(p => p.trim()).filter(Boolean);
        const userCity = locParts[0] || '';
        const userState = locParts[1] || '';
        const hasMarket = !!(userCity || userState);

        // ── Shared gates ──────────────────────────────────────────────────
        const tierOf = (j) => {
          const loc = (j.location || '').toLowerCase();
          if (!loc) return 'other';
          const isRemote = /\bremote\b|work\s*from\s*home/.test(loc);
          const cityHit = userCity && loc.includes(userCity.toLowerCase());
          const stateHit = userState && loc.includes(userState.toLowerCase());
          if (isRemote) return 'remote';
          if (cityHit) return 'same_location';
          if (stateHit) return 'nearby';
          return 'other';
        };

        const isJunk = (j) => /\b(independent|1099|own business|own biz|build your own|be your own|partner program|independent partner|work[- ]from[- ]home opportunity|unlimited earning|franchise|mlm|multi[- ]level)\b/i
          .test(`${j.job_title || ''} ${j.hiring_description || ''}`);

        const rejected = [];
        const isOnChip = (j) => {
          const { ok, why } = checkOnChip(j.job_title, chipKeywords);
          if (!ok) { rejected.push({ title: j.job_title, company: j.name, why_rejected: why }); return false; }
          return true;
        };

        const legit = (arr) => arr.filter(j => !isJunk(j));
        const onChip = (arr) => arr.filter(j => isOnChip(j));

        // ── 1. Fetch jobs (cascade: metro → state → remote → curated) ─────
        const fetchJobs = async (locOverride) => {
          const loc = locOverride !== undefined ? locOverride : location;
          const r = await base44.functions.invoke('getLiveJobMatchesFn', {
            career_goals: { role, industries, locations: [loc], seeking: cg.seeking || 'both' },
            force_refresh: true,
          });
          return r?.data?.companies || r?.companies || [];
        };

        setPhase('Finding matching jobs…');
        let onChipJobs = onChip(legit(await fetchJobs(location)));

        // Widen to state if thin
        if (onChipJobs.length < 5 && userState) {
          setPhase('Widening the search…');
          onChipJobs = [...onChipJobs, ...onChip(legit(await fetchJobs(userState)))];
        }
        // Add remote if still thin
        if (onChipJobs.length < 5) {
          setPhase('Looking beyond your market…');
          onChipJobs = [...onChipJobs, ...onChip(legit(await fetchJobs(''))).filter(j => tierOf(j) === 'remote')];
        }
        // Add curated if still thin
        if (onChipJobs.length < 3) {
          onChipJobs = [...onChipJobs, ...onChip(getChipCuratedJobs(chipText, location))];
        }

        // Dedupe + location gate + sort by tier
        const seenJobs = new Set();
        const dedupedJobs = [];
        for (const j of onChipJobs) {
          const k = (j.name + '|' + j.job_title).toLowerCase();
          if (seenJobs.has(k)) continue;
          if (hasMarket) {
            const t = tierOf(j);
            if (t === 'other') continue; // never bait-and-switch with another metro
          }
          seenJobs.add(k);
          dedupedJobs.push(j);
        }
        const tierOrder = { same_location: 0, nearby: 1, remote: 2, other: 3 };
        dedupedJobs.sort((a, b) => (tierOrder[tierOf(a)] || 3) - (tierOrder[tierOf(b)] || 3));
        const topJobs = dedupedJobs.slice(0, 8);

        // ── 2. Live-check up to 8 jobs in parallel ────────────────────────
        setPhase('Confirming live postings…');
        const liveChecked = await Promise.all(
          topJobs.map(async (job) => {
            const chk = await checkJobLive(base44, job);
            return { ...job, live: chk.ok, _tier: tierOf(job) };
          })
        );
        setJobsList(liveChecked);

        // ── 3. Find people from the school on similar paths ───────────────
        setPhase('Finding people from your school…');
        const jobCompanies = [...new Set(topJobs.map(j => j.name).filter(Boolean))];
        const curatedCompanies = [...new Set(getChipCuratedJobs(chipText, location).map(j => j.name).filter(Boolean))];
        const scanCompanies = [...jobCompanies, ...curatedCompanies]
          .filter((c, i, arr) => c.length > 1 && arr.indexOf(c) === i)
          .slice(0, 8);

        let peopleGated = false;
        const allPeople = [];
        for (let i = 0; i < scanCompanies.length; i += 4) {
          const batch = scanCompanies.slice(i, i + 4);
          const results = await Promise.all(batch.map(company =>
            base44.functions.invoke('findCliffPeople', {
              companyName: company, targetRole: role, magic_moment: true,
              schoolName: user.school, schoolCode: user.school_code,
              chipText, location,
            }).then(r => ({ company, res: r }))
              .catch(() => ({ company, res: { connections: [] } }))
          ));
          if (results.some(r => r.res?.data?.upgrade_required || r.res?.upgrade_required)) {
            peopleGated = true; break;
          }
          for (const r of results) {
            const conns = r.res?.data?.connections || r.res?.connections || [];
            for (const c of conns) allPeople.push(c);
          }
        }

        if (peopleGated) { setShowSoftWall(true); setPhase(null); return; }

        // Dedupe by name + filter to real → take 3
        const peopleSeen = new Set();
        const realPeople = [];
        for (const p of allPeople) {
          const key = (p.name || '').toLowerCase();
          if (!key || peopleSeen.has(key)) continue;
          const g = gatePersonReal(p);
          if (!g.ok) continue;
          peopleSeen.add(key);
          realPeople.push(p);
          if (realPeople.length >= 3) break;
        }
        setPeopleList(realPeople);

        // ── 4. Detect best path (person company ∩ live job company) ───────
        let best = null;
        for (const person of realPeople) {
          const pCompany = (person.company || '').toLowerCase();
          if (!pCompany) continue;
          for (const job of liveChecked) {
            if (!job.live) continue;
            const jCompany = (job.name || '').toLowerCase();
            if (pCompany === jCompany || pCompany.includes(jCompany) || jCompany.includes(pCompany)) {
              best = { job, person };
              break;
            }
          }
          if (best) break;
        }
        setBestPath(best);

        // ── 5. Resume tailoring (best-path job or first live job) ──────────
        const tailorFor = best?.job || liveChecked.find(j => j.live) || null;
        let tailoredResult = null;
        if (tailorFor) {
          try {
            const resumeUrl = user.resume_url || user.resume_file_url;
            let resumeText = '';
            if (resumeUrl) {
              let resumes = [];
              try { resumes = await base44.entities.Resume.filter({ student_email: user.email }, '-created_date', 5); } catch (e) {}
              resumeText = resumes?.[0]?.parsed_text || '';
              if (!resumeText) {
                const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url: resumeUrl, json_schema: RESUME_SCHEMA });
                const parsed = extracted?.output || extracted;
                resumeText = parsedResumeToText(parsed);
                if (resumeText.length > 100) await saveParsedResume(base44, user.email, parsed, resumeUrl, '').catch(() => {});
              }
            }
            if (resumeText.length > 100) {
              setPhase('Tailoring your resume…');
              try {
                const tailRes = await base44.functions.invoke('tailorResume', {
                  resumeText, jobTitle: tailorFor.job_title, companyName: tailorFor.name,
                  jobDescription: tailorFor.hiring_description || '',
                });
                tailoredResult = tailRes?.data || tailRes;
              } catch (e) {}
              if (tailoredResult) setTailored(tailoredResult);
            }
          } catch (e) {}
        }

        // ── 6. Track completion ───────────────────────────────────────────
        base44.functions.invoke('completeMagicMoment', {}).catch(() => {});
        const peopleSource = realPeople[0]?.source || 'none';
        const resultType = best
          ? 'best_path'
          : (liveChecked.length > 0 && realPeople.length > 0
              ? 'jobs_and_people'
              : (liveChecked.length > 0 ? 'jobs_only' : 'people_only'));
        trackMagicMomentCompleted({
          jobs_count: liveChecked.length,
          people_count: realPeople.length,
          best_path: !!best,
          people_source: peopleSource,
          result_type: resultType,
          hero_job_title: tailorFor?.job_title || '',
          hero_company: tailorFor?.name || '',
          has_tailored_resume: !!tailoredResult,
        });
        markMagicMomentCompleted();
        setPhase(null);

        console.log('[MagicMoment] RESULT', JSON.stringify({
          chip: chipText, location, jobs_count: liveChecked.length,
          live_jobs: liveChecked.filter(j => j.live).length,
          people_count: realPeople.length, best_path: !!best,
          people_source: peopleSource, result_type: resultType,
          reject_samples: rejected.slice(0, 10),
        }, null, 2));
      } catch (e) {
        setError('CLIFF hit a snag building your plan. Please try again in a moment.');
        setPhase(null);
      }
    })();
  }, [user, runKey]);

  const downloadResume = () => {
    if (!tailored?.tailoredResume?.tailored_content && !tailored?.tailored_content) return;
    const content = tailored.tailoredResume?.tailored_content || tailored.tailored_content;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `CLIFF-tailored-resume.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (phase) return <MagicMomentLoader phase={phase} />;

  // Search bar — always visible so the user (or tester) can try any role + location
  const SearchBar = (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 180px', position: 'relative' }}>
        <Search size={14} color={INDIGO_DIM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={searchRole}
          onChange={e => setSearchRole(e.target.value)}
          placeholder="Role (e.g. HR, Marketing, Finance)"
          style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT, background: CARD,
            border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '11px 14px 11px 36px', outline: 'none' }}
        />
      </div>
      <div style={{ flex: '1 1 160px', position: 'relative' }}>
        <MapPin size={14} color={INDIGO_DIM} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          value={searchLoc}
          onChange={e => setSearchLoc(e.target.value)}
          placeholder="Location (e.g. Miami, FL)"
          style={{ width: '100%', fontFamily: FONT, fontSize: 13, color: TEXT, background: CARD,
            border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '11px 14px 11px 36px', outline: 'none' }}
        />
      </div>
      <button type="submit" style={pill({ padding: '11px 20px' })}>Search</button>
    </form>
  );

  // Empty ONLY when both lists are truly empty
  const bothEmpty = jobsList.length === 0 && peopleList.length === 0;

  if (error && bothEmpty) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 40%)', paddingBottom: 48 }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px' }}>Let's try that again.</h1>
            <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>{error}</p>
          </div>
          {SearchBar}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/FreeTierDashboard')} style={pill({})}>Go to dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  const liveJobCompanies = jobsList.filter(j => j.live).map(j => (j.name || '').toLowerCase());

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fff 30%)', paddingBottom: 48 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div data-testid="mm-free-cycle-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '6px 14px', marginBottom: 14 }}>
            <Sparkles size={13} color={INDIGO} />
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your free cycle</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 800, color: TEXT, margin: '0 0 8px', lineHeight: 1.2 }}>
            {bestPath ? 'CLIFF found your best path.' : 'Here are your matches.'}
          </h1>
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT2, margin: 0 }}>
            {heroMeta.chipLabel ? `${heroMeta.chipLabel} roles` : 'Matching roles'} and people from your school on the same path.
          </p>
        </div>

        {/* Search bar */}
        {SearchBar}

        {/* Empty-state prompt — when both lists are empty, show guidance instead of just the resume card */}
        {bothEmpty && !error && (
          <div style={{ background: '#f5f3ff', border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: R, padding: '20px 18px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
              No matches found for this search.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5 }}>
              Try a different role or location above — e.g. "HR" in "Miami, FL" or "Marketing" in "New York, NY".
            </p>
            <button onClick={() => navigate('/FreeTierDashboard')} style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
              ← Back to dashboard
            </button>
          </div>
        )}

        {/* Best path card (optional) */}
        {bestPath && (
          <BestPathCard job={bestPath.job} person={bestPath.person} user={user} />
        )}

        {/* A. Jobs for you */}
        {jobsList.length > 0 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Briefcase size={14} color={INDIGO_DIM} />} label="Jobs for you" />
            <JobsList jobs={jobsList} />
          </div>
        )}

        {/* B. People from your school in this lane */}
        {peopleList.length > 0 && (
          <div style={{ background: CARD, borderRadius: R, boxShadow: SHADOW_MD, padding: '20px 18px', marginBottom: 16, border: `1.5px solid ${INDIGO_BORDER}` }}>
            <SectionLabel icon={<Users size={14} color={INDIGO_DIM} />} label="People from your school in this lane" />
            <PeopleList people={peopleList} user={user} liveJobCompanies={liveJobCompanies} />
          </div>
        )}

        {/* Resume card — only show when there are jobs or people to contextually attach it to */}
        {!bothEmpty && <HeroResume tailored={tailored} onDownload={downloadResume} />}
      </div>
      {showPro && <ProUpgradeModal user={user} onClose={() => setShowPro(false)} source="magic_moment" />}
      {showSoftWall && <SoftWallModal user={user} onClose={() => setShowSoftWall(false)} source="soft_wall" />}
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
      {icon}
      <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
  );
}
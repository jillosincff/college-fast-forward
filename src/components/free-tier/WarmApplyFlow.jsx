import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { findParentsAtCompany } from '@/functions/findParentsAtCompany';
import { scoutCompanyBackdoor } from '@/functions/scoutCompanyBackdoor';
import { addPipelineEntry } from '@/functions/addPipelineEntry';
import { Users, Copy, Check, Loader2, FileText, ClipboardList } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const isUrl = (s) => /^https?:\/\//i.test((s || '').trim());

// Guided flow: confirm job → find warm connection → draft outreach → track → tailor.
// Pass `job` ({ company, role, jobUrl }) to skip the confirm step (feed cards).
export default function WarmApplyFlow({ rawInput, job, user, onClose }) {
  const fromJob = !!job?.company;
  const [step, setStep] = useState(fromJob ? 'network' : 'confirm'); // confirm | network | message | done
  const [company, setCompany] = useState(fromJob ? job.company : (isUrl(rawInput) ? '' : (rawInput || '')));
  const [role, setRole] = useState(fromJob ? (job.role || '') : '');
  const [jobUrl] = useState(fromJob ? (job.jobUrl || '') : (isUrl(rawInput) ? rawInput : ''));
  const [parsing, setParsing] = useState(!fromJob && isUrl(rawInput));

  const [contacts, setContacts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState('verified'); // 'verified' | 'ai'
  const [contact, setContact] = useState(null); // chosen contact or null (cold)

  const [message, setMessage] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tracking, setTracking] = useState(false);
  const [trackError, setTrackError] = useState('');

  const school = (user?.school_code || 'your school').toUpperCase();
  const firstName = user?.full_name?.split(' ')[0] || '';

  // If a URL was pasted, extract company + role from the live posting
  useEffect(() => {
    if (fromJob || !isUrl(rawInput)) return;
    let cancelled = false;
    base44.integrations.Core.InvokeLLM({
      prompt: `This is a link to a job posting: ${rawInput}\nLook up the posting and extract the employer company name and the job title. If you cannot determine a field, return an empty string for it.`,
      add_context_from_internet: true,
      response_json_schema: { type: 'object', properties: { company: { type: 'string' }, role: { type: 'string' } } },
    }).then(res => {
      if (cancelled) return;
      if (res?.company) setCompany(res.company);
      if (res?.role) setRole(res.role);
    }).catch(() => {}).finally(() => { if (!cancelled) setParsing(false); });
    return () => { cancelled = true; };
  }, [rawInput]);

  const searchNetwork = async () => {
    setStep('network');
    setSearching(true);
    setSearchPhase('verified');
    let found = [];
    // 1) Verified CFF network first (parents + alumni who joined)
    try {
      const res = await findParentsAtCompany({ companyName: company.trim() });
      const data = res?.data || res;
      found = data?.parents || [];
    } catch {}
    // 2) Fallback: the AI alumni scout (same engine the feed cards use)
    if (found.length === 0) {
      setSearchPhase('ai');
      try {
        const res = await scoutCompanyBackdoor({ jobId: company.trim(), companyName: company.trim() });
        const data = res?.data || res;
        found = (data?.alumni || []).slice(0, 5).map(a => ({
          name: a.name,
          role_title: a.role_title || null,
          company: a.company || company.trim(),
          linkedin_url: a.linkedin_url || null,
          persona: 'alumni',
          ai_found: true,
        }));
      } catch {}
    }
    setContacts(found);
    setSearching(false);
  };

  // Feed cards pass the job in — skip confirm and search the network immediately
  useEffect(() => {
    if (fromJob) searchNetwork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draftMessage = async (chosen) => {
    setContact(chosen || null);
    setStep('message');
    setDrafting(true);
    try {
      const prompt = chosen
        ? `Write a short, warm LinkedIn/email outreach message (under 120 words) from ${firstName || 'a student'}, a ${school} student, to ${chosen.name}${chosen.role_title ? `, ${chosen.role_title}` : ''} at ${company}. ${chosen.persona === 'alumni' ? `They are a ${school} alum.` : `They are a parent of a fellow ${school} student who opted in to help students.`} The student is interested in ${role ? `the ${role} role` : 'opportunities'} at ${company} and would love brief advice or an intro. Tone: genuine, respectful of their time, zero corporate jargon, no flattery overload. Do not include a subject line or placeholders — write it ready to send, signed with the student's first name.`
        : `Write a short, confident cold outreach message (under 120 words) from ${firstName || 'a student'}, a ${school} student, to a recruiter or team member at ${company} about ${role ? `the ${role} role` : 'entry-level opportunities'}. Tone: genuine, specific, respectful of their time. Ready to send, signed with the student's first name, no placeholders.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessage(typeof res === 'string' ? res.trim() : '');
    } catch {
      setMessage('');
    } finally {
      setDrafting(false);
    }
  };

  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const trackIt = async () => {
    setTracking(true);
    setTrackError('');
    try {
      const res = await addPipelineEntry({
        company: company.trim(),
        job_title: role.trim() || null,
        job_url: jobUrl || null,
        application_path: contact ? 'alumni_outreach' : 'cold_apply',
        status: contact ? 'reached_out' : 'identified',
        status_date: new Date().toISOString(),
        reached_out_date: contact ? new Date().toISOString() : null,
        alumni_name: contact?.name || null,
        alumni_role: contact?.role_title || null,
        alumni_linkedin: contact?.linkedin_url || null,
        alumni_source: contact ? (contact.ai_found ? 'fastiq' : 'top_match') : 'manual',
        notes: message ? `Outreach draft:\n${message}` : null,
      });
      const result = res?.data || res;
      if (result?.error) throw new Error(result.message || 'Could not save to your tracker.');
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
      setStep('done');
    } catch (err) {
      setTrackError(err?.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setTracking(false);
    }
  };

  const goToTailoring = () => {
    const params = new URLSearchParams({ company: company.trim(), role: role.trim(), job_url: jobUrl, from: 'warm_apply' });
    onClose();
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(3px)', zIndex: 60000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', fontFamily: dm }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 900, color: '#111827', margin: 0 }}>
              {step === 'confirm' && '🎯 Let\u2019s find your way in'}
              {step === 'network' && `🔍 Your ${school} network`}
              {step === 'message' && '✍️ Your outreach, written'}
              {step === 'done' && '🎉 You\u2019re in motion'}
            </p>
            {(company || role) && step !== 'confirm' && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>{[role, company].filter(Boolean).join(' · ')}</p>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#9ca3af', cursor: 'pointer', padding: 4, lineHeight: 1, minHeight: 'auto', minWidth: 'auto' }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>

          {/* ── Step 1: Confirm job ── */}
          {step === 'confirm' && (
            parsing ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <Loader2 size={26} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '12px 0 2px' }}>Reading the job posting…</p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Pulling the company and role for you.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Company *</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Nike"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontFamily: dm, fontSize: 14, color: '#111827', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Role <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Marketing Coordinator"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '11px 14px', fontFamily: dm, fontSize: 14, color: '#111827', outline: 'none' }} />
                </div>
                <button onClick={searchNetwork} disabled={!company.trim()}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: company.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e5e7eb', color: company.trim() ? '#fff' : '#9ca3af', fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: company.trim() ? 'pointer' : 'default', minHeight: 48 }}>
                  Search my {school} network →
                </button>
              </div>
            )
          )}

          {/* ── Step 2: Warm connections ── */}
          {step === 'network' && (
            searching ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <Loader2 size={26} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '12px 0 2px' }}>
                  {searchPhase === 'ai'
                    ? `CLIFF is scanning the web for ${school} alumni at ${company}…`
                    : `Searching ${school} parents & alumni at ${company}…`}
                </p>
                {searchPhase === 'ai' && (
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>No verified match yet — going deeper. This can take a moment.</p>
                )}
              </div>
            ) : contacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #ddd6fe', borderRadius: 14, padding: '12px 14px' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#5b21b6', margin: 0 }}>
                    🔥 {contacts.length} warm connection{contacts.length > 1 ? 's' : ''} at {company}
                  </p>
                  <p style={{ fontSize: 12, color: '#7c3aed', margin: '3px 0 0' }}>
                    {contacts[0]?.ai_found
                      ? 'CLIFF found these alumni on the web — verify on LinkedIn before reaching out.'
                      : 'Pick one and CLIFF writes your intro instantly.'}
                  </p>
                </div>
                {contacts.map((c, i) => (
                  <button key={i} onClick={() => draftMessage(c)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', fontFamily: dm, transition: 'border-color 0.15s', minHeight: 'auto' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#a78bfa'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#6d28d9', flexShrink: 0 }}>
                      {c.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.role_title || 'Works here'} · {c.persona === 'alumni' ? `${school} Alum` : `${school} Parent`}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', whiteSpace: 'nowrap' }}>Draft intro →</span>
                  </button>
                ))}
                <button onClick={() => draftMessage(null)}
                  style={{ background: 'none', border: 'none', fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', padding: 6, minHeight: 'auto' }}>
                  Skip — draft a cold outreach instead
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '16px', textAlign: 'center' }}>
                  <Users size={22} color="#2563eb" style={{ marginBottom: 6 }} />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', margin: '0 0 4px' }}>No verified {school} connection at {company} yet</p>
                  <p style={{ fontSize: 12, color: '#3b82f6', margin: 0, lineHeight: 1.5 }}>No problem — CLIFF will draft a strong cold outreach so you still stand out.</p>
                </div>
                <button onClick={() => draftMessage(null)}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}>
                  Draft my cold outreach →
                </button>
              </div>
            )
          )}

          {/* ── Step 3: Message ── */}
          {step === 'message' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {contact && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '10px 12px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#6d28d9', flexShrink: 0 }}>
                    {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#5b21b6', margin: 0 }}>To: {contact.name}</p>
                    <p style={{ fontSize: 11, color: '#7c3aed', margin: 0 }}>{contact.role_title || ''} {contact.role_title ? '· ' : ''}{contact.persona === 'alumni' ? 'Alum' : 'Parent'}</p>
                  </div>
                  {contact.linkedin_url && (
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: '#0a66c2', borderRadius: 8, padding: '6px 10px', textDecoration: 'none', minHeight: 'auto', minWidth: 'auto' }}>
                      Open LinkedIn
                    </a>
                  )}
                </div>
              )}

              {drafting ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Loader2 size={24} color="#7c3aed" style={{ animation: 'spin 1s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: '10px 0 0' }}>CLIFF is writing your message…</p>
                </div>
              ) : (
                <>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={7}
                    style={{ width: '100%', boxSizing: 'border-box', background: '#f8f9ff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', fontFamily: dm, fontSize: 13, color: '#111827', lineHeight: 1.6, outline: 'none', resize: 'vertical' }} />
                  <button onClick={copyMessage}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '11px', borderRadius: 10, border: `1.5px solid ${copied ? '#86efac' : '#ddd6fe'}`, background: copied ? '#f0fdf4' : '#faf5ff', color: copied ? '#16a34a' : '#6d28d9', fontFamily: dm, fontSize: 13, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>
                    {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied!' : 'Copy message'}
                  </button>
                </>
              )}

              {trackError && (
                <p style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', margin: 0 }}>{trackError}</p>
              )}

              <button onClick={trackIt} disabled={tracking || drafting}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: tracking || drafting ? 'default' : 'pointer', opacity: tracking ? 0.7 : 1, minHeight: 48 }}>
                {tracking ? 'Saving…' : '✓ I sent it — add to my tracker'}
              </button>
            </div>
          )}

          {/* ── Step 4: Done ── */}
          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>{company} is in your pipeline</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>
                {contact ? `Your outreach to ${contact.name.split(' ')[0]} is logged. ` : ''}One last power move: tailor your resume for this role before you apply.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={goToTailoring}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontFamily: dm, fontSize: 14, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}>
                  <FileText size={16} /> Tailor my resume for this role
                </button>
                <button onClick={() => { onClose(); window.location.hash = '#/ApplicationTracker'; }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontFamily: dm, fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
                  <ClipboardList size={15} /> View in Application Tracker
                </button>
                <button onClick={onClose}
                  style={{ background: 'none', border: 'none', fontFamily: dm, fontSize: 12, fontWeight: 600, color: '#9ca3af', cursor: 'pointer', padding: 6, minHeight: 'auto' }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
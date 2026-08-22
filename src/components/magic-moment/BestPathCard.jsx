import React, { useState } from 'react';
import { Zap, Copy, Check, Sparkles, MapPin, GraduationCap, ExternalLink, Building2 } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER, GRAD_INDIGO, R } from '@/components/onboarding-flow/onboardingShared';
import { base44 } from '@/api/base44Client';
import { buildOutreachDraft } from '@/lib/outreachDraft';
import { trackOutreachCopied } from '@/lib/tracking';
import { applyUrlOf } from '@/lib/jobFreshness';

export default function BestPathCard({ job, person, user }) {
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  // Best Path draft uses the OPEN ROLE's title + company — never the alum's title.
  // The student is reaching out about the job, not about the insider's position.
  const draft = buildOutreachDraft({
    school: user?.school || '',
    jobTitle: job.job_title || '',
    company: job.name || '',
    insiderName: person.name,
    studentName: user?.full_name || '',
    applied,
    live: true,
  });

  const applyUrl = applyUrlOf(job);
  const sourceLabel = person.source === 'opt_in' ? 'In your network' : 'Found publicly';

  const handleApply = () => {
    if (applyUrl) { try { window.open(applyUrl, '_blank', 'noopener'); } catch (e) {} }
    setApplied(true);
  };

  const handleCopyAndLinkedIn = async () => {
    const text = draft?.message || '';
    if (!text) return;
    let copiedOk = false;
    try {
      await navigator.clipboard.writeText(text);
      copiedOk = true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        copiedOk = true;
      } catch (e2) {}
    }
    trackOutreachCopied({ company: job.name || '', alumni: person.name || '', cold: false });
    let url;
    if (person.linkedin_url) {
      url = person.linkedin_url;
    } else if (person.source_url) {
      url = person.source_url;
    } else {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((person.name || '') + ' ' + (job.name || ''))}`;
    }
    try { window.open(url, '_blank', 'noopener'); } catch (e) {}
    if (copiedOk) { setCopied(true); setTimeout(() => setCopied(false), 2600); }
    try {
      const now = new Date();
      await base44.entities.NetworkingPipeline.create({
        user_email: user.email,
        company: job.name || '',
        job_title: job.job_title || '',
        job_url: applyUrl,
        job_description: job.hiring_description || '',
        location: job.location || '',
        alumni_name: person.name || '',
        alumni_role: person.role_title || '',
        alumni_linkedin: person.linkedin_url || '',
        alumni_source: person.source || 'manual',
        application_path: 'alumni_outreach',
        status: 'reached_out',
        reached_out_date: now.toISOString(),
        status_date: now.toISOString(),
        identified_date: now.toISOString(),
      });
    } catch (e) {}
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
      border: `2px solid ${INDIGO}`, borderRadius: R, padding: '20px 18px',
      marginBottom: 16, boxShadow: '0 4px 14px rgba(109,40,217,0.15)',
    }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Sparkles size={14} color={INDIGO} />
        <span style={{
          fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Best path
        </span>
      </div>

      {/* Job block */}
      <h2 style={{ fontFamily: FONT, fontSize: 17, fontWeight: 800, color: TEXT, margin: '0 0 4px', lineHeight: 1.3 }}>
        {job.job_title} at {job.name}
      </h2>
      {job.location && (
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} /> {job.location}
        </p>
      )}

      {/* Apply button — only when the posting is live */}
      {job.live && applyUrl && (
        <button onClick={handleApply} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
          border: 'none', borderRadius: 999, padding: '12px 18px', cursor: 'pointer',
          minHeight: 'auto', width: '100%', marginBottom: 14,
        }}>
          <Zap size={14} /> {applied ? 'Applied — reach out below' : 'Apply for this role'}
        </button>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: INDIGO_BORDER, margin: '0 0 14px', opacity: 0.6 }} />

      {/* Person block — fully visible inside the card */}
      <div style={{
        background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 10,
        padding: '14px 16px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Building2 size={13} color={INDIGO} />
          <span style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 800, color: INDIGO_DIM,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Insider at {job.name}
          </span>
        </div>
        <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: TEXT, margin: '0 0 2px', lineHeight: 1.3 }}>
          {person.name}
        </h3>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, margin: '0 0 4px', lineHeight: 1.3 }}>
          {person.role_title || '—'}
        </p>
        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: 0, lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <GraduationCap size={11} /> {person.school || user?.school || 'Your school'} · {sourceLabel}
        </p>
      </div>

      {/* Outreach draft — addressed to the person, referencing the open role */}
      <div style={{
        background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 8,
        padding: '12px 14px', marginBottom: 12, fontFamily: FONT, fontSize: 12,
        color: TEXT2, lineHeight: 1.5, whiteSpace: 'pre-wrap',
      }}>
        {draft?.message}
      </div>

      {/* CTA: Copy message & open LinkedIn */}
      <button onClick={handleCopyAndLinkedIn} style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: FONT, fontSize: 13, fontWeight: 800, color: '#fff', background: GRAD_INDIGO,
        border: 'none', borderRadius: 999, padding: '12px 18px',
        cursor: 'pointer', minHeight: 'auto', width: '100%',
      }}>
        {copied
          ? <><Check size={14} /> Copied — opening LinkedIn</>
          : <><Copy size={14} /> Copy message & open LinkedIn <ExternalLink size={12} /></>}
      </button>
    </div>
  );
}
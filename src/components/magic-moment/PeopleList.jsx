import React, { useState } from 'react';
import { Copy, Check, GraduationCap, ExternalLink } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';
import { base44 } from '@/api/base44Client';
import { buildOutreachDraft } from '@/lib/outreachDraft';
import { trackOutreachCopied } from '@/lib/tracking';

export default function PeopleList({ people, user, liveJobCompanies }) {
  if (!people?.length) return null;
  const liveCompanies = Array.isArray(liveJobCompanies) ? liveJobCompanies : [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {people.map((person, i) => {
        const pCompany = (person.company || '').toLowerCase();
        const hasLiveJob = liveCompanies.some(c => c === pCompany || c.includes(pCompany) || pCompany.includes(c));
        return (
          <PersonRow key={i} person={person} user={user} hasLiveJob={hasLiveJob} />
        );
      })}
    </div>
  );
}

function PersonRow({ person, user, hasLiveJob }) {
  const [copied, setCopied] = useState(false);
  const draft = buildOutreachDraft({
    school: user?.school || '',
    jobTitle: person.role_title || '',
    company: person.company || '',
    insiderName: person.name,
    studentName: user?.full_name || '',
    applied: false,
    live: hasLiveJob,
  });

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
    trackOutreachCopied({ company: person.company || '', alumni: person.name || '', cold: !!draft?.cold });
    let url;
    if (person.linkedin_url) {
      url = person.linkedin_url;
    } else if (person.source_url) {
      url = person.source_url;
    } else {
      url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent((person.name || '') + ' ' + (person.company || ''))}`;
    }
    try { window.open(url, '_blank', 'noopener'); } catch (e) {}
    if (copiedOk) { setCopied(true); setTimeout(() => setCopied(false), 2600); }
    try {
      const now = new Date();
      await base44.entities.NetworkingPipeline.create({
        user_email: user.email,
        company: person.company || '',
        job_title: person.role_title || '',
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

  const sourceLabel = person.source === 'opt_in' ? 'In your network' : 'Found publicly';

  return (
    <div style={{
      padding: '14px 16px', background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12,
    }}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontFamily: FONT, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3 }}>
          {person.name}
        </h3>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, margin: 0, lineHeight: 1.3 }}>
          {person.role_title || '—'} · {person.company}
        </p>
        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 4 }}>
          <GraduationCap size={11} /> {person.school || user?.school || 'Your school'} · {sourceLabel}
        </p>
      </div>
      <div style={{
        background: '#faf5ff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 8,
        padding: '10px 12px', marginBottom: 8, fontFamily: FONT, fontSize: 12,
        color: TEXT2, lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 72, overflow: 'hidden',
      }}>
        {draft?.message}
      </div>
      <button onClick={handleCopyAndLinkedIn} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONT,
        fontSize: 12, fontWeight: 800, color: '#fff', background: INDIGO,
        border: 'none', borderRadius: 999, padding: '10px 16px', cursor: 'pointer',
        minHeight: 'auto', width: '100%', justifyContent: 'center',
      }}>
        {copied
          ? <><Check size={14} /> Copied — opening LinkedIn</>
          : <><Copy size={14} /> Copy message & open LinkedIn <ExternalLink size={12} /></>}
      </button>
    </div>
  );
}
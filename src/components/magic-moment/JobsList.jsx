import React, { useState } from 'react';
import { Zap, ExternalLink, MapPin, Check } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';
import { applyUrlOf } from '@/lib/jobFreshness';

const TIER_LABELS = {
  same_location: 'Metro',
  nearby: 'State-wide',
  remote: 'Remote',
  other: '',
};

export default function JobsList({ jobs, excludeJobKey, onApply }) {
  if (!jobs?.length) return null;
  const exclude = (excludeJobKey || '').toLowerCase().trim();
  // Safety net: only render jobs with a verified live apply link.
  // Non-hiring companies never appear in the Jobs list.
  const filtered = jobs
    .filter(j => j.live === true && (j.job_url || j.apply_url || j.url))
    .filter(j => !exclude || `${(j.name || '')}|${(j.job_title || '')}`.toLowerCase().trim() !== exclude);
  if (!filtered.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {filtered.map((job, i) => (
        <JobRow key={job.job_id || job.id || i} job={job} onApply={onApply} />
      ))}
    </div>
  );
}

function JobRow({ job, onApply }) {
  const tierLabel = TIER_LABELS[job._tier] || '';
  const applyUrl = job.live ? applyUrlOf(job) : '';
  const [didIt, setDidIt] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '14px 16px', background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          {job.live && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3, background: '#dcfce7', color: '#15803d',
              fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 999,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              <Zap size={8} /> Hiring
            </span>
          )}
          <h3 style={{
            fontFamily: FONT, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {job.job_title}
          </h3>
        </div>
        <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, margin: 0, lineHeight: 1.3 }}>
          {job.name}
        </p>
        <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <MapPin size={10} /> {job.location}{tierLabel ? ` · ${tierLabel}` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        {job.live && applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onApply?.(job)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT,
              fontSize: 12, fontWeight: 800, color: '#fff', background: INDIGO,
              padding: '10px 16px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap', minHeight: 'auto',
            }}
          >
            Apply <ExternalLink size={12} />
          </a>
        )}
        <button
          onClick={() => { onApply?.(job); setDidIt(true); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: FONT,
            fontSize: 12, fontWeight: 700, color: didIt ? '#15803d' : INDIGO,
            background: didIt ? '#dcfce7' : 'transparent',
            border: `1px solid ${didIt ? '#86efac' : INDIGO_BORDER}`,
            padding: '10px 12px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'auto',
          }}
        >
          {didIt ? <Check size={12} /> : null} Did it
        </button>
      </div>
    </div>
  );
}
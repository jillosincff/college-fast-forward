import React, { useState } from 'react';
import { Zap, ExternalLink, MapPin, Check, FileText, ArrowRight } from 'lucide-react';
import { FONT, TEXT, TEXT2, TEXT3, INDIGO, INDIGO_DIM, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';
import { applyUrlOf, postedLabel } from '@/lib/jobFreshness';
import { navigate } from '@/components/utils/navigation';

const TIER_LABELS = {
  same_location: 'Metro',
  nearby: 'State-wide',
  remote: 'Remote',
  other: '',
};

// Pro job row — scan-and-apply.
// Primary:  Apply → live external URL (also logs the application)
// Secondary: "Prepare in CLIFF" text link → Job Workspace for THIS job (Pro only)
// No Tailor, no standalone "Did it". After Apply is clicked the row flips to
// a quiet "✓ Applied" state; the explicit "Mark as applied" lives in the workspace.
export default function JobsList({ jobs, excludeJobKey, onApply, onPrepare, onTailor, variant }) {
  if (!jobs?.length) return null;
  const exclude = (excludeJobKey || '').toLowerCase().trim();
  // Safety net: only render jobs with a verified live apply link.
  const filtered = jobs
    .filter(j => j.live === true && (j.job_url || j.apply_url || j.url))
    .filter(j => !exclude || `${(j.name || '')}|${(j.job_title || '')}`.toLowerCase().trim() !== exclude);
  if (!filtered.length) return null;
  const Row = variant === 'pro_loop' ? ProLoopJobRow : JobRow;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {filtered.map((job, i) => (
        <Row key={job.job_id || job.id || i} job={job} onApply={onApply} onPrepare={onPrepare} onTailor={onTailor} />
      ))}
    </div>
  );
}

function JobRow({ job, onApply, onPrepare }) {
  const tierLabel = TIER_LABELS[job._tier] || '';
  const applyUrl = job.live ? applyUrlOf(job) : '';
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    onApply?.(job);
    setApplied(true);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '14px 16px', background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
          {job.live && !job.curated && (
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
        {postedLabel(job) && (
          <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>{postedLabel(job)}</p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        {applied ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT,
            fontSize: 12, fontWeight: 800, color: '#15803d', background: '#dcfce7',
            border: '1px solid #86efac', padding: '10px 16px', borderRadius: 999, whiteSpace: 'nowrap', minHeight: 'auto',
          }}>
            <Check size={12} /> Applied
          </span>
        ) : applyUrl ? (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleApply}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: FONT,
              fontSize: 12, fontWeight: 800, color: '#fff', background: INDIGO,
              padding: '10px 16px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap', minHeight: 'auto',
            }}
          >
            Apply <ExternalLink size={12} />
          </a>
        ) : null}
        {onPrepare && (
          <button
            onClick={() => onPrepare(job)}
            style={{
              fontFamily: FONT, fontSize: 11, fontWeight: 700, color: INDIGO,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 4px', minHeight: 'auto', minWidth: 'auto', textDecoration: 'underline',
            }}
          >
            Prepare in CLIFF →
          </button>
        )}
      </div>
    </div>
  );
}

// Pro-loop row — the whole row is the tap target → opens the CLIFF job page
// (workspace with JD above the fold + the progressive loop). No stacked
// Read/Interested/Tailor/Apply buttons on the list; the loop lives on the job page.
function ProLoopJobRow({ job, onPrepare }) {
  const tierLabel = TIER_LABELS[job._tier] || '';
  return (
    <div
      onClick={() => onPrepare?.(job)}
      style={{
        padding: '14px 16px', background: '#fff', border: `1px solid ${INDIGO_BORDER}`, borderRadius: 12,
        cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.boxShadow = '0 4px 12px rgba(109,40,217,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = INDIGO_BORDER; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
        {job.live && !job.curated && (
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
      <p style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: TEXT2, margin: '0 0 2px', lineHeight: 1.3 }}>
        {job.name}
      </p>
      <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT3, margin: 0, lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: 3 }}>
        <MapPin size={10} /> {job.location}{tierLabel ? ` · ${tierLabel}` : ''}
      </p>
      {postedLabel(job) && (
        <p style={{ fontFamily: FONT, fontSize: 11, color: TEXT3, margin: '2px 0 0' }}>{postedLabel(job)}</p>
      )}
      <p style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: INDIGO, margin: '10px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Open in CLIFF <ArrowRight size={12} />
      </p>
    </div>
  );
}
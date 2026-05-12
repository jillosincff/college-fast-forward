import React, { useState } from 'react';
import { ExternalLink, Edit2, X } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function JobPostingLinkSection({ application, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [linkInput, setLinkInput] = useState(application?.jobPostingUrl || '');

  const handleSaveLink = () => {
    if (linkInput.trim()) {
      onUpdate({ ...application, jobPostingUrl: linkInput });
      setIsEditing(false);
    }
  };

  const handleRemoveLink = () => {
    onUpdate({ ...application, jobPostingUrl: '' });
    setLinkInput('');
  };

  const handleCancel = () => {
    setLinkInput(application?.jobPostingUrl || '');
    setIsEditing(false);
  };

  const truncateUrl = (url) => {
    if (!url) return '';
    return url.length > 50 ? url.substring(0, 47) + '...' : url;
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>
        Link to Job Posting
      </p>

      {!isEditing && application?.jobPostingUrl ? (
        /* Display Existing Link */
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: '#F9F9F9',
          borderRadius: 8, border: '1px solid #E0E0E0',
        }}>
          <a
            href={application.jobPostingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, color: '#0021A5', fontSize: 13, textDecoration: 'none', fontFamily: dm,
              cursor: 'pointer', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            title={application.jobPostingUrl}
          >
            {truncateUrl(application.jobPostingUrl)}
          </a>
          <a
            href={application.jobPostingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ minHeight: 'auto', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            title="Open in new tab"
          >
            <ExternalLink size={14} color="#0021A5" />
          </a>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', minHeight: 'auto',
            }}
            title="Edit link"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleRemoveLink}
            style={{
              background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4,
              display: 'flex', alignItems: 'center', minHeight: 'auto',
            }}
            title="Remove link"
          >
            <X size={14} />
          </button>
        </div>
      ) : isEditing ? (
        /* Edit Mode */
        <div style={{ display: 'grid', gap: 8 }}>
          <input
            type="text"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            placeholder="Paste job posting URL (e.g., https://linkedin.com/jobs/...)"
            style={{
              fontSize: 13, border: '1px solid #E0E0E0', borderRadius: 8, padding: '10px 12px',
              outline: 'none', fontFamily: dm, width: '100%',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{
                background: '#F5F5F5', color: '#1A1A1A', border: '1px solid #E0E0E0', borderRadius: 6,
                padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: dm, minHeight: 'auto',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLink}
              disabled={!linkInput.trim()}
              style={{
                background: linkInput.trim() ? '#E85D20' : '#DDD', color: '#fff', border: 'none',
                borderRadius: 6, padding: '8px', fontSize: 12, fontWeight: 600, cursor: linkInput.trim() ? 'pointer' : 'not-allowed',
                fontFamily: dm, minHeight: 'auto',
              }}
            >
              Save Link
            </button>
          </div>
        </div>
      ) : (
        /* No Link - Add Button */
        <div>
          <button
            id="job-posting-link-trigger"
            onClick={() => setIsEditing(true)}
            style={{
              width: '100%', background: '#F9F9F9', color: '#E85D20', border: '1.5px dashed #E85D20',
              borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: dm, minHeight: 'auto', transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FFF5F0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F9F9F9')}
          >
            + Add Job Posting Link
          </button>
          <p style={{ fontSize: 11, color: '#999', margin: '6px 0 0', lineHeight: 1.4, fontFamily: dm }}>
            Suggested: Paste the original job URL so you can easily reference it later.
          </p>
        </div>
      )}
    </div>
  );
}
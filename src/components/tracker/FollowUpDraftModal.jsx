import React, { useMemo, useState } from 'react';
import { Copy, Zap, RefreshCw } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

// A few concise, sendable variations. Never shown all at once —
// Regenerate and "Try a different version" cycle through them.
const buildVariations = (jobTitle) => [
  `Hi [Name],

Just following up on my application for the ${jobTitle} role. I'm still very interested and happy to send anything else over if helpful.

Thanks,
[First Name]`,
  `Hi [Name],

I wanted to follow up on my application for the ${jobTitle} position. Still very interested — let me know if there's anything else you need from me.

Best,
[First Name]`,
  `Hi [Name],

Quick note to follow up on my ${jobTitle} application. I'd love any update when you have a moment, and I'm happy to share more if helpful.

Thanks,
[First Name]`,
];

export default function FollowUpDraftModal({ isOpen, onClose, application }) {
  const [variationIndex, setVariationIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAlternates, setShowAlternates] = useState(false);

  const jobTitle = application?.jobTitle || 'the role';
  const variations = useMemo(() => buildVariations(jobTitle), [jobTitle]);

  // Seed the message once per application open.
  React.useEffect(() => {
    if (isOpen && application) {
      setVariationIndex(0);
      setMessage(variations[0]);
      setShowAlternates(false);
      setCopied(false);
    }
  }, [isOpen, application, variations]);

  if (!isOpen || !application) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    const next = (variationIndex + 1) % variations.length;
    setVariationIndex(next);
    setMessage(variations[next]);
  };

  const handlePickAlternate = (i) => {
    setVariationIndex(i);
    setMessage(variations[i]);
    setShowAlternates(false);
  };

  const appliedLabel = application.dateApplied
    ? new Date(application.dateApplied).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          width: 'min(90vw, 520px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 201,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          padding: 28,
          fontFamily: dm,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Context line */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px' }}>
            Follow-up draft
          </p>
          <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
            {application.company} · {application.jobTitle}
          </p>
          {appliedLabel && (
            <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>Applied {appliedLabel}</p>
          )}
        </div>

        {/* Editable draft */}
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 180,
            fontSize: 13.5,
            color: '#1A1A1A',
            border: '1px solid #E0E0E0',
            borderRadius: 10,
            padding: 14,
            outline: 'none',
            fontFamily: dm,
            resize: 'vertical',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#0021A5')}
          onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
        />

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          <button
            onClick={handleRegenerate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              background: '#F5F5F5',
              color: '#1A1A1A',
              border: '1px solid #E0E0E0',
              borderRadius: 10,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
            }}
          >
            <RefreshCw size={15} /> Regenerate
          </button>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              background: copied ? '#10B981' : '#0021A5',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
            }}
          >
            <Copy size={15} /> {copied ? 'Copied!' : 'Copy message'}
          </button>
        </div>

        {/* Alternates — hidden by default */}
        <button
          onClick={() => setShowAlternates(s => !s)}
          style={{
            background: 'none',
            border: 'none',
            color: '#0021A5',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: dm,
            padding: '14px 0 0',
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Zap size={13} /> {showAlternates ? 'Hide versions' : 'Try a different version'}
        </button>

        {showAlternates && (
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {variations.map((v, i) => (
              <button
                key={i}
                onClick={() => handlePickAlternate(i)}
                style={{
                  textAlign: 'left',
                  background: i === variationIndex ? '#F0F4FF' : '#F9F9F9',
                  border: i === variationIndex ? '1.5px solid #0021A5' : '1px solid #E5E5E5',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  color: '#555',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  cursor: 'pointer',
                  fontFamily: dm,
                  transition: 'all 0.15s',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: dm,
            minHeight: 'auto',
            padding: '14px 0 0',
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}
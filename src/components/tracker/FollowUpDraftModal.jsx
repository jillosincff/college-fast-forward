import React, { useState } from 'react';
import { Copy, Zap } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

const TONE_OPTIONS = [
  { id: 'casual', label: 'Casual & Direct' },
  { id: 'professional', label: 'Polite & Professional' },
  { id: 'enthusiastic', label: 'Enthusiastic / High Energy' },
  { id: 'simple', label: 'Short & Simple' },
];

const SAMPLE_TEMPLATES = {
  casual: `Hey [Name],

Just following up on my Marketing Intern application from March 11th. 

I'm a junior at UF studying marketing and I'm a huge Disney fan — especially loved the recent campaign you worked on with [specific thing if known]. 

Would love any update on the role or if there's anything else I can send over.

Thanks!
[First Name]`,
  professional: `Hi [Name],

Quick follow-up on my Marketing Intern application. Still very interested and happy to chat or send more info if helpful.

Thanks,
[First Name]`,
  enthusiastic: `Hey [Name],

Hope you're doing well.

I applied for the Marketing Intern position on March 11th and I'm really excited about it — especially after seeing the work your team did on [recent project]. I'm a marketing major at UF and would love to contribute.

Any chance there's an update on my application?

Appreciate your time!
[First Name]`,
  simple: `Hi [Name],

Following up on my Marketing Intern application from March 11th. Still interested and happy to provide any additional information.

Thanks,
[First Name]`,
};

export default function FollowUpDraftModal({ isOpen, onClose, application }) {
  const [selectedTone, setSelectedTone] = useState('casual');
  const [customMessage, setCustomMessage] = useState(SAMPLE_TEMPLATES.casual);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !application) return null;

  const handleToneChange = (toneId) => {
    setSelectedTone(toneId);
    setCustomMessage(SAMPLE_TEMPLATES[toneId]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNew = () => {
    // In a real scenario, this would call an agent function to generate a new version
    const tones = Object.keys(SAMPLE_TEMPLATES);
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    setSelectedTone(randomTone);
    setCustomMessage(SAMPLE_TEMPLATES[randomTone]);
  };

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 200,
        }}
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
          width: 'min(90vw, 600px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 201,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          padding: 32,
          fontFamily: dm,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <h2 style={{ fontFamily: pf, fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Draft a Follow-up Message
        </h2>
        <p style={{ fontSize: 14, color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>
          The Agent writes messages that actually get replies (short, human, and specific).
        </p>

        {/* Application Context */}
        <div style={{ background: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>
            {application.company} – {application.jobTitle}
          </p>
          <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
            Applied {new Date(application.dateApplied).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Tone Selection */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.05em' }}>
            Suggested Tone
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {TONE_OPTIONS.map(tone => (
              <button
                key={tone.id}
                onClick={() => handleToneChange(tone.id)}
                style={{
                  padding: '10px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: selectedTone === tone.id ? '2px solid #E85D20' : '1.5px solid #E0E0E0',
                  background: selectedTone === tone.id ? '#FFF5F0' : '#fff',
                  color: selectedTone === tone.id ? '#E85D20' : '#555',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: dm,
                  transition: 'all 0.2s',
                  minHeight: 'auto',
                }}
              >
                {tone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview Templates */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 12px', letterSpacing: '0.05em' }}>
            High-Response Email Templates
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {['casual', 'professional', 'enthusiastic'].map((templateId, idx) => (
              <div
                key={templateId}
                style={{
                  background: templateId === 'casual' ? '#FFF5F0' : '#F9F9F9',
                  border: templateId === 'casual' ? '2px solid #E85D20' : '1px solid #E5E5E5',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12,
                  color: '#555',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = templateId === 'casual' ? '#FFF5F0' : '#F5F5F5'}
                onMouseLeave={e => e.currentTarget.style.background = templateId === 'casual' ? '#FFF5F0' : '#F9F9F9'}
              >
                <div style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
                  {idx === 0 ? '🌟 Best Performing (Casual + Specific)' : idx === 1 ? 'Short & Direct' : 'Enthusiastic (works well with alumni)'}
                </div>
                {SAMPLE_TEMPLATES[templateId]}
              </div>
            ))}
          </div>
        </div>

        {/* Customizable Message Textarea */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.05em' }}>
            Customize the message (optional)
          </p>
          <textarea
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
            style={{
              width: '100%',
              minHeight: 140,
              fontSize: 13,
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              padding: 12,
              outline: 'none',
              fontFamily: dm,
              resize: 'vertical',
              lineHeight: 1.6,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#E85D20')}
            onBlur={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <button
            onClick={handleGenerateNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#F5F5F5',
              color: '#1A1A1A',
              border: '1px solid #E0E0E0',
              borderRadius: 8,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E8E8E8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F5F5F5')}
          >
            <Zap size={16} />
            Generate New Version
          </button>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: copied ? '#10B981' : '#0021A5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: dm,
              minHeight: 'auto',
              transition: 'all 0.2s',
            }}
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy Message'}
          </button>
        </div>

        {/* Close Button */}
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
            padding: 8,
          }}
        >
          Close
        </button>
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function AutomatedAlumniActionPanel({ lead, user, onGenerate, onBack, generating }) {
  const [emailEnriching, setEmailEnriching] = useState(false);
  const [enrichedEmail, setEnrichedEmail] = useState(lead?.recipientEmail || '');
  const [emailConfidence, setEmailConfidence] = useState(null);

  // Auto-trigger Hunter.io email enrichment on mount
  useEffect(() => {
    const enrichEmail = async () => {
      if (enrichedEmail || !lead?.recipientName || !lead?.recipientCompany) return;
      
      setEmailEnriching(true);
      try {
        const domain = (lead.recipientCompany || '')
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9.]/g, '') + '.com';
        
        const firstName = (lead.recipientName || '').split(' ')[0].toLowerCase();
        const lastName = (lead.recipientName || '').split(' ').pop().toLowerCase();

        const res = await base44.functions.invoke('findContactEmail', {
          fullName: lead.recipientName,
          domain: domain,
          firstName,
          lastName,
        });

        if (res?.data?.email) {
          setEnrichedEmail(res.data.email);
          setEmailConfidence(res.data.confidence || 'high');
        }
      } catch (err) {
        console.log('Email enrichment skipped:', err.message);
      } finally {
        setEmailEnriching(false);
      }
    };

    enrichEmail();
  }, [lead?.recipientName, lead?.recipientCompany, enrichedEmail]);

  const handleGenerateAndSend = async () => {
    // Update pipeline status to 'reached_out' immediately
    try {
      const now = new Date().toISOString();
      const allPipelines = await base44.entities.NetworkingPipeline.list('-created_date', 200);
      
      const ADVANCED_STATUSES = ['replied', 'coffee_chat', 'interview', 'offer'];
      const match = allPipelines.find(p =>
        p.alumni_name?.toLowerCase() === (lead.recipientName || '').toLowerCase() ||
        (lead.recipientCompany && p.company?.toLowerCase() === lead.recipientCompany.toLowerCase())
      );

      if (match && !ADVANCED_STATUSES.includes(match.status)) {
        await base44.entities.NetworkingPipeline.update(match.id, {
          status: 'reached_out',
          reached_out_date: now,
          status_date: now,
        });
      }

      // Broadcast Kanban refresh
      window.dispatchEvent(new CustomEvent('cff:pipeline-refresh'));
    } catch (err) {
      console.error('Pipeline update failed:', err);
    }

    // Trigger message generation
    onGenerate?.();
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 13,
          color: '#888',
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          marginBottom: 32,
        }}
      >
        ← Back
      </button>

      {/* Premium header */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: '#475569',
          margin: '0 0 8px',
        }}
      >
        🔗 ALUMNI OUTREACH
      </p>

      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: '0 0 6px',
        }}
      >
        Reach out to {lead?.recipientName || 'Verified Insider'}
      </h1>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: '#666',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}
      >
        {lead?.recipientTitle && (
          <>
            <strong>{lead.recipientTitle}</strong> at{' '}
          </>
        )}
        <strong>{lead?.recipientCompany || 'Company Name'}</strong>
      </p>

      {/* Email enrichment card */}
      {emailEnriching ? (
        <div
          style={{
            background: '#F0F7FF',
            border: '1px solid #B3D9FF',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 14 }}>⚡</span>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#0057B8',
              margin: 0,
            }}
          >
            Scouting direct email...
          </p>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: '2px solid rgba(0,87,184,0.2)',
              borderTop: '2px solid #0057B8',
              marginLeft: 'auto',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      ) : enrichedEmail ? (
        <div
          style={{
            background: '#F0F7FF',
            border: '1px solid #B3D9FF',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#0057B8',
              margin: '0 0 8px',
            }}
          >
            ✓ VERIFIED EMAIL
          </p>
          <div
            style={{
              background: '#fff',
              border: '1px solid #B3D9FF',
              borderRadius: 8,
              padding: '10px 14px',
              display: 'inline-block',
            }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: '#1A1A1A',
                margin: 0,
                fontWeight: 500,
              }}
            >
              {enrichedEmail}
            </p>
          </div>
          {emailConfidence && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: '#0057B8',
                margin: '8px 0 0',
              }}
            >
              Confidence: {emailConfidence}
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            background: '#FFF5F0',
            border: '1px solid rgba(232,93,32,0.3)',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: '#8B5A3C',
              margin: 0,
            }}
          >
            💼 Email not found — we'll use their LinkedIn instead.
          </p>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleGenerateAndSend}
        disabled={generating || emailEnriching}
        style={{
          width: '100%',
          background: generating || emailEnriching ? '#F0F0F0' : '#1e3a5f',
          border: 'none',
          borderRadius: 10,
          padding: '16px',
          fontSize: 14,
          fontWeight: 600,
          color: generating || emailEnriching ? '#CCC' : '#fff',
          cursor: generating || emailEnriching ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.2s',
        }}
      >
        {generating ? '⚡ Generating personalized message...' : '🚀 Generate & Send Outreach →'}
      </button>

      {/* LinkedIn fallback */}
      {lead?.recipientLinkedinUrl && (
        <a
          href={lead.recipientLinkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: '#0077B5',
            marginTop: 16,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Or open LinkedIn →
        </a>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
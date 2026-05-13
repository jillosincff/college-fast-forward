import React, { useState } from 'react';
import { X } from 'lucide-react';

const pf = "'Playfair Display', serif";
const dm = "'DM Sans', sans-serif";

export default function EmailConnectionModal({ isOpen, onClose, onSuccess }) {
  const [screen, setScreen] = useState('initial');
  const [selectedProvider, setSelectedProvider] = useState(null);

  if (!isOpen) return null;

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setScreen('permissions');
  };

  const handleContinue = () => {
    setScreen('connecting');
    // Simulate scanning
    setTimeout(() => {
      setScreen('success');
    }, 2000);
  };

  const handleViewTracker = () => {
    onSuccess();
    setScreen('initial');
    setSelectedProvider(null);
    onClose();
  };

  const handleBack = () => {
    setScreen('initial');
    setSelectedProvider(null);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .email-modal-backdrop {
          animation: fadeIn 0.3s ease-out;
        }
        .email-modal-content {
          animation: slideUp 0.3s ease-out;
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="email-modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="email-modal-content"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          width: 'min(90vw, 540px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 2001,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            zIndex: 10,
            minHeight: 'auto',
          }}
        >
          <X size={20} color="#888" />
        </button>

        {/* Initial Screen - Provider Selection */}
        {screen === 'initial' && (
          <div style={{ padding: '40px 32px' }}>
            <h2 style={{ fontFamily: pf, fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Never manually add another application
            </h2>
            <p style={{ fontFamily: dm, fontSize: 15, color: '#666', margin: '0 0 32px', lineHeight: 1.6 }}>
              Connect your email and we'll automatically detect and import job applications, interview invites, and updates into your tracker.
            </p>

            {/* Benefits */}
            <div style={{ background: '#F9F9F9', borderRadius: 12, padding: 24, marginBottom: 32 }}>
              {[
                'Works with LinkedIn, Indeed, Handshake, company emails, and more',
                'Automatically tracks which resume you used and responses',
                'You stay in full control — disconnect anytime',
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ fontSize: 18, minWidth: 24 }}>✅</div>
                  <p style={{ fontFamily: dm, fontSize: 14, color: '#555', margin: 0 }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            {/* Provider Buttons */}
            <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => handleProviderSelect('Gmail')}
                style={{
                  background: '#E85D20',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '16px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#d44e14')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#E85D20')}
              >
                📧 Connect Gmail
              </button>
              <button
                onClick={() => handleProviderSelect('Outlook')}
                style={{
                  background: '#f0f0f0',
                  color: '#1A1A1A',
                  border: '1px solid #ddd',
                  borderRadius: 10,
                  padding: '16px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e5e5')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              >
                🔵 Connect Outlook / Microsoft 365
              </button>
              <button
                onClick={() => handleProviderSelect('Other')}
                style={{
                  background: '#f0f0f0',
                  color: '#1A1A1A',
                  border: '1px solid #ddd',
                  borderRadius: 10,
                  padding: '16px',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e5e5')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f0f0f0')}
              >
                ✉️ Connect Other Email
              </button>
            </div>

            {/* Trust Bar */}
            <div style={{ background: '#f9f9f9', borderRadius: 12, padding: '14px 16px', fontSize: 12, color: '#555', textAlign: 'center', fontFamily: dm, lineHeight: 1.6 }}>
              <div style={{ marginBottom: 4 }}>🔒 Secure read-only access via OAuth</div>
              <div>We only scan for job-related emails. You can revoke access anytime in Settings.</div>
            </div>
          </div>
        )}

        {/* Permissions Screen */}
        {screen === 'permissions' && (
          <div style={{ padding: '40px 32px' }}>
            <h2 style={{ fontFamily: pf, fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Secure Connection
            </h2>
            <p style={{ fontFamily: dm, fontSize: 15, color: '#666', margin: '0 0 28px', lineHeight: 1.6 }}>
              We only scan for job-related emails (application confirmations, interview requests, rejections, etc.).
            </p>

            {/* What We Won't Do */}
            <div style={{ background: '#FFF5F0', borderRadius: 12, padding: 20, marginBottom: 28 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#E85D20', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                We will never:
              </p>
              {[
                'Read your personal emails',
                'Send messages from your account',
                'Share your data with anyone',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ color: '#E85D20', fontSize: 16 }}>✕</span>
                  <p style={{ fontFamily: dm, fontSize: 14, color: '#555', margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* What We Will Do */}
            <div style={{ background: '#F0F9FF', borderRadius: 12, padding: 20, marginBottom: 32 }}>
              <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#0066CC', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                We will:
              </p>
              {[
                'View emails matching job keywords only',
                'Import application details (company, job title, date)',
                'Attach to your private workspace',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ color: '#0066CC', fontSize: 16 }}>✓</span>
                  <p style={{ fontFamily: dm, fontSize: 14, color: '#555', margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  background: '#f0f0f0',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                }}
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                style={{
                  flex: 1,
                  background: '#E85D20',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#d44e14')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#E85D20')}
              >
                Continue Securely →
              </button>
            </div>
          </div>
        )}

        {/* Connecting Screen */}
        {screen === 'connecting' && (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 24 }} className="pulse">
              🔍
            </div>
            <h2 style={{ fontFamily: pf, fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Scanning your emails…
            </h2>
            <p style={{ fontFamily: dm, fontSize: 14, color: '#666', margin: '0 0 20px', lineHeight: 1.6 }}>
              We're safely scanning for job-related emails (application confirmations, interview invites, etc.).
              <br />
              This usually takes 30–60 seconds.
            </p>
            <p style={{ fontFamily: dm, fontSize: 12, color: '#999', margin: 0 }}>
              Only looking at recent messages • You can continue using the app
            </p>
          </div>
        )}

        {/* Success Screen */}
        {screen === 'success' && (
          <div style={{ padding: '40px 32px' }}>
            <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 24 }}>✅</div>
            <h2 style={{ fontFamily: pf, fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', textAlign: 'center' }}>
              Email connected successfully!
            </h2>
            <p style={{ fontFamily: dm, fontSize: 15, color: '#666', margin: '0 0 32px', lineHeight: 1.6, textAlign: 'center' }}>
              We've started scanning your inbox. Any recent application emails from the last 30 days will be imported shortly.<br />You'll get a notification when new applications are added automatically.
            </p>

            {/* Status Card */}
            <div style={{ background: '#F0F9FF', borderRadius: 12, padding: 20, marginBottom: 32 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 32 }}>✅</span>
                <div>
                  <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#0066CC', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status: Connected
                  </p>
                  <p style={{ fontFamily: dm, fontSize: 14, color: '#555', margin: 0 }}>
                    {selectedProvider} • Scanning emails
                  </p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gap: 12 }}>
              <button
                onClick={handleViewTracker}
                style={{
                  background: '#E85D20',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#d44e14')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#E85D20')}
              >
                View My Application Tracker
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#f0f0f0',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                }}
              >
                Go Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
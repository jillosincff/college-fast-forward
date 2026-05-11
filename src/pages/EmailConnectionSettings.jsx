import React, { useState } from 'react';
import { Mail, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

const dm = "'DM Sans', sans-serif";
const pf = "'Playfair Display', serif";

export default function EmailConnectionSettings() {
  const { user } = useAuth();
  const [connectedAccounts, setConnectedAccounts] = useState([
    { id: 1, email: 'student@gmail.com', provider: 'Gmail', status: 'Actively scanning for job applications' }
  ]);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleDisconnectClick = (account) => {
    setSelectedAccount(account);
    setShowDisconnectModal(true);
  };

  const handleConfirmDisconnect = () => {
    setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== selectedAccount.id));
    setShowDisconnectModal(false);
    setSelectedAccount(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', fontFamily: dm }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E5E5', padding: '32px 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontFamily: pf, fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Email Connections
          </h1>
          <p style={{ fontSize: 15, color: '#666', margin: 0 }}>
            Manage your connected email accounts and scanning preferences.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        {/* Connected Accounts Section */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5E5', padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 24px' }}>
            Connected Accounts
          </h2>

          {connectedAccounts.length > 0 ? (
            <div>
              {connectedAccounts.map(account => (
                <div
                  key={account.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: 20,
                    background: '#F9F9F9',
                    borderRadius: 10,
                    border: '1px solid #F0F0F0',
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flex: 1 }}>
                    <div style={{ fontSize: 28 }}>📧</div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px', fontSize: 15 }}>
                        {account.provider}
                      </h3>
                      <p style={{ fontSize: 13, color: '#666', margin: '0 0 8px' }}>
                        connected as <strong>{account.email}</strong>
                      </p>
                      <p style={{ fontSize: 13, color: '#0066CC', margin: 0, fontWeight: 500 }}>
                        Status: {account.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnectClick(account)}
                    style={{
                      background: '#fff',
                      color: '#E85D20',
                      border: '1.5px solid #E85D20',
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: dm,
                      minHeight: 'auto',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Disconnect Email
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: '#999' }}>
              <Mail size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: 14, margin: 0 }}>No connected email accounts yet.</p>
            </div>
          )}
        </div>

        {/* Why We Connect Section */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E5E5', padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontFamily: pf, fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 20px' }}>
            Why we connect your email
          </h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              'Automatically add applications to your tracker',
              'Track responses and interview invites',
              'Save you hours of manual entry',
            ].map((benefit, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 18, color: '#E85D20', fontWeight: 700 }}>✓</div>
                <p style={{ fontSize: 14, color: '#555', margin: 0 }}>{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Reminder Section */}
        <div style={{ background: '#EBF5FF', borderRadius: 12, border: '1px solid #B3D9FF', padding: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <AlertCircle size={20} color="#0066CC" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <h3 style={{ fontWeight: 600, color: '#0066CC', margin: '0 0 8px', fontSize: 14 }}>
                Privacy reminder
              </h3>
              <p style={{ fontSize: 13, color: '#0052A3', margin: 0, lineHeight: 1.6 }}>
                Your data is private and encrypted. We only access job-related emails and you can revoke access at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 2000,
            }}
            onClick={() => setShowDisconnectModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#fff',
              borderRadius: 16,
              width: 'min(90vw, 420px)',
              zIndex: 2001,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              padding: 32,
            }}
          >
            <h2 style={{ fontFamily: pf, fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>
              Disconnect Email?
            </h2>
            <p style={{ fontSize: 15, color: '#666', margin: '0 0 28px', lineHeight: 1.6 }}>
              If you disconnect, we will stop importing new applications and no longer scan your inbox.
              <br />
              You can always reconnect later.
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              <button
                onClick={handleConfirmDisconnect}
                style={{
                  background: '#E85D20',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#d44e14')}
                onMouseOut={e => (e.currentTarget.style.background = '#E85D20')}
              >
                Yes, Disconnect
              </button>
              <button
                onClick={() => setShowDisconnectModal(false)}
                style={{
                  background: '#f0f0f0',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: dm,
                  minHeight: 'auto',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
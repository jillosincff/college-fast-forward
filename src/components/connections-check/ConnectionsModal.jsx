import React, { useState, useEffect } from 'react';
import { X, Users, ArrowLeft } from 'lucide-react';
import ConnectionCard from './ConnectionCard';
import IntroRequestModal from './IntroRequestModal';
import { useAuth } from '@/components/auth/AuthContext';

const dmSans = "'DM Sans', system-ui, sans-serif";

// Mock data generator
function generateMockConnections(company, count = 4) {
  const names = [
    'Jennifer Walsh', 'Robert Chen', 'Maria Garcia', 'David Thompson',
    'Sarah Mitchell', 'Michael Kim', 'Lisa Anderson', 'James Wilson',
  ];
  const roles = [
    'Senior Manager', 'Director', 'Vice President', 'Principal',
    'Managing Director', 'Partner', 'Head of Strategy',
  ];
  const types = ['Parent', 'Alumni'];
  const schools = ['University of Florida', 'University of Michigan', 'USC', 'Penn State', 'Tulane'];

  const shuffled = [...names].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((name, i) => ({
    id: `conn-${i}`,
    name,
    company,
    role: roles[Math.floor(Math.random() * roles.length)],
    type: types[Math.floor(Math.random() * types.length)],
    school: Math.random() > 0.5 ? schools[Math.floor(Math.random() * schools.length)] : null,
    openToHelping: Math.random() > 0.4,
    recentlyActive: Math.random() > 0.6,
  }));
}

export default function ConnectionsModal({ isOpen, onClose, company, userSchool }) {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    if (isOpen && company) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockConnections = generateMockConnections(company, 3 + Math.floor(Math.random() * 3));
        setConnections(mockConnections);
        setLoading(false);
      }, 800);
    }
  }, [isOpen, company]);

  if (!isOpen) return null;

  const handleRequestIntro = (connection) => {
    setSelectedConnection(connection);
  };

  const handleCloseIntroModal = () => {
    setSelectedConnection(null);
  };

  const handleIntroSent = () => {
    setSelectedConnection(null);
    // Could show success state or close modal
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 520,
        maxHeight: '85vh',
        background: '#0D0F13',
        border: '1px solid #23252B',
        borderRadius: 20,
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #1A1C22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(79,140,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={16} style={{ color: '#4F8CFF' }} />
            </div>
            <div>
              <h2 style={{
                fontFamily: dmSans,
                fontSize: 17,
                fontWeight: 700,
                color: '#fff',
                margin: 0,
              }}>
                Connections at {company}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s',
              minHeight: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}>
          <p style={{
            fontFamily: dmSans,
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 20,
          }}>
            Here are people in the network who may be able to help.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '2px solid rgba(79,140,255,0.2)',
                borderTopColor: '#4F8CFF',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{
                fontFamily: dmSans,
                fontSize: 14,
                color: 'rgba(255,255,255,0.4)',
              }}>
                Finding connections...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : connections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {connections.map(conn => (
                <ConnectionCard
                  key={conn.id}
                  connection={conn}
                  onRequestIntro={handleRequestIntro}
                />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{
                fontFamily: dmSans,
                fontSize: 15,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 8,
              }}>
                No connections found at {company} yet.
              </p>
              <p style={{
                fontFamily: dmSans,
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
              }}>
                Keep moving — direct outreach is still your best path.
              </p>
            </div>
          )}
        </div>

        {/* Trust footer */}
        {connections.length > 0 && !loading && (
          <div style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid #1A1C22',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <p style={{
              fontFamily: dmSans,
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6,
              marginBottom: 6,
            }}>
              These are members of the College Fast Forward network who have chosen to help students.
            </p>
            <p style={{
              fontFamily: dmSans,
              fontSize: 12,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.35)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              You can request an introduction — they are never contacted without your permission.
            </p>
          </div>
        )}
      </div>

      {/* Intro Request Modal */}
      {selectedConnection && (
        <IntroRequestModal
          isOpen={!!selectedConnection}
          onClose={handleCloseIntroModal}
          connection={selectedConnection}
          userSchool={userSchool || user?.school}
          userName={user?.full_name}
          onSuccess={handleIntroSent}
        />
      )}
    </>
  );
}
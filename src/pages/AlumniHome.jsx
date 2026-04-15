import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { navigate } from '@/components/utils/navigation';
import DashboardNav from '@/components/dashboard-v2/DashboardNav';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function AlumniHome() {
  const { user } = useAuth();

  // Load fonts
  useEffect(() => {
    if (!document.getElementById('alumni-home-fonts')) {
      const link = document.createElement('link');
      link.id = 'alumni-home-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Alumni';
  const schoolName = user?.school_name || user?.school || 'your network';

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav user={user} currentPage="AlumniHome" />

      <div style={{ flex: 1, maxWidth: 960, margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        <h1 style={{
          fontFamily: playfair, fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 16,
        }}>
          Welcome back, {firstName}.
        </h1>

        <p style={{
          fontFamily: dmSans, fontSize: 16, color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.8, marginBottom: 32, maxWidth: 600,
        }}>
          You're live in the {schoolName} network. Students can find you and request your help.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 40 }}>
          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 24,
          }}>
            <p style={{ fontFamily: playfair, fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>0</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Students Helped</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 24,
          }}>
            <p style={{ fontFamily: playfair, fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>0</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Messages</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 24,
          }}>
            <p style={{ fontFamily: playfair, fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>0</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Introductions Made</p>
          </div>
        </div>

        <button
          onClick={() => navigate('Directory')}
          style={{
            marginTop: 40, padding: '14px 32px', borderRadius: 10, border: 'none',
            background: '#E85D20', color: '#fff',
            fontFamily: dmSans, fontSize: 15, fontWeight: 600,
            cursor: 'pointer', minHeight: 'auto',
          }}
        >
          Browse Students in Your Network →
        </button>
      </div>
    </div>
  );
}
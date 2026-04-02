import React, { useState } from 'react';
import { navigate } from '@/components/utils/navigation';

const ORANGE = '#E85D20';

export default function ParentWelcomeScreen({ user, studentName, isFastIQActive, onActivate, onSkip, onProfile }) {
  const studentFirst = studentName || 'your student';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://collegefastforward.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', padding: '48px 20px 60px' }}>
      <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>

        {/* Success checkmark */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#F0FFF4', border: '2px solid #22C55E',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 28,
          margin: '0 auto 24px',
        }}>
          ✓
        </div>

        {/* Invitation confirmed */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: '#22C55E', margin: '0 0 32px',
        }}>
          Invitation sent to {studentFirst} ✓
        </p>

        {/* Hero — dark card */}
        <div style={{
          background: '#0A0A0A', borderRadius: 20,
          padding: '36px 32px', marginBottom: 32,
          textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.15em',
            color: '#E85D20', margin: '0 0 16px',
          }}>
            💙 YOU SHOWED UP
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(22px, 4vw, 30px)',
            fontWeight: 700, color: '#fff',
            margin: '0 0 16px', lineHeight: 1.3,
          }}>
            You've felt it. The worry.<br/>
            The "I wish I could do more."<br/>
            Today you did more.
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, color: 'rgba(255,255,255,0.55)',
            margin: 0, lineHeight: 1.7,
          }}>
            Most parents watch from the sidelines while their kid applies and waits, applies and waits.
            You just gave {studentFirst} something most students never get — a warm network,
            real connections, and a platform built to get them hired.
          </p>
        </div>

        {/* What happens next */}
        <div style={{
          background: '#fff', border: '1px solid #E5E5E5',
          borderRadius: 16, padding: '24px 28px',
          marginBottom: 24, textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#888', margin: '0 0 16px',
          }}>
            WHAT HAPPENS NEXT
          </p>
          {[
            { icon: '✉️', text: `${studentFirst} gets an invite to join CFF` },
            { icon: '🎯', text: 'She sets her career goals in 3 minutes' },
            { icon: '👥', text: 'FastIQ matches her with alumni at her target companies' },
            { icon: '🚀', text: 'She reaches out — with AI-drafted messages that actually get replies' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start',
              gap: 12, marginBottom: i < 3 ? 14 : 0,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14, color: '#444',
                margin: 0, lineHeight: 1.5,
              }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* FastIQ upsell */}
        <div style={{
          background: '#0A0A0A', borderRadius: 16,
          padding: '28px 32px', marginBottom: 24,
          textAlign: 'left',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#E85D20', margin: '0 0 12px',
          }}>
            ⚡ SUPERCHARGE {studentFirst?.toUpperCase()}'S JOB SEARCH
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15, color: 'rgba(255,255,255,0.75)',
            margin: '0 0 20px', lineHeight: 1.7,
          }}>
            FastIQ gives {studentFirst} everything she needs to go from applicant to candidate —
            resume scoring, mock interviews, LinkedIn optimization, unlimited alumni searches,
            and AI outreach that gets responses.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { stat: '10x', label: 'more likely to land interviews with warm intros' },
              { stat: '85%', label: 'of jobs are filled through connections, not applications' },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 16px',
                flex: 1, minWidth: 140,
              }}>
                <p style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28, fontWeight: 700,
                  color: '#E85D20', margin: '0 0 4px',
                }}>{item.stat}</p>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: 'rgba(255,255,255,0.5)',
                  margin: 0, lineHeight: 1.4,
                }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div style={{ marginBottom: 24 }}>
            {[
              '📄 Resume scoring against her target roles',
              '🔍 Unlimited alumni searches at dream companies',
              '🎤 Mock interview practice with real STAR feedback',
              '✉️ AI outreach drafts that get replies',
              '🧠 Career archetype assessment',
              '🔗 LinkedIn profile scoring and optimization',
            ].map((item, i) => (
              <p key={i} style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13, color: 'rgba(255,255,255,0.75)',
                margin: '0 0 8px', lineHeight: 1.5,
              }}>{item}</p>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('FastIQDashboard')}
            style={{
              background: '#E85D20', border: 'none',
              borderRadius: 10, padding: '14px',
              fontSize: 14, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%', marginBottom: 12, minHeight: 'auto',
            }}
          >
            Unlock FastIQ for {studentFirst} — $14.50/month →
          </button>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: 'rgba(255,255,255,0.4)',
            textAlign: 'center', margin: 0,
          }}>
            🎖 Founding member rate — 50% off forever · Expires April 15, 2026
          </p>
        </div>

        {/* Share CTA */}
        <div style={{
          background: '#F9F9F9', borderRadius: 14,
          padding: '20px 24px', marginBottom: 24,
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, fontWeight: 600,
            color: '#1A1A1A', margin: '0 0 8px',
          }}>
            Know another parent who'd want this for their kid?
          </p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: '#888',
            margin: '0 0 16px', lineHeight: 1.5,
          }}>
            Every parent in the network makes it stronger for everyone's kids.
          </p>
          <button
            onClick={handleCopy}
            style={{
              background: 'none', border: '1px solid #E0E0E0',
              borderRadius: 10, padding: '10px 20px',
              fontSize: 13, fontWeight: 600, color: '#555',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              width: '100%', minHeight: 'auto',
            }}
          >
            {copied ? 'Link copied! ✓' : 'Share College Fast Forward →'}
          </button>
        </div>

        {/* Go to dashboard */}
        <button
          onClick={() => navigate('ParentHome')}
          style={{
            background: 'none', border: 'none',
            fontSize: 13, color: '#AAAAAA',
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            minHeight: 'auto',
          }}
        >
          Go to my dashboard →
        </button>

      </div>
    </div>
  );
}
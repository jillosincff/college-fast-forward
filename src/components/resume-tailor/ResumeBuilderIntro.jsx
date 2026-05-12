import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Upload, Sparkles, ArrowRight } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";
const pf = "'Playfair Display', Georgia, serif";

export default function ResumeBuilderIntro({ user, onStart, onUpload, onSkip }) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
      style={{ background: '#0d1117', borderRadius: 16, padding: '40px 32px', color: '#fff' }}
    >
      {/* Greeting */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: dm,
          fontSize: 14,
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 12px',
          lineHeight: 1.6,
        }}>
          Hi {firstName}, I'm your Agent.
        </p>
        <h2 style={{
          fontFamily: pf,
          fontSize: 28,
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          lineHeight: 1.2,
        }}>
          Let's build a resume that actually gets noticed.
        </h2>
      </div>

      {/* Sub-headline */}
      <p style={{
        fontFamily: dm,
        fontSize: 15,
        color: 'rgba(255,255,255,0.75)',
        margin: 0,
        lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Answer a few quick questions and I'll create a professional, targeted resume tailored to your goals.
      </p>

      {/* Benefit bullets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          'ATS-friendly formatting',
          'Tailored to the types of roles you want',
          'Highlights your strengths clearly',
          'Ready to download and customize further',
        ].map((benefit, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 style={{ width: 18, height: 18, color: '#22C55E', flexShrink: 0 }} />
            <span style={{
              fontFamily: dm,
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
            }}>
              {benefit}
            </span>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <button
        onClick={onStart}
        style={{
          background: '#FA4616',
          border: 'none',
          borderRadius: 10,
          padding: '14px 28px',
          fontFamily: dm,
          fontSize: 15,
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          width: '100%',
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#E85D20')}
        onMouseLeave={e => (e.currentTarget.style.background = '#FA4616')}
      >
        Start Building My Resume
        <ArrowRight style={{ width: 16, height: 16 }} />
      </button>

      {/* Secondary option */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <p style={{
          fontFamily: dm,
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          margin: '0 0 8px',
        }}>
          I already have a resume
        </p>
        <button
          onClick={onUpload}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '8px 16px',
            fontFamily: dm,
            fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            minHeight: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          <Upload style={{ width: 14, height: 14 }} />
          Upload for Review
        </button>
      </div>

      {/* Footer link */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: dm,
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: 0,
            minHeight: 'auto',
            textDecoration: 'underline',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
}
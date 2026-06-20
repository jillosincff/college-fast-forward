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
      className="space-y-6"
      style={{ background: '#fff', borderRadius: 16, padding: '40px 32px', border: '1px solid #e5e7eb' }}
    >
      {/* Greeting */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: dm,
          fontSize: 13,
          color: '#6b7280',
          margin: '0 0 10px',
          lineHeight: 1.6,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
        }}>
          Resume Builder
        </p>
        <h2 style={{
          fontFamily: pf,
          fontSize: 26,
          fontWeight: 700,
          color: '#111827',
          margin: 0,
          lineHeight: 1.25,
        }}>
          Let's build a resume that actually gets noticed.
        </h2>
        <p style={{
          fontFamily: dm,
          fontSize: 14,
          color: '#6b7280',
          margin: '10px 0 0',
          lineHeight: 1.6,
        }}>
          Hi {firstName} — answer a few quick questions and I'll create a professional, targeted resume tailored to your goals.
        </p>
      </div>

      {/* Benefit bullets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: '#f9fafb', borderRadius: 12, padding: '16px 20px' }}>
        {[
          'ATS-friendly formatting',
          'Tailored to the types of roles you want',
          'Highlights your strengths clearly',
          'Ready to download and customize further',
        ].map((benefit, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
            <span style={{ fontFamily: dm, fontSize: 14, color: '#374151' }}>
              {benefit}
            </span>
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <button
        onClick={onStart}
        style={{
          background: '#7c3aed',
          border: 'none',
          borderRadius: 10,
          padding: '14px 28px',
          fontFamily: dm,
          fontSize: 15,
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          width: '100%',
          minHeight: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'background 0.2s',
          boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#6d28d9')}
        onMouseLeave={e => (e.currentTarget.style.background = '#7c3aed')}
      >
        Start Building My Resume
        <ArrowRight style={{ width: 16, height: 16 }} />
      </button>

      {/* Secondary option */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#9ca3af', margin: '0 0 8px' }}>
          I already have a resume
        </p>
        <button
          onClick={onUpload}
          style={{
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '8px 18px',
            fontFamily: dm,
            fontSize: 13,
            color: '#374151',
            cursor: 'pointer',
            minHeight: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e5e7eb'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; }}
        >
          <Upload style={{ width: 14, height: 14 }} />
          Upload for Review
        </button>
      </div>

      {/* Footer link */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onSkip}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: dm,
            fontSize: 12,
            color: '#9ca3af',
            cursor: 'pointer',
            padding: 0,
            minHeight: 'auto',
            textDecoration: 'underline',
          }}
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
}
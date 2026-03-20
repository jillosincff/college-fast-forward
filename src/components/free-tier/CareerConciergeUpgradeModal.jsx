import React from 'react';
import { X, Check } from 'lucide-react';

export default function CareerConciergeUpgradeModal({ onClose, onAskParent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 20 }}>✨</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                Career Concierge
              </h2>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', margin: 0 }}>
              Your personal AI career advisor.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', minWidth: 'auto', color: '#999', padding: 4 }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Body */}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#555', lineHeight: 1.65 }}>
            Career Concierge gives your student the tools to present themselves like a professional — polished resume, confident interview skills, and a LinkedIn profile that gets noticed.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { label: 'Résumés & Cover Letters', desc: 'AI-tailored for every role and ATS-optimized' },
              { label: 'Mock Interviews', desc: 'Practice with real company-specific questions' },
              { label: 'LinkedIn Profile Review', desc: 'Get recruiter-ready with personalized feedback' },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#E85D20]/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#E85D20]" />
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{f.label}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider + bridge line */}
          <div style={{ height: 1, background: '#E0E0E0' }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Career Concierge is included in FastIQ — along with alumni discovery, personalized outreach, and your full career plan.
          </p>

          {/* Pricing */}
          <div className="bg-[#FFF8F5] rounded-xl p-4">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1A1A1A', margin: '0 0 2px' }}>
              $29/month <span style={{ fontWeight: 400, color: '#888' }}>or</span> $187/year
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0 }}>
              7-day free trial included · Save $62 with annual — founding member rate, locks in permanently.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <button
              className="w-full bg-[#E85D20] text-white py-3 rounded-full font-semibold hover:bg-[#d44e14] transition-colors"
              style={{ minHeight: 'auto' }}
            >
              Unlock FastIQ + Career Concierge →
            </button>
            <button
              onClick={onAskParent}
              className="w-full border border-[#E85D20] text-[#E85D20] py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
              style={{ minHeight: 'auto' }}
            >
              Ask My Parent to Activate →
            </button>
          </div>

          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>
            Cancel anytime. No long-term commitment.
          </p>
        </div>
      </div>
    </div>
  );
}
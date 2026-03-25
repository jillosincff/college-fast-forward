import React, { useState } from 'react';
import { Target, ChevronDown } from 'lucide-react';
import EditGoalsModal from './EditGoalsModal';

export default function GoalsSummaryCard({ goals, onTabChange, onFindLeads, onRestart, showLeadsArrow, user, onGoalsUpdated }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [openedFromNudge, setOpenedFromNudge] = useState(false);
  const roles = goals?.target_roles?.join(', ') || goals?.role || '—';
  const industries = goals?.target_industries?.length
    ? goals.target_industries.join(', ')
    : (goals?.industries?.length ? goals.industries.join(', ') : '—');
  const functions = goals?.target_functions?.length
    ? goals.target_functions.join(', ')
    : '—';
  const SEEKING_LABELS = { 'full_time': 'Full-time', 'internship': 'Internship', 'both': 'Both', 'Full-time': 'Full-time', 'Internship': 'Internship', 'Both': 'Both' };
  const seeking = goals?.seeking ? (SEEKING_LABELS[goals.seeking] || goals.seeking) : '—';
  const gradYear = goals?.graduation_year?.toString() || '—';
  const location = goals?.location_preference || goals?.locations?.[0] || '—';
  const dreamCo = goals?.dream_company || '—';
  const experience = goals?.experience_level || '—';
  const major = goals?.major || '—';

  const rows = [
    ['Target Roles', roles],
    ['Industries', industries],
    ['Job Functions', functions],
    ['Looking for', seeking],
    ['Graduating', gradYear],
    ['Location', location],
    ['Major', major],
    ['Dream Company', dreamCo],
    ['Experience', experience],
  ];

  const hasEnoughTargetCompanies = goals?.target_companies?.length >= 2;

  return (
    <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Target style={{ width: 20, height: 20, color: '#E85D20' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Career Goals</p>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#888', minWidth: 120, flexShrink: 0 }}>{label}:</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Target Companies Nudge — show if fewer than 2 companies */}
      {!hasEnoughTargetCompanies && (
        <div style={{
          background: '#FAFAFA',
          border: '1px solid #E5E5E5',
          borderRadius: '12px',
          padding: '16px 20px',
          marginTop: '16px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '10px',
          }}>
            <span style={{ color: '#E85D20', fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>⚡</span>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#1A1A1A',
                margin: '0 0 4px 0',
              }}>
                Add a few target companies to sharpen your matches
              </p>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: 0,
                lineHeight: '1.5',
              }}>
                No dream company yet? That's fine — even 2 or 3 examples help FastIQ understand the type of company you're looking for.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setOpenedFromNudge(true); setShowEditModal(true); }}
            style={{
              background: 'none',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '7px 14px',
              fontSize: '12px',
              color: '#333',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontFamily: "'DM Sans', sans-serif",
              minHeight: 'auto',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#E85D20'; e.target.style.color = '#E85D20'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = '#E0E0E0'; e.target.style.color = '#333'; }}
          >
            + Add target companies
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={onFindLeads || (() => onTabChange?.('company_intel'))}
          style={{ background: '#E85D20', color: '#fff', border: 'none', borderRadius: 100, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
          Find My Leads →
          {showLeadsArrow && <ChevronDown style={{ width: 16, height: 16, animation: 'bounceDown 1s ease-in-out infinite' }} />}
        </button>
        <button onClick={() => onTabChange?.('career_path')}
          style={{ background: '#fff', color: '#E85D20', border: '2px solid #E85D20', borderRadius: 100, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif" }}>
          Dig Into Career Paths →
        </button>
        <button onClick={() => { setOpenedFromNudge(false); setShowEditModal(true); }}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', minHeight: 'auto', textDecoration: 'underline', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
          Update my goals
        </button>
      </div>
      {showEditModal && (
        <EditGoalsModal
          goals={goals}
          user={user}
          openedFromNudge={openedFromNudge}
          onClose={() => { setShowEditModal(false); setOpenedFromNudge(false); }}
          onSave={(updated) => {
            onGoalsUpdated?.(updated);
            setShowEditModal(false);
            setOpenedFromNudge(false);
          }}
          onStartFresh={onRestart}
        />
      )}
      <style>{`
        @keyframes bounceDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      `}</style>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';

const INDUSTRY_COMPANIES = {
  'Technology': ['Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA', 'Salesforce', 'Oracle'],
  'Finance & Banking': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Citadel', 'Deloitte', 'PwC', 'Bank of America', 'Raymond James'],
  'Consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'EY', 'KPMG', 'Booz Allen'],
  'Healthcare': ['Mayo Clinic', 'UF Health', 'HCA', 'UnitedHealth', 'Johnson & Johnson', 'Medtronic', 'CVS Health', 'Baptist Health'],
  'Engineering': ['Lockheed Martin', 'Boeing', 'L3Harris', 'Raytheon', 'SpaceX', 'Tesla', 'Siemens', 'GE'],
  'Marketing': ['WPP', 'Ogilvy', 'HubSpot', 'Adobe', 'Procter & Gamble', 'Nike', 'Disney', 'Coca-Cola'],
  'Law & Legal': ['White & Case', 'Holland & Knight', 'Greenberg Traurig', 'Baker McKenzie', 'Kirkland & Ellis', 'GrayRobinson'],
  'Data & Analytics': ['Palantir', 'Snowflake', 'Databricks', 'Tableau', 'SAS', 'IBM', 'Splunk', 'Alteryx'],
};
const GENERIC_COMPANIES = ['Google', 'Amazon', 'Deloitte', 'JPMorgan', 'Lockheed Martin', 'UF Health', 'Disney', 'PwC'];

export default function AddTargetsModal({ profile, onClose, onSaved }) {
  const existing = (profile?.target_companies || []).map(titleCase);
  const [companies, setCompanies] = useState(existing);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  const industries = (profile?.target_industry || '').split(', ').filter(Boolean);
  const primaryIndustry = industries[0];
  const suggestions = (INDUSTRY_COMPANIES[primaryIndustry] || GENERIC_COMPANIES)
    .filter(c => !companies.map(tc => tc.toLowerCase()).includes(c.toLowerCase()));

  const addCompany = (name) => {
    const clean = titleCase(name.trim());
    if (!clean) return;
    if (companies.length >= 5) return;
    if (companies.map(c => c.toLowerCase()).includes(clean.toLowerCase())) return;
    setCompanies(prev => [...prev, clean]);
    setInput('');
  };

  const removeCompany = (name) => {
    setCompanies(prev => prev.filter(c => c !== name));
  };

  const handleSave = async () => {
    if (!profile?.id) {
      console.error('No profile ID — cannot save targets');
      return;
    }
    setSaving(true);
    await base44.entities.FastTrackProProfile.update(profile.id, {
      target_companies: companies,
    });
    setSaving(false);
    onSaved(companies);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'relative', background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)', padding: '28px 24px',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: '#F1F5F9',
          border: 'none', borderRadius: 10, width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
        }}>
          <X style={{ width: 18, height: 18, color: '#64748B' }} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            Add Target Companies
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>
            Tell FASTIQ which companies you're interested in and it will find UF alumni, track hiring signals, and scout opportunities.
          </p>
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompany(input); } }}
            placeholder="Type a company name..."
            disabled={companies.length >= 5}
            style={{
              flex: 1, height: 44, padding: '0 14px', borderRadius: 12,
              border: '2px solid #E2E8F0', fontSize: 14, outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = '#0021A5'; }}
            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; }}
            autoFocus
          />
          <button
            onClick={() => addCompany(input)}
            disabled={!input.trim() || companies.length >= 5}
            style={{
              height: 44, padding: '0 18px', borderRadius: 12, border: 'none',
              background: (!input.trim() || companies.length >= 5) ? '#E2E8F0' : '#0021A5',
              color: (!input.trim() || companies.length >= 5) ? '#94A3B8' : '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.2s',
            }}
          >
            Add
          </button>
        </div>

        {/* Added companies */}
        {companies.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              Your targets ({companies.length}/5)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {companies.map(c => (
                <div key={c} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: '#F8FAFC', borderRadius: 12,
                  border: '1px solid #E2E8F0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Building2 style={{ width: 16, height: 16, color: '#0021A5' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{c}</span>
                  </div>
                  <button onClick={() => removeCompany(c)} style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none',
                    background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
                    transition: 'all 0.2s',
                  }}>
                    <X style={{ width: 14, height: 14, color: '#EF4444' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {companies.length < 5 && suggestions.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
              {primaryIndustry ? `Popular in ${primaryIndustry}` : 'Popular with UF students'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.slice(0, 8).map(c => (
                <button
                  key={c}
                  onClick={() => addCompany(c)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '1.5px solid #E2E8F0',
                    background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569',
                    cursor: 'pointer', minHeight: 'auto', minWidth: 'auto',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0021A5'; e.currentTarget.style.color = '#0021A5'; e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#fff'; }}
                >
                  + {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || companies.length === 0}
          style={{
            width: '100%', height: 48, borderRadius: 14, border: 'none',
            background: (saving || companies.length === 0) ? '#CBD5E1' : '#0021A5',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s', minHeight: 'auto',
          }}
        >
          {saving && <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />}
          {saving ? 'Saving...' : 'Save Targets'}
        </button>
      </div>
    </div>
  );
}
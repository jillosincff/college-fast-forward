import React, { useState } from 'react';
import { Building2, X, Sparkles } from 'lucide-react';
import titleCase from '@/components/utils/titleCase';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const INDUSTRY_SUGGESTIONS = {
  'Marketing': ['HubSpot', 'Ogilvy', 'Publicis', 'WPP', 'Edelman', 'Dentsu'],
  'Finance & Banking': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Deloitte', 'Raymond James', 'Citadel'],
  'Technology & Software': ['Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA', 'Salesforce'],
  'Consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'EY', 'KPMG'],
  'Healthcare': ['Mayo Clinic', 'UF Health', 'HCA', 'UnitedHealth', 'Johnson & Johnson', 'Baptist Health'],
  'Media & Entertainment': ['Disney', 'Netflix', 'Warner Bros', 'Spotify', 'Comcast', 'Live Nation'],
  'Engineering': ['Lockheed Martin', 'Boeing', 'SpaceX', 'L3Harris', 'Raytheon', 'Northrop Grumman'],
};
const GENERIC = ['Google', 'Amazon', 'Deloitte', 'JPMorgan', 'Disney', 'McKinsey', 'Meta', 'Goldman Sachs'];

export default function FastIQStep2Companies({ companies, onCompaniesChange, industries, explorerMode, onExplorerModeChange }) {
  const [input, setInput] = useState('');

  const addCompany = () => {
    const name = titleCase(input.trim());
    if (name && companies.length < 10 && !companies.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
      onCompaniesChange([...companies, name]);
      setInput('');
    }
  };

  const removeCompany = (name) => {
    onCompaniesChange(companies.filter(c => c !== name));
  };

  const addSuggestion = (name) => {
    if (companies.length < 10 && !companies.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
      onCompaniesChange([...companies, name]);
    }
  };

  // Build suggestions from user's industries
  const suggestions = (() => {
    const set = new Set();
    (industries || []).forEach(ind => {
      (INDUSTRY_SUGGESTIONS[ind] || []).forEach(c => set.add(c));
    });
    if (set.size === 0) GENERIC.forEach(c => set.add(c));
    return Array.from(set).filter(c => !companies.map(tc => tc.toLowerCase()).includes(c.toLowerCase())).slice(0, 8);
  })();

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        What companies are you actually trying to get into?
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginBottom: 28 }}>
        FASTIQ will find UF alumni working there right now. Be specific — or tell us what kind of company if you're not sure yet.
      </p>

      {!explorerMode ? (
        <>
          {/* Input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
              placeholder="e.g. Google, Nike, McKinsey, HubSpot"
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 12,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
                color: '#f4f0e8', fontFamily: dmSans, fontSize: 14, outline: 'none',
              }}
            />
            <button
              onClick={addCompany}
              disabled={!input.trim() || companies.length >= 10}
              style={{
                padding: '12px 20px', borderRadius: 12, border: 'none',
                background: input.trim() && companies.length < 10 ? orange : 'rgba(255,255,255,0.06)',
                color: input.trim() && companies.length < 10 ? '#fff' : 'rgba(255,255,255,0.3)',
                fontFamily: dmSans, fontSize: 14, fontWeight: 500, cursor: 'pointer',
                minHeight: 'auto', width: 'auto',
              }}
            >
              Add
            </button>
          </div>

          {/* Company chips */}
          {companies.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {companies.map(c => (
                <span key={c} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)',
                  borderRadius: 100, padding: '8px 14px',
                  fontFamily: dmSans, fontSize: 13, color: '#f4f0e8',
                }}>
                  <Building2 className="w-3 h-3" style={{ color: orange }} /> {c}
                  <button onClick={() => removeCompany(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, minHeight: 'auto', width: 'auto' }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {companies.length > 0 && (
            <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.3)', marginBottom: 20 }}>{companies.length}/10 companies</p>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && companies.length < 10 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: 'rgba(244,240,232,0.4)', marginBottom: 10 }}>Popular with UF students:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suggestions.map(c => (
                  <button
                    key={c}
                    onClick={() => addSuggestion(c)}
                    style={{
                      padding: '8px 14px', borderRadius: 100, border: '0.5px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.04)', color: 'rgba(244,240,232,0.6)',
                      fontFamily: dmSans, fontSize: 12, cursor: 'pointer', minHeight: 'auto', width: 'auto',
                    }}
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explorer toggle */}
          <button
            onClick={() => onExplorerModeChange(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 16px', borderRadius: 14,
              border: '2px dashed rgba(255,255,255,0.12)', background: 'transparent',
              color: 'rgba(244,240,232,0.5)', fontFamily: dmSans, fontSize: 13, fontWeight: 400,
              cursor: 'pointer', minHeight: 'auto',
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: orange }} />
            I don't have specific companies yet — find me alumni in my industries
          </button>
        </>
      ) : (
        <div>
          <div style={{
            background: 'rgba(232,93,32,0.08)', border: '0.5px solid rgba(232,93,32,0.2)',
            borderRadius: 14, padding: '20px', marginBottom: 20,
          }}>
            <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 400, color: '#f4f0e8', marginBottom: 8 }}>
              Explorer mode enabled
            </p>
            <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.5)', lineHeight: 1.6, margin: 0 }}>
              FASTIQ will search for UF alumni across your selected industries: <strong style={{ color: '#f4f0e8' }}>{(industries || []).join(', ') || 'all industries'}</strong>
            </p>
          </div>

          <button
            onClick={() => onExplorerModeChange(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.35)', textDecoration: 'underline',
              minHeight: 'auto', width: 'auto',
            }}
          >
            ← I actually have specific companies in mind
          </button>
        </div>
      )}
    </div>
  );
}
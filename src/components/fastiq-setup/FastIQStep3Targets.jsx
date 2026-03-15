import React, { useState } from 'react';
import { Building2, X, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import titleCase from '@/components/utils/titleCase';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";
const orange = '#E85D20';

const INDUSTRY_SUGGESTIONS = {
  'Marketing': ['HubSpot', 'Ogilvy', 'Publicis', 'WPP', 'Edelman', 'Nike'],
  'Finance & Banking': ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Deloitte', 'Raymond James', 'Citadel'],
  'Technology & Software': ['Google', 'Apple', 'Amazon', 'Microsoft', 'Meta', 'NVIDIA'],
  'Consulting': ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture', 'EY'],
  'Healthcare': ['Mayo Clinic', 'UF Health', 'HCA', 'UnitedHealth', 'Johnson & Johnson', 'Baptist Health'],
  'Media & Entertainment': ['Disney', 'Netflix', 'Warner Bros', 'Spotify', 'Comcast', 'Live Nation'],
  'Engineering': ['Lockheed Martin', 'Boeing', 'SpaceX', 'L3Harris', 'Raytheon', 'Northrop Grumman'],
};
const GENERIC = ['Google', 'Amazon', 'Deloitte', 'JPMorgan', 'Disney', 'McKinsey', 'Meta', 'Goldman Sachs'];

export default function FastIQStep3Targets({ companies, onCompaniesChange, industries, mode, onSkip }) {
  const [input, setInput] = useState('');
  const [suggestMode, setSuggestMode] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const addCompany = (name) => {
    const clean = titleCase((name || input).trim());
    if (clean && companies.length < 10 && !companies.map(c => c.toLowerCase()).includes(clean.toLowerCase())) {
      onCompaniesChange([...companies, clean]);
    }
    if (!name) setInput('');
  };

  const removeCompany = (name) => onCompaniesChange(companies.filter(c => c !== name));

  const staticSuggestions = (() => {
    const set = new Set();
    (industries || []).forEach(ind => (INDUSTRY_SUGGESTIONS[ind] || []).forEach(c => set.add(c)));
    if (set.size === 0) GENERIC.forEach(c => set.add(c));
    return Array.from(set).filter(c => !companies.map(tc => tc.toLowerCase()).includes(c.toLowerCase())).slice(0, 6);
  })();

  const loadAiSuggestions = async () => {
    setSuggestMode(true);
    setLoadingSuggestions(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 8 companies a University of Florida student should target. Their major: ${industries?.join(', ') || 'undeclared'}. Include a mix of large and smaller companies that actively hire entry-level from UF. Return JSON.`,
        response_json_schema: { type: 'object', properties: { companies: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, reason: { type: 'string' } }, required: ['name', 'reason'] } } }, required: ['companies'] },
      });
      setAiSuggestions(res.companies || []);
    } catch { setAiSuggestions([]); }
    setLoadingSuggestions(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', width: '100%', padding: '0 24px' }}>
      <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 'clamp(22px, 5vw, 28px)', color: '#f4f0e8', letterSpacing: '-0.02em', marginBottom: 8 }}>
        What companies are you targeting?
      </h1>
      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.55)', lineHeight: 1.6, marginBottom: 20 }}>
        FASTIQ will find UF alumni there, analyze hiring signals, and draft your outreach.
      </p>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ key: false, label: 'Specific companies' }, { key: true, label: "I'm not sure yet — suggest some" }].map(opt => (
          <button key={String(opt.key)} onClick={() => { setSuggestMode(opt.key); if (opt.key && aiSuggestions.length === 0) loadAiSuggestions(); }}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 100, border: 'none',
              background: suggestMode === opt.key ? orange : 'rgba(255,255,255,0.06)',
              color: suggestMode === opt.key ? '#fff' : 'rgba(244,240,232,0.5)',
              fontFamily: dmSans, fontSize: 13, fontWeight: 500, cursor: 'pointer', minHeight: 'auto',
              transition: 'all 0.15s',
            }}
          >{opt.label}</button>
        ))}
      </div>

      {!suggestMode ? (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompany(); } }}
              placeholder="Type a company name..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#f4f0e8', fontFamily: dmSans, fontSize: 14, outline: 'none' }}
            />
            <button onClick={() => addCompany()} disabled={!input.trim() || companies.length >= 10}
              style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: input.trim() ? orange : 'rgba(255,255,255,0.06)', color: input.trim() ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: dmSans, fontSize: 14, fontWeight: 500, cursor: 'pointer', minHeight: 'auto', width: 'auto' }}>
              Add
            </button>
          </div>

          {/* Chips */}
          {companies.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {companies.map(c => (
                <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '6px 14px', fontFamily: dmSans, fontSize: 13, color: '#f4f0e8' }}>
                  <Building2 className="w-3 h-3" style={{ color: orange }} /> {c}
                  <button onClick={() => removeCompany(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: orange, padding: 0, minHeight: 'auto', width: 'auto' }}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
          {companies.length > 0 && <p style={{ fontFamily: dmSans, fontSize: 12, color: 'rgba(244,240,232,0.3)', marginBottom: 16 }}>{companies.length}/10 companies</p>}

          {/* Static suggestions */}
          {staticSuggestions.length > 0 && companies.length < 10 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.35)', marginBottom: 8 }}>Based on your interests, you might consider:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {staticSuggestions.map(c => (
                  <button key={c} onClick={() => addCompany(c)}
                    style={{ padding: '8px 14px', borderRadius: 100, border: '0.5px dashed rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'rgba(244,240,232,0.5)', fontFamily: dmSans, fontSize: 12, cursor: 'pointer', minHeight: 'auto', width: 'auto' }}>
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div>
          {loadingSuggestions ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: orange }} />
              <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.5)' }}>FASTIQ is finding companies that match your background...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {aiSuggestions.map(s => {
                const isSelected = companies.map(c => c.toLowerCase()).includes(s.name.toLowerCase());
                return (
                  <button key={s.name} onClick={() => isSelected ? removeCompany(s.name) : addCompany(s.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
                      border: isSelected ? '1px solid rgba(232,93,32,0.4)' : '0.5px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(232,93,32,0.08)' : 'rgba(255,255,255,0.04)',
                      cursor: 'pointer', textAlign: 'left', width: '100%', minHeight: 'auto',
                    }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSelected ? orange : 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 500, color: '#f4f0e8', margin: 0 }}>{s.name}</p>
                      <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,0.4)', margin: 0 }}>{s.reason}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Skip */}
      <button onClick={onSkip}
        style={{ display: 'block', margin: '24px auto 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: 'rgba(244,240,232,0.25)', minHeight: 44, width: 'auto' }}>
        I'll add this later →
      </button>
    </div>
  );
}
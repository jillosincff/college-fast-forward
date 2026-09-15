import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ExternalLink, Copy, Check, Loader2, Mail } from 'lucide-react';
import { gatePersonReal } from '@/lib/personGate';
import { chipKeywordsFor, checkOnChip } from '@/lib/chipGate';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// Post-apply success beat. After a student marks a role as applied (writes
// NetworkingPipeline status 'applied'), offer to search people at THAT company
// only — never auto-search, never a job board. People-only rows: name / title /
// company / LinkedIn / outreach draft. No fallthrough to JobsList.
export default function PostApplyPeopleBeat({ user, company, onOptIn }) {
  const [choice, setChoice] = useState('ask'); // 'ask' | 'searching' | 'done' | 'dismissed'
  const [people, setPeople] = useState([]);
  const [copied, setCopied] = useState(null);

  const cg = user?.career_goals || {};
  const role = (cg.target_roles || [])[0] || (cg.target_industries || [])[0] || '';
  const school = user?.school || user?.school_code || 'your school';
  const schoolCode = (user?.school_code || '').toUpperCase();
  const chipText = [role, ...(cg.target_industries || [])].filter(Boolean).join(' ').trim() || role || 'your field';
  const chipKeywords = chipKeywordsFor(chipText);

  const passesGates = (p) => {
    if (!gatePersonReal(p)) return false;
    if (!checkOnChip(p.role_title, chipKeywords).ok) return false;
    return true;
  };

  const startSearch = async () => {
    onOptIn?.();
    setChoice('searching');
    try {
      const r = await base44.functions.invoke('findCliffPeople', {
        schoolName: school, schoolCode, companyName: company, targetRole: role,
        magic_moment: false, fast_only: true,
      });
      const conns = (r?.data?.connections || r?.connections || []).filter(passesGates).slice(0, 3);
      setPeople(conns);
    } catch {
      setPeople([]);
    }
    setChoice('done');
  };

  // Ask — success + Yes/No. Yes searches this company only; No dismisses.
  if (choice === 'ask') {
    return (
      <div style={{ marginTop: 14, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '16px 16px' }}>
        <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>
          Got it — we'll track this in Application History.
        </p>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#4c1d95', margin: '0 0 12px', lineHeight: 1.5 }}>
          You have a better chance of getting hired through someone you know. Want CLIFF to look for alumni or parents at {company}?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={startSearch} style={yesBtn}>Yes — look for people</button>
          <button onClick={() => setChoice('dismissed')} style={noBtn}>No</button>
        </div>
      </div>
    );
  }

  // No → quiet "find more opportunities" link back to the dashboard.
  if (choice === 'dismissed') {
    return (
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <button onClick={() => { window.location.hash = '#/FreeTierDashboard'; }} style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto' }}>
          Find more opportunities →
        </button>
      </div>
    );
  }

  // searching / done — people-only panel for THIS company.
  return (
    <div style={{ marginTop: 14, background: '#fff', border: '1px solid #e9d5ff', borderRadius: 12, padding: '16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Users size={16} color="#7c3aed" />
        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          People at {company}
        </span>
      </div>

      {choice === 'searching' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Loader2 size={16} color="#7c3aed" style={{ animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Looking for alumni at {company}…</p>
        </div>
      )}

      {choice === 'done' && people.length === 0 && (
        <p style={{ fontFamily: dm, fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
          None found yet — I'll keep looking. Check back soon.
        </p>
      )}

      {choice === 'done' && people.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {people.map((person, i) => (
            <PersonMini
              key={i}
              person={person}
              user={user}
              chipText={chipText}
              copied={copied === i}
              onCopy={() => { setCopied(i); setTimeout(() => setCopied(null), 2000); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonMini({ person, user, chipText, copied, onCopy }) {
  const linkedinUrl = person.linkedin_url || person.source_url || '';
  const [emailCopied, setEmailCopied] = useState(false);
  const draft = buildDraft(person, user, chipText);
  const copyEmail = () => {
    if (!person.email) return;
    try { navigator.clipboard?.writeText(person.email); } catch {}
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div style={{ background: '#f8f9fc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0, fontFamily: dm }}>
          {(person.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>{person.name}</p>
          {person.role_title && <p style={{ fontFamily: dm, fontSize: 11, color: '#6b7280', margin: '1px 0 0' }}>{person.role_title}{person.company ? ` · ${person.company}` : ''}</p>}
        </div>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ width: 28, height: 28, borderRadius: 6, background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, flexShrink: 0, minHeight: 'auto', minWidth: 'auto', textDecoration: 'none', fontFamily: dm }}>in</a>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#374151', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{draft}</p>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCopy} style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: copied ? '#059669' : '#7c3aed', background: copied ? '#d1fae5' : '#fff', border: '1px solid ' + (copied ? '#a7f3d0' : '#ddd6fe'), borderRadius: 999, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy message</>}
        </button>
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: '#0A66C2', border: 'none', borderRadius: 999, padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            <ExternalLink size={13} /> LinkedIn
          </a>
        )}
      </div>

      {person.email && (
        <button onClick={copyEmail} style={{ width: '100%', marginTop: 8, fontFamily: dm, fontSize: 12, fontWeight: 600, color: emailCopied ? '#059669' : '#6b7280', background: emailCopied ? '#d1fae5' : '#f8f9fc', border: '1px solid ' + (emailCopied ? '#a7f3d0' : '#e5e7eb'), borderRadius: 999, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          {emailCopied ? <><Check size={12} /> Email copied</> : <><Mail size={12} /> Copy email</>}
        </button>
      )}
    </div>
  );
}

function buildDraft(person, user, chipText) {
  const schoolShort = user?.school_code || user?.school || 'your school';
  const firstName = (person.name || '').split(' ')[0];
  const company = person.company || '';
  const field = chipText || 'this field';
  if (company) {
    return `Hi ${firstName} — ${schoolShort} student here. I just applied to a role at ${company} and saw you're a ${schoolShort} alum who landed there. Would you have 10 minutes to share what the path was like?`;
  }
  return `Hi ${firstName} — ${schoolShort} student looking at ${field}. Would you have 10 minutes to share how you got started?`;
}

const yesBtn = { flex: 1, fontFamily: dm, fontSize: 13, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 };
const noBtn = { fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 999, padding: '12px 16px', cursor: 'pointer', minHeight: 'auto' };
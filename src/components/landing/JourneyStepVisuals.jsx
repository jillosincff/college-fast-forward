import { Check, MapPin, Clock, Users, FileText, Send } from 'lucide-react';

const SF = "'Satoshi', 'Inter', system-ui, sans-serif";
const INDIGO = '#6d28d9';
const GRAD_INDIGO = 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)';
const TEXT = '#0f172a';
const TEXT2 = '#475569';
const TEXT3 = '#94a3b8';

const card = {
  background: '#fff', borderRadius: 16, border: '1px solid #ede9fe',
  boxShadow: '0 8px 32px rgba(109,40,217,0.10), 0 2px 6px rgba(0,0,0,0.04)',
  padding: 'clamp(16px, 4vw, 22px)', width: '100%', maxWidth: 340,
};

const chip = (bg, color, border) => ({
  display: 'inline-flex', alignItems: 'center', gap: 5, background: bg,
  border: `1px solid ${border}`, borderRadius: 100, padding: '5px 12px',
  fontFamily: SF, fontSize: 12, fontWeight: 700, color,
});

export function GoalsVisual() {
  return (
    <div style={card}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Your search profile</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span style={chip('rgba(109,40,217,0.08)', INDIGO, 'rgba(109,40,217,0.20)')}>Marketing</span>
        <span style={chip('rgba(6,182,212,0.08)', '#0891b2', 'rgba(6,182,212,0.22)')}><MapPin size={11} /> New York, NY</span>
        <span style={chip('rgba(236,72,153,0.08)', '#ec4899', 'rgba(236,72,153,0.22)')}>Internship</span>
      </div>
      <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: '12px 0 0', lineHeight: 1.5 }}>✓ Saved — your feed rebuilds around this overnight</p>
    </div>
  );
}

export function DailyDropVisual() {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Today's drop</p>
        <span style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulseGreen 2s infinite' }} /> LIVE
        </span>
      </div>
      {[{ c: 'Nike', r: 'Brand Marketing Intern', t: 'Posted 2d ago' }, { c: 'Spotify', r: 'Growth Marketing Intern', t: 'Posted 4d ago' }].map((j, i) => (
        <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
          <p style={{ fontFamily: SF, fontSize: 14, fontWeight: 800, color: TEXT, margin: 0 }}>{j.r}</p>
          <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            {j.c} · <Clock size={10} /> {j.t}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TailorVisual() {
  return (
    <div style={card}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={12} /> Resume match score</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: SF, fontSize: 26, fontWeight: 900, color: '#f43f5e', margin: 0, letterSpacing: '-0.03em' }}>61</p>
          <p style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: TEXT3, margin: 0 }}>BEFORE</p>
        </div>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, width: '92%', background: GRAD_INDIGO, borderRadius: 3 }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: SF, fontSize: 26, fontWeight: 900, color: INDIGO, margin: 0, letterSpacing: '-0.03em' }}>92</p>
          <p style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: TEXT3, margin: 0 }}>AFTER</p>
        </div>
      </div>
      <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: '12px 0 0', lineHeight: 1.5 }}>Rewritten for this exact posting — keywords, phrasing, ATS format</p>
    </div>
  );
}

export function WarmPathVisual() {
  return (
    <div style={card}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}><Users size={12} /> Warm paths at Nike</p>
      {[{ n: 'Sarah M.', d: 'UF \u201918 · Brand Manager' }, { n: 'David K.', d: 'CFF Parent · VP Marketing' }].map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: GRAD_INDIGO, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SF, fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{p.n[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: SF, fontSize: 13, fontWeight: 800, color: TEXT, margin: 0 }}>{p.n}</p>
            <p style={{ fontFamily: SF, fontSize: 11, color: TEXT2, margin: 0 }}>{p.d}</p>
          </div>
          <span style={chip('rgba(109,40,217,0.08)', INDIGO, 'rgba(109,40,217,0.20)')}><Send size={10} /> Draft ready</span>
        </div>
      ))}
    </div>
  );
}

export function TrackVisual() {
  const cols = [{ l: 'Applied', n: 4, c: '#6d28d9' }, { l: 'Replied', n: 2, c: '#0891b2' }, { l: 'Interview', n: 1, c: '#ec4899' }];
  return (
    <div style={card}>
      <p style={{ fontFamily: SF, fontSize: 11, fontWeight: 700, color: TEXT3, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Your pipeline</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {cols.map((c) => (
          <div key={c.l} style={{ background: `${c.c}0F`, border: `1px solid ${c.c}30`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
            <p style={{ fontFamily: SF, fontSize: 22, fontWeight: 900, color: c.c, margin: 0, letterSpacing: '-0.03em' }}>{c.n}</p>
            <p style={{ fontFamily: SF, fontSize: 10, fontWeight: 700, color: TEXT2, margin: '2px 0 0' }}>{c.l}</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: SF, fontSize: 12, color: TEXT2, margin: '12px 0 0', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Check size={12} color="#16a34a" /> Smart follow-up reminders — nothing slips
      </p>
    </div>
  );
}
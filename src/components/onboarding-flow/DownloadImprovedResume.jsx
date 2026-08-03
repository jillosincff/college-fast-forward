import { useState } from 'react';
import jsPDF from 'jspdf';
import { FONT, R, GREEN, GREEN_LIGHT, GREEN_BORDER, TEXT, TEXT2 } from './onboardingShared';

const str = (v) => (v && typeof v === 'object') ? (v.text || v.value || '') : (v || '');

// Turns the improved resume object into plain lines for the PDF.
function buildLines(r) {
  const out = [];
  if (str(r.name)) out.push(str(r.name).toUpperCase());
  const contact = [str(r.email), str(r.phone), str(r.location)].filter(Boolean).join(' | ');
  if (contact) out.push(contact);
  out.push('');
  if (r.education?.length) {
    out.push('EDUCATION');
    r.education.forEach(e => {
      out.push(`${str(e.school)}${e.dates ? ` (${str(e.dates)})` : ''}`);
      if (str(e.degree)) out.push(str(e.degree));
      out.push('');
    });
  }
  if (r.experience?.length) {
    out.push('EXPERIENCE');
    r.experience.forEach(ex => {
      out.push(`${str(ex.title)} — ${str(ex.company)}${ex.dates ? ` (${str(ex.dates)})` : ''}`);
      (ex.bullets || []).forEach(b => out.push(`• ${str(b)}`));
      out.push('');
    });
  }
  if (r.skills?.length) {
    out.push('SKILLS');
    out.push(r.skills.map(str).filter(Boolean).join(', '));
  }
  return out;
}

/**
 * The finished artifact, in their hands, before they pay for anything.
 * Downloads the CLIFF-improved resume as a real PDF with their name on it.
 */
export default function DownloadImprovedResume({ optimized, onDownloaded }) {
  const [busy, setBusy] = useState(false);
  if (!optimized) return null;

  const download = () => {
    setBusy(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 54;
      const width = doc.internal.pageSize.getWidth() - margin * 2;
      const bottom = doc.internal.pageSize.getHeight() - margin;
      let y = margin;

      buildLines(optimized).forEach((line, i) => {
        if (!line) { y += 8; return; }
        const isName = i === 0;
        const isHeader = /^[A-Z][A-Z\s&]+$/.test(line) && line.length < 40;
        doc.setFont('times', (isName || isHeader) ? 'bold' : 'normal');
        doc.setFontSize(isName ? 16 : isHeader ? 12 : 11);
        doc.splitTextToSize(line, width).forEach(wl => {
          if (y > bottom) { doc.addPage(); y = margin; }
          doc.text(wl, margin, y);
          y += isName ? 22 : 14;
        });
        if (isHeader) { doc.setLineWidth(0.5); doc.line(margin, y - 9, margin + width, y - 9); y += 4; }
      });

      const name = (str(optimized.name) || 'My').split(' ')[0];
      doc.save(`${name}_Resume_CLIFF.pdf`);
      if (onDownloaded) onDownloaded();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN_BORDER}`, borderRadius: R, padding: '20px 24px', marginBottom: 28, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 260px' }}>
        <p style={{ fontFamily: FONT, fontSize: 15, fontWeight: 800, color: TEXT, margin: '0 0 4px' }}>
          This one's yours. Take it.
        </p>
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT2, margin: 0, lineHeight: 1.6 }}>
          Your improved resume is finished and ready to download — no card, no catch.
        </p>
      </div>
      <button
        onClick={download}
        disabled={busy}
        style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#fff', background: GREEN, border: 'none', borderRadius: 10, padding: '14px 24px', cursor: 'pointer', minHeight: 'auto', boxShadow: '0 6px 18px rgba(16,185,129,0.3)', whiteSpace: 'nowrap' }}
      >
        {busy ? 'Preparing…' : '⬇ Download my resume'}
      </button>
    </div>
  );
}
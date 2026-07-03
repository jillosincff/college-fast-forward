import React, { useState } from 'react';
import { Download, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

export default function DownloadBar({ tailoredContent, acceptedCount, totalChanges, atsScore, companyName, jobTitle, tailoredResumeId, onStartOver }) {
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'letter' });
      const margin = 50;
      const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      doc.setFont('times', 'normal');
      doc.setFontSize(11);

      const lines = (tailoredContent || '').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        const isHeader = /^[A-Z][A-Z\s&]+$/.test(trimmed) && trimmed.length < 40 && trimmed.length > 2;

        if (isHeader) {
          y += 8;
          doc.setFont('times', 'bold');
          doc.setFontSize(12);
          doc.text(trimmed, margin, y);
          y += 2;
          doc.setLineWidth(0.5);
          doc.line(margin, y, margin + pageWidth, y);
          y += 14;
          doc.setFont('times', 'normal');
          doc.setFontSize(11);
        } else if (trimmed) {
          const wrapped = doc.splitTextToSize(trimmed, pageWidth);
          for (const wl of wrapped) {
            if (y > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(wl, margin, y);
            y += 14;
          }
        } else {
          y += 6;
        }
      }

      const fileName = [companyName, jobTitle, 'Resume'].filter(Boolean).join('_').replace(/\s+/g, '_') + '.pdf';
      doc.save(fileName);

      if (tailoredResumeId) {
        base44.entities.TailoredResume.update(tailoredResumeId, { downloaded_at: new Date().toISOString() }).catch(() => {});
      }
      toast.success('PDF downloaded!');
    } catch (e) {
      console.error('PDF generation failed:', e);
      toast.error('Download failed. Try copying the text instead.');
    }
    setDownloading(false);
  };

  const handleSaveToProfile = async () => {
    setSaving(true);
    try {
      const profiles = await base44.entities.FastTrackProProfile.filter({ user_email: (await base44.auth.me()).email });
      if (profiles[0]) {
        await base44.entities.FastTrackProProfile.update(profiles[0].id, {
          resume_text: tailoredContent.substring(0, 10000),
        });
        toast.success('Saved to your profile!');
      }
    } catch (e) {
      toast.error('Save failed');
    }
    setSaving(false);
  };

  return (
    <div style={{
      background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
      borderRadius: 14, padding: '20px 24px', marginTop: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div>
        <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 500, color: '#1a1a1a', margin: 0 }}>
          Ready to download
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#888', margin: 0 }}>
          {acceptedCount} of {totalChanges} changes accepted · Match score: {atsScore}%
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#fff',
            background: orange, border: 'none', borderRadius: 100,
            padding: '10px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            minHeight: 'auto', width: 'auto',
          }}
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating...' : 'Download PDF →'}
        </button>
        <button
          onClick={handleSaveToProfile}
          disabled={saving}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#666',
            background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
            borderRadius: 100, padding: '10px 20px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            minHeight: 'auto', width: 'auto',
          }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save to profile'}
        </button>
        <button
          onClick={onStartOver}
          style={{
            fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#aaa',
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
            minHeight: 'auto', width: 'auto',
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Start over
        </button>
      </div>
    </div>
  );
}
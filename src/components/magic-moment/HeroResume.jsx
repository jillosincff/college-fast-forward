import { Download, FileText, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FONT, TEXT, TEXT2, INDIGO, INDIGO_DIM, INDIGO_BORDER } from '@/components/onboarding-flow/onboardingShared';

const ghostBtn = (extra) => ({
  fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INDIGO_DIM, background: '#fff',
  border: `1.5px solid ${INDIGO_BORDER}`, borderRadius: 999, padding: '12px 18px', cursor: 'pointer', minHeight: 'auto',
  display: 'inline-flex', alignItems: 'center', gap: 8, ...extra,
});

export default function HeroResume({ tailored, onDownload }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '12px 14px', background: '#f8f6ff', borderRadius: 12, border: `1px solid ${INDIGO_BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <FileText size={15} color={INDIGO_DIM} />
        <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, color: INDIGO_DIM, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resume</span>
      </div>
      {tailored ? (
        <div>
          {tailored.originalScore != null && tailored.tailoredScore != null && (
            <p style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT2, margin: '0 0 8px' }}>
              Match improved from <strong style={{ color: TEXT }}>{tailored.originalScore}%</strong> to <strong style={{ color: INDIGO }}>{tailored.tailoredScore}%</strong>.
            </p>
          )}
          <button onClick={onDownload} style={ghostBtn({})}><Download size={14} /> Download tailored resume</button>
        </div>
      ) : (
        <div>
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: TEXT2, margin: '0 0 8px', lineHeight: 1.5 }}>
            Upload your resume and CLIFF will tailor it to this exact role.
          </p>
          <button onClick={() => navigate('/FreeTierDashboard')} style={ghostBtn({})}><Upload size={14} /> Upload resume</button>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { dmSans, ORANGE, BORDER, SURFACE, TEXT, MUTED, SUCCESS } from './theme';
import { requestAppStoreReview } from '@/lib/nativeReview';

const FALLBACK = (alumName) => {
  const first = (alumName || 'there').split(' ')[0];
  return `Hi ${first},\n\nI'm a student at our school and just came across your background — I'd love to ask you a couple of quick questions about your path. Open to a 15-minute call?\n\nThanks so much.`;
};

/**
 * Aha screen — shows the AI-drafted outreach message, lets the user edit
 * and "save" (creates an OutreachDraft row). On save, fires the native App
 * Store review prompt at the moment of peak excitement.
 */
export default function OutreachDraftPreview({ alum, schoolName, user, generateDraft, onSent, onSkip }) {
  const [draft, setDraft] = useState('');
  const [draftLoading, setDraftLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDraftLoading(true);
    Promise.race([
      generateDraft(alum),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ])
      .then((d) => { if (!cancelled) setDraft(d || FALLBACK(alum.full_name)); })
      .catch(() => { if (!cancelled) setDraft(FALLBACK(alum.full_name)); })
      .finally(() => { if (!cancelled) setDraftLoading(false); });
    return () => { cancelled = true; };
     
  }, [alum?.full_name]);

  const save = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try {
      await base44.entities.OutreachDraft.create({
        created_by: user?.email,
        recipient_name: alum.full_name,
        recipient_title: alum.headline,
        recipient_company: alum.company || '',
        recipient_linkedin_url: alum.linkedin_url || '',
        context: alum.cff_user_id ? 'cff_connection' : 'alumni_search',
        message: draft,
        status: 'draft',
      });
      setSaved(true);
      // Peak excitement → ask for an App Store review (native only).
      requestAppStoreReview().catch(() => {});
      setTimeout(() => onSent(alum), 800);
    } catch (e) {
      console.error('Saving draft failed:', e);
      // Still continue — we don't want to block the funnel.
      onSent(alum);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '32px 20px 40px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}
    >
      <p style={{
        fontFamily: dmSans, fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.16em',
        color: ORANGE, margin: '0 0 12px',
      }}>
        Your first outreach
      </p>
      <h1 style={{
        fontFamily: dmSans, fontSize: 22, fontWeight: 700,
        color: TEXT, lineHeight: 1.3, margin: '0 0 16px', letterSpacing: '-0.01em',
      }}>
        We drafted this to {alum.full_name?.split(' ')[0] || 'them'} for you.
      </h1>

      <div style={{
        background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
        padding: '14px 16px', marginBottom: 16,
      }}>
        <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 600, color: TEXT, margin: '0 0 4px' }}>
          {alum.full_name}
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, margin: 0 }}>
          {alum.headline?.split('·')[0]?.trim() || ''}{alum.company ? ` · ${alum.company}` : ''}
        </p>
        <p style={{ fontFamily: dmSans, fontSize: 11, color: SUCCESS, margin: '6px 0 0', fontWeight: 600 }}>
          🎓 {schoolName} alum
        </p>
      </div>

      {draftLoading ? (
        <div style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
          padding: 20, fontFamily: dmSans, fontSize: 14, fontStyle: 'italic',
          color: MUTED, minHeight: 140, display: 'flex', alignItems: 'center',
        }}>
          ✦ FastIQ is writing your message…
        </div>
      ) : (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          style={{
            width: '100%', background: SURFACE, border: `1px solid ${BORDER}`,
            borderRadius: 12, padding: 16, fontFamily: dmSans, fontSize: 14,
            lineHeight: 1.6, color: TEXT, resize: 'vertical', boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      )}

      <p style={{ fontFamily: dmSans, fontSize: 12, color: MUTED, margin: '12px 0 24px', lineHeight: 1.55 }}>
        Tweak it so it sounds like you. We'll save the draft to your dashboard so you can come back and send it after onboarding.
      </p>

      <button
        onClick={save}
        disabled={draftLoading || !draft.trim() || saving || saved}
        style={{
          width: '100%', padding: '15px 24px', borderRadius: 999, border: 'none',
          background: saved ? SUCCESS : (draftLoading || !draft.trim() || saving ? 'rgba(232,93,32,0.28)' : ORANGE),
          color: TEXT, fontFamily: dmSans, fontSize: 16, fontWeight: 600,
          cursor: draftLoading || !draft.trim() || saving || saved ? 'not-allowed' : 'pointer',
          minHeight: 'auto',
        }}
      >
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save my draft →'}
      </button>

      <button
        onClick={onSkip}
        style={{
          width: '100%', padding: '12px 24px', borderRadius: 999,
          background: 'none', border: 'none',
          color: MUTED, fontFamily: dmSans, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', marginTop: 12, minHeight: 'auto',
        }}
      >
        Skip for now
      </button>
    </motion.div>
  );
}

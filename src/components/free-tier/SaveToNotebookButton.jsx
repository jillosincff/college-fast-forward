import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';

const SOURCE_LABELS = {
  career_path_research: 'Career Path Research',
  career_goals: 'Career Goals',
  company_intel: 'Company Intel',
  career_concierge: 'Career Concierge',
  assessment: 'Career Assessment',
};

export default function SaveToNotebookButton({ content, sourcePage, userEmail, companyName, alreadySaved = false }) {
  const [saved, setSaved] = useState(alreadySaved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saved || saving || !userEmail) return;
    setSaved(true); // optimistic
    setSaving(true);
    try {
      await base44.entities.NotebookEntry.create({
        user_email: userEmail,
        content,
        source_page: sourcePage,
        source_label: SOURCE_LABELS[sourcePage] || sourcePage,
        tags: [sourcePage],
        saved_at: new Date().toISOString(),
        company_name: companyName || null,
      });
      // Show toast-like feedback
      const toast = document.createElement('div');
      toast.textContent = 'Saved to your FastIQ Notebook ⚡';
      toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1A1A1A;color:#fff;padding:10px 20px;border-radius:100px;font-size:13px;font-family:DM Sans,sans-serif;z-index:9999;pointer-events:none;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    } catch (e) {
      setSaved(false);
      console.error('Failed to save to notebook:', e);
    }
    setSaving(false);
  };

  return (
    <>
      <button
        onClick={handleSave}
        title={saved ? 'Saved to Notebook' : 'Save to FastIQ Notebook'}
        className={`save-insight-btn${saved ? ' saved' : ''}`}
        style={{
          background: 'none', border: 'none',
          cursor: saved ? 'default' : 'pointer',
          padding: '2px 4px', minHeight: 'auto',
          display: 'flex', alignItems: 'center', gap: 4,
          opacity: saved ? 1 : 0.4,
          color: saved ? '#E85D20' : '#888',
          transition: 'opacity 0.2s, color 0.2s',
          fontSize: 12, fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <span>🔖</span>
        <span className="save-label">{saved ? 'Saved' : 'Save'}</span>
      </button>
      <style>{`
        .save-insight-btn:hover { opacity: 1 !important; color: #E85D20 !important; }
        .save-insight-btn.saved { opacity: 1 !important; }
        @media (max-width: 768px) { .save-label { opacity: 0.6; display: inline !important; } }
      `}</style>
    </>
  );
}
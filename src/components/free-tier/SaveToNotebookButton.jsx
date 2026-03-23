import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
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
    <button
      onClick={handleSave}
      title={saved ? 'Saved to Notebook' : 'Save to FastIQ Notebook'}
      style={{
        background: 'none',
        border: 'none',
        cursor: saved ? 'default' : 'pointer',
        padding: '2px 4px',
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s',
        color: saved ? '#E85D20' : '#CCCCCC',
      }}
    >
      <Bookmark style={{ width: 13, height: 13, fill: saved ? '#E85D20' : 'none' }} />
    </button>
  );
}
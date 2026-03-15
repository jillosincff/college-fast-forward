import React, { useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const dmSans = "'DM Sans', system-ui, sans-serif";
const orange = '#E85D20';

const ACTIVITY_TYPES = [
  { value: 'outreach_sent', label: 'Outreach Sent' },
  { value: 'reply_received', label: 'Reply Received' },
  { value: 'conversation_had', label: 'Conversation Had' },
  { value: 'interview_scheduled', label: 'Interview Scheduled' },
  { value: 'interview_completed', label: 'Interview Completed' },
  { value: 'offer_received', label: 'Offer Received' },
  { value: 'resume_tailored', label: 'Resume Tailored' },
  { value: 'company_researched', label: 'Company Researched' },
  { value: 'follow_up_sent', label: 'Follow-Up Sent' },
];

export default function AddActivityModal({ userEmail, onClose, onAdded }) {
  const [type, setType] = useState('outreach_sent');
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [notes, setNotes] = useState('');
  const [needsFollowUp, setNeedsFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(7);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    const data = {
      student_email: userEmail,
      type,
      company_name: companyName.trim() || undefined,
      contact_name: contactName.trim() || undefined,
      notes: notes.trim() || undefined,
      fastiq_generated: false,
    };
    if (needsFollowUp) {
      data.follow_up_due_at = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000).toISOString();
      data.follow_up_complete = false;
    }
    const created = await base44.entities.ActivityLog.create(data);
    setSaving(false);
    onAdded(created);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      background: 'rgba(0,0,0,0.5)',
    }}
    onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: 24,
          maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: dmSans, fontSize: 16, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Log Activity</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', minHeight: 'auto', width: 'auto' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>Activity Type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {ACTIVITY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              style={{
                fontFamily: dmSans, fontSize: 12, fontWeight: type === t.value ? 500 : 400,
                color: type === t.value ? '#fff' : '#666',
                background: type === t.value ? orange : 'rgba(0,0,0,0.04)',
                border: 'none', borderRadius: 100, padding: '6px 12px',
                cursor: 'pointer', minHeight: 'auto', width: 'auto',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Who */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>Who / Company</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Contact name"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', fontFamily: dmSans, fontSize: 14, outline: 'none' }}
          />
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', fontFamily: dmSans, fontSize: 14, outline: 'none' }}
          />
        </div>

        {/* Notes */}
        <label style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 500, color: '#666', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details..."
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #ddd', fontFamily: dmSans, fontSize: 14, outline: 'none', resize: 'none', marginBottom: 16 }}
        />

        {/* Follow-up */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <label style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 400, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={needsFollowUp}
              onChange={(e) => setNeedsFollowUp(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Follow-up needed?
          </label>
          {needsFollowUp && (
            <select
              value={followUpDays}
              onChange={(e) => setFollowUpDays(Number(e.target.value))}
              style={{ fontFamily: dmSans, fontSize: 13, padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd' }}
            >
              <option value={2}>In 2 days</option>
              <option value={5}>In 5 days</option>
              <option value={7}>In 7 days</option>
              <option value={14}>In 14 days</option>
            </select>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 100, border: 'none',
            background: orange, color: '#fff', fontFamily: dmSans, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', minHeight: 44,
          }}
        >
          {saving ? 'Saving...' : 'Log this activity →'}
        </button>
      </div>
    </div>
  );
}
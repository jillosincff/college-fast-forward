import React, { useState } from 'react';
import { addPipelineEntry } from '@/functions/addPipelineEntry';

const pf = "'Playfair Display', serif";
const dm = "'DM Sans', sans-serif";

// Tracker status label → NetworkingPipeline status
const LABEL_TO_PIPELINE = {
  'Applied': 'identified',
  'In Review': 'reached_out',
  'Interviewing': 'interview',
  'Offer Received': 'offer',
  'Rejected': 'no_response',
};

export default function AddApplicationModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobLink: '',
    dateApplied: new Date().toISOString().split('T')[0],
    resumeVersion: 'v2.1',
    resumeOther: '',
    status: 'Applied',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtherResume, setShowOtherResume] = useState(false);

  const resumeOptions = [
    'v1.0 (Original)',
    'v2.1 (Updated Mar 10)',
    'v3.0 (Tailored for Tech Roles)',
    'Other',
  ];

  const statusOptions = ['Applied', 'In Review', 'Interviewing', 'Offer Received', 'Rejected'];

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.dateApplied) newErrors.dateApplied = 'Date applied is required';
    if (formData.resumeVersion === 'Other' && !formData.resumeOther.trim()) {
      newErrors.resumeOther = 'Please specify your resume version';
    }
    if (!formData.status) newErrors.status = 'Status is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const resumeVersion = formData.resumeVersion === 'Other' ? formData.resumeOther : formData.resumeVersion;

      // Persist to the user's pipeline so it survives refresh and shows in the tracker
      const noteParts = [formData.notes, `Resume submitted: ${resumeVersion}`].filter(Boolean);
      const res = await addPipelineEntry({
        company: formData.companyName,
        job_title: formData.jobTitle,
        job_url: formData.jobLink || '',
        application_path: 'cold_apply',
        status: LABEL_TO_PIPELINE[formData.status] || 'identified',
        notes: noteParts.join('\n'),
      });
      const savedId = res?.data?.record?.id || res?.record?.id || `app-${Date.now()}`;

      const statusKey = { 'Applied': 'applied', 'In Review': 'in_review', 'Interviewing': 'interviewing', 'Offer Received': 'offered', 'Rejected': 'rejected' }[formData.status] || 'applied';
      const newApp = {
        id: savedId,
        company: formData.companyName,
        logo: (formData.companyName?.[0] || '?').toUpperCase(),
        jobTitle: formData.jobTitle,
        jobLink: formData.jobLink || null,
        dateApplied: formData.dateApplied,
        resumeVersion,
        status: statusKey,
        notes: formData.notes,
        nextAction: formData.status === 'Interviewing' ? 'Prepare for Interview' : '—',
      };

      onSuccess(newApp);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        borderRadius: 8px;
        fontSize: 14px;
        fontFamily: ${dm};
        zIndex: 9999;
        boxShadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      toast.textContent = '✓ Application added successfully!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, 3000);

      // Reset and close
      setFormData({
        companyName: '',
        jobTitle: '',
        jobLink: '',
        dateApplied: new Date().toISOString().split('T')[0],
        resumeVersion: 'v2.1',
        resumeOther: '',
        status: 'Applied',
        notes: '',
      });
      setShowOtherResume(false);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleResume = (val) => {
    setFormData({ ...formData, resumeVersion: val });
    setShowOtherResume(val === 'Other');
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
        .modal-backdrop {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: 16,
          width: 'min(90vw, 500px)',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 1001,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid #E5E5E5' }}>
          <h2 style={{ fontFamily: pf, fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
            Add New Application
          </h2>
          <p style={{ fontFamily: dm, fontSize: 13, color: '#888', margin: 0 }}>
            Keep your tracker up to date
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Company Name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Company Name <span style={{ color: '#E85D20' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Google, Apple, Stripe"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.companyName ? '#ef4444' : '#ddd'}`,
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.companyName && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.companyName}</p>}
          </div>

          {/* Job Title */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Job Title <span style={{ color: '#E85D20' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Software Engineer, Product Manager"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.jobTitle ? '#ef4444' : '#ddd'}`,
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.jobTitle && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.jobTitle}</p>}
          </div>

          {/* Job Link */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Job Posting Link
            </label>
            <input
              type="url"
              placeholder="Paste the link to the job posting (optional)"
              value={formData.jobLink}
              onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Date Applied */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Date Applied <span style={{ color: '#E85D20' }}>*</span>
            </label>
            <input
              type="date"
              value={formData.dateApplied}
              onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.dateApplied ? '#ef4444' : '#ddd'}`,
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {errors.dateApplied && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.dateApplied}</p>}
          </div>

          {/* Resume Version */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Resume Version Used <span style={{ color: '#E85D20' }}>*</span>
            </label>
            <select
              value={formData.resumeVersion}
              onChange={(e) => handleResume(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.resumeVersion ? '#ef4444' : '#ddd'}`,
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            >
              {resumeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.resumeVersion && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.resumeVersion}</p>}

            {showOtherResume && (
              <input
                type="text"
                placeholder="e.g., v4.2 Custom"
                value={formData.resumeOther}
                onChange={(e) => setFormData({ ...formData, resumeOther: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.resumeOther ? '#ef4444' : '#ddd'}`,
                  borderRadius: 8,
                  fontFamily: dm,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  marginTop: 8,
                }}
              />
            )}
            {errors.resumeOther && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.resumeOther}</p>}
          </div>

          {/* Status */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Status <span style={{ color: '#E85D20' }}>*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${errors.status ? '#ef4444' : '#ddd'}`,
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.status && <p style={{ fontSize: 12, color: '#ef4444', margin: '4px 0 0' }}>{errors.status}</p>}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6, fontFamily: dm }}>
              Notes
            </label>
            <textarea
              placeholder="Any extra details — salary expectations, referral, interview date, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                boxSizing: 'border-box',
                minHeight: 80,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Pro Tip */}
          <p style={{ fontSize: 12, color: '#888', margin: '0 0 24px', fontFamily: dm, fontStyle: 'italic' }}>
            💡 Pro tip: Connect your email to automatically add future applications.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                background: '#fff',
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                fontWeight: 600,
                color: '#1A1A1A',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.target.style.background = '#f5f5f5')}
              onMouseOut={(e) => (e.target.style.background = '#fff')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#E85D20',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontFamily: dm,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => !loading && (e.target.style.background = '#d44e14')}
              onMouseOut={(e) => !loading && (e.target.style.background = '#E85D20')}
            >
              {loading ? 'Adding...' : 'Add to Tracker'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
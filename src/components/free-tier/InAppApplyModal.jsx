import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { addPipelineEntry } from '@/functions/addPipelineEntry';

export default function InAppApplyModal({ lead, user, onClose, onSuccess }) {
  const [note, setNote] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let resumeUrl = null;

      // Upload resume if provided
      if (resumeFile) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: resumeFile });
        resumeUrl = file_url;
        setUploading(false);
      }

      // Create pipeline entry
      await addPipelineEntry({
        company: companyName,
        job_title: jobTitle,
        job_description: lead.jobDescription || lead.description || '',
        job_url: lead.job_url || lead.jobSource || '',
        application_path: 'cold_apply',
        status: 'identified',
        location: lead.location || '',
        notes: note || null,
      });

      // Also store the application details in OpportunityApplication if we have an opportunity_id
      // For daily drop leads, we just use the pipeline entry as the source of truth

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100">
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">Application Submitted!</h3>
            <p className="text-sm text-gray-500 mb-2">
              Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> has been tracked in your CFF pipeline.
            </p>
            <p className="text-xs text-gray-400 mb-6">We'll help you follow up at the right time.</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition cursor-pointer"
              style={{ minHeight: 'auto' }}
            >
              View My Pipeline →
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">Apply via College Fast Forward</h3>
                <p className="text-xs text-gray-500 mt-0.5">{jobTitle} · {companyName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 cursor-pointer"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
              >✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Applicant info (pre-filled, read-only) */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                  {user?.full_name?.[0] || '?'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{user?.full_name}</p>
                  <p className="text-[11px] text-gray-500">{user?.email}</p>
                </div>
              </div>

              {/* Cover note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Why are you a great fit? <span className="text-gray-400 font-normal">(optional but recommended)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. I'm a Marketing major at UF with 2 internships in brand strategy..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Attach Resume <span className="text-gray-400 font-normal">(PDF, optional)</span></label>
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-purple-300 rounded-xl p-3 cursor-pointer transition-colors group">
                  <span className="text-xl">📄</span>
                  <span className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                    {resumeFile ? resumeFile.name : 'Click to upload your resume (PDF)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition cursor-pointer disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', minHeight: 'auto' }}
              >
                {uploading ? 'Uploading resume…' : submitting ? 'Submitting…' : '⚡ Submit Application via CFF'}
              </button>

              <p className="text-[10px] text-center text-gray-400">
                Your application will be tracked in your CFF pipeline and our team may share it with the company's recruiting contacts.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
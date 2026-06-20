import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { addPipelineEntry } from '@/functions/addPipelineEntry';

export default function InAppApplyModal({ lead, user, onClose, onSuccess }) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Resume state
  const [activeResume, setActiveResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeChoice, setResumeChoice] = useState(null); // 'tailor' | 'submit_current'
  const [resumeFile, setResumeFile] = useState(null); // fallback upload

  const companyName = lead.company || lead.companyName || '';
  const jobTitle = lead.job_title || lead.role || '';

  // Load active resume on mount
  useEffect(() => {
    const load = async () => {
      try {
        const resumes = await base44.entities.Resume.filter({ student_email: user?.email });
        const active = resumes.find(r => r.is_active) || resumes[0] || null;
        setActiveResume(active);
      } catch {
        setActiveResume(null);
      } finally {
        setResumeLoading(false);
      }
    };
    if (user?.email) load();
    else setResumeLoading(false);
  }, [user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // If tailoring — redirect to ResumeTailoring with context
      if (resumeChoice === 'tailor') {
        const params = new URLSearchParams({
          company: companyName,
          role: jobTitle,
          jd: lead.jobDescription || lead.description || '',
          from: 'apply_modal',
        });
        onClose();
        window.location.hash = `#ResumeTailoring?${params.toString()}`;
        return;
      }

      // Upload resume if manually provided
      if (resumeFile) {
        await base44.integrations.Core.UploadFile({ file: resumeFile });
      }

      const resumeLabel = resumeChoice === 'submit_current' && activeResume
        ? (activeResume.name || activeResume.original_file_name || 'Current Resume')
        : resumeFile?.name || null;

      await addPipelineEntry({
        company: companyName,
        job_title: jobTitle,
        job_description: lead.jobDescription || lead.description || '',
        job_url: lead.job_url || lead.jobSource || '',
        application_path: 'cold_apply',
        status: 'identified',
        location: lead.location || '',
        notes: [note, resumeLabel ? `Resume submitted: ${resumeLabel}` : null].filter(Boolean).join('\n') || null,
      });

      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasResume = !!activeResume;
  const resumeName = activeResume?.name || activeResume?.original_file_name || 'Your Resume';

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
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Applicant info */}
              {(user?.full_name || user?.email) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-700">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    {user?.full_name && <p className="text-xs font-semibold text-gray-800">{user.full_name}</p>}
                    {user?.email && <p className="text-[11px] text-gray-500">{user.email}</p>}
                  </div>
                </div>
              )}

              {/* Resume Recommendation Block */}
              {resumeLoading ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ) : hasResume ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📄</span>
                    <div>
                      <p className="text-xs font-bold text-amber-900">We found your resume: <span className="text-purple-700">{resumeName}</span></p>
                      <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        To maximize your chances at <strong>{companyName}</strong>, we recommend tailoring it to match this role's keywords. Would you like to tailor it first?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setResumeChoice('tailor')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        resumeChoice === 'tailor'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                      }`}
                      style={{ minHeight: 'auto' }}
                    >
                      ✨ Yes, tailor it first
                    </button>
                    <button
                      type="button"
                      onClick={() => setResumeChoice('submit_current')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        resumeChoice === 'submit_current'
                          ? 'bg-gray-800 text-white border-gray-800 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ minHeight: 'auto' }}
                    >
                      📤 No, submit current
                    </button>
                  </div>
                  {resumeChoice === 'submit_current' && (
                    <p className="text-[10px] text-amber-700 bg-amber-100 rounded-lg px-2 py-1.5">
                      ✓ We'll attach <strong>{resumeName}</strong> to your application.
                    </p>
                  )}
                  {resumeChoice === 'tailor' && (
                    <p className="text-[10px] text-purple-700 bg-purple-50 rounded-lg px-2 py-1.5">
                      ✓ You'll be taken to Resume Tailoring — come back to submit once done!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-800">No resume on file yet</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">Upload your resume below, or{' '}
                      <button type="button" onClick={() => { onClose(); window.location.hash = '#ResumeTailoring'; }} className="underline font-semibold cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>
                        tailor one for this role →
                      </button>
                    </p>
                  </div>
                  <label className="flex items-center gap-3 border-2 border-dashed border-gray-200 hover:border-purple-300 rounded-xl p-3 cursor-pointer transition-colors group">
                    <span className="text-xl">📄</span>
                    <span className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                      {resumeFile ? resumeFile.name : 'Click to upload your resume (PDF)'}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setResumeFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              )}

              {/* Cover note */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Why are you a great fit? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. I'm a Marketing major at UF with 2 internships in brand strategy..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              {(!hasResume || resumeChoice === 'submit_current' || resumeChoice === 'tailor') && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition cursor-pointer disabled:opacity-60"
                  style={{ background: resumeChoice === 'tailor' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg, #1e293b, #334155)', minHeight: 'auto' }}
                >
                  {submitting ? 'Submitting…' : resumeChoice === 'tailor' ? '✨ Go to Resume Tailoring →' : '⚡ Submit Application via CFF'}
                </button>
              )}

              {hasResume && !resumeChoice && (
                <p className="text-[11px] text-center text-gray-400">Choose a resume option above to continue.</p>
              )}

              <p className="text-[10px] text-center text-gray-400">
                Your application will be tracked in your CFF pipeline.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
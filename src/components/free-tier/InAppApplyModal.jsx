import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { addPipelineEntry } from '@/functions/addPipelineEntry';
import { findParentsAtCompany } from '@/functions/findParentsAtCompany';

export default function InAppApplyModal({ lead, user, onClose, onSuccess, schoolAbbr, standoutTip, startAtResume = false }) {
  const [step, setStep] = useState(startAtResume ? 'resume' : 'network'); // 'network' | 'resume' | 'submit'
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
  // Normalized real application URL — checked across every lead shape we ingest
  const jobUrl = lead.job_url || lead.jobSource || lead.url || '';
  
  // Network data
  const hasAlumni = lead.alumniCount > 0;

  // Live parent lookup (student's OWN school only) — runs on apply.
  const [parents, setParents] = useState([]);
  const [parentsLoading, setParentsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    findParentsAtCompany({ companyName })
      .then((res) => {
        const data = res?.data || res;
        if (!cancelled && data?.parents?.length) setParents(data.parents);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setParentsLoading(false); });
    return () => { cancelled = true; };
  }, [companyName]);

  const hasParent = parents.length > 0;
  const networkCount = (lead.alumniCount || 0) + parents.length;
  const alumniName = lead.alumni_name || lead.alumnus?.name || '';
  const alumniRole = lead.alumni_role || lead.alumnus?.title || '';
  const alumniEmail = lead.alumni_email || lead.alumnus?.email || '';
  const alumniLinkedin = lead.alumni_linkedin || lead.alumnus?.linkedinUrl || '';

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

  // Redirect straight to ResumeTailoring with this job's context
  const goToTailoring = () => {
    const params = new URLSearchParams({
      company: companyName,
      role: jobTitle,
      // Only pass a real job description — lead.description/hiring_description is
      // a company-level blurb that would contaminate the tailoring prompt.
      jd: lead.jobDescription || lead.job_description || '',
      job_url: lead.job_url || lead.jobSource || lead.url || '',
      location: lead.location || '',
      from: 'apply_modal',
    });
    onClose();
    window.location.hash = `#/ResumeTailoring?${params.toString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Upload resume if manually provided
      if (resumeFile) {
        await base44.integrations.Core.UploadFile({ file: resumeFile });
      }

      const resumeLabel = resumeChoice === 'submit_current' && activeResume
        ? (activeResume.name || activeResume.original_file_name || 'Current Resume')
        : resumeFile?.name || null;

      const res = await addPipelineEntry({
        company: companyName,
        job_title: jobTitle,
        job_description: lead.jobDescription || lead.description || '',
        job_url: jobUrl,
        application_path: 'cold_apply',
        status: 'applied',
        status_date: new Date().toISOString(),
        location: lead.location || '',
        notes: [note, resumeLabel ? `Resume submitted: ${resumeLabel}` : null].filter(Boolean).join('\n') || null,
      });

      const result = res?.data || res;
      if (result?.error) {
        throw new Error(result.message || 'Could not save to your tracker. Please try again.');
      }

      setSubmitted(true);
      // Notify the tracker to refresh so the new application shows immediately
      window.dispatchEvent(new CustomEvent('cff:pipeline-changed'));
      onSuccess?.();
    } catch (err) {
      // Surface the backend's friendly message (e.g. free pipeline limit) instead of a raw HTTP error
      setError(err?.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasResume = !!activeResume;
  const resumeName = activeResume?.name || activeResume?.original_file_name || 'Your Resume';

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto overscroll-contain">
        {submitted ? (
          <div className="p-8">
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Application Submitted!</h3>
              <p className="text-sm text-gray-500 mb-2">
                Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> was submitted through CFF and added to your Application Tracker.
              </p>
            </div>

            {/* CLIFF Standout Tip — moved here as the grand finale */}
            {standoutTip && (
              <div className="mt-5 rounded-xl p-4 text-left" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #fbbf24' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide" style={{ color: '#92400e', margin: 0 }}>
                    Your CLIFF Standout Tip
                  </h4>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: '#78350f', margin: 0 }}>
                  {standoutTip}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <button
                onClick={() => { onClose(); window.location.hash = '#/ApplicationTracker'; }}
                className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition cursor-pointer text-center"
                style={{ minHeight: 'auto' }}
              >
                📋 View in Application Tracker
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border border-gray-300 transition cursor-pointer"
                style={{ minHeight: 'auto' }}
              >
                Keep Browsing Jobs
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  {step === 'network' ? '🔥 Maximize Your Hiring Chance' : 'Apply via College Fast Forward'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{jobTitle} · {companyName}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>✕</button>
            </div>

            {/* Network Interstitial - Step 1 */}
            {step === 'network' && (hasAlumni || hasParent) ? (
              <div className="p-5 space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="text-sm font-bold text-purple-900">Maximize Your Hiring Chance at {companyName}!</p>
                      <p className="text-xs text-purple-700 mt-1">
                        We found <strong>{networkCount} warm connection{networkCount > 1 ? 's' : ''}</strong> who can champion your application.
                      </p>
                    </div>
                  </div>
                  
                  {hasAlumni && alumniName && (
                    <div className="bg-white border border-purple-100 rounded-xl p-3 mb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg">🎓</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-purple-800">{alumniName}</p>
                          {alumniRole && <p className="text-[11px] text-purple-700 mt-0.5">{alumniRole}</p>}
                        </div>
                      </div>
                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        {schoolAbbr || 'Fellow'} {alumniName.split(' ')[0]} is a {alumniRole || 'professional'} at {companyName} and has opted in to champion students on our platform.
                      </p>
                    </div>
                  )}
                  
                  {hasAlumni && !alumniName && (
                    <div className="bg-white border border-purple-100 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎓</span>
                        <p className="text-xs font-bold text-purple-800">{lead.alumniCount} {lead.alumniCount === 1 ? 'Alumni' : 'Alumni'} Working Here</p>
                      </div>
                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        {schoolAbbr || 'Fellow'} graduates at {companyName} are 3x more likely to respond to outreach. CLiFF can help you find the right contact.
                      </p>
                    </div>
                  )}
                  
                  {hasParent && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏡</span>
                        <p className="text-xs font-bold text-purple-800">
                          {parents.length} {schoolAbbr || ''} {parents.length === 1 ? 'Parent' : 'Parents'} in Your Network Here
                        </p>
                      </div>
                      {parents.map((p, i) => (
                        <div key={i} className="bg-white border border-purple-100 rounded-xl p-3 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[11px] font-bold text-purple-700 flex-shrink-0">
                            {p.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-purple-900 truncate">{p.name}</p>
                            {p.role_title && <p className="text-[11px] text-purple-600 truncate">{p.role_title}</p>}
                          </div>
                          {p.linkedin_url && (
                            <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-[#0077b5] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ minHeight: 'auto', minWidth: 'auto' }}>in</a>
                          )}
                        </div>
                      ))}
                      <p className="text-[11px] text-purple-700 leading-relaxed">
                        These parents of fellow {schoolAbbr || ''} students have opted in to champion applicants — a warm intro goes a long way.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setStep('resume')}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-purple-200"
                      style={{ minHeight: 'auto' }}
                    >
                      💬 Let CLIFF Draft a Warm Intro (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep('resume')}
                      className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm border border-gray-300 transition cursor-pointer"
                      style={{ minHeight: 'auto' }}
                    >
                      📄 Skip Networking, Optimize Resume First
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-center text-gray-400">Students who network are 5x more likely to land interviews.</p>
              </div>
            ) : step === 'network' && parentsLoading ? (
              <div className="p-5">
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
                  <span className="inline-block w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-2" />
                  <p className="text-xs font-bold text-purple-900">Checking your network at {companyName}…</p>
                </div>
              </div>
            ) : step === 'network' ? (
              <div className="p-5" onClick={() => setStep('resume')}>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center cursor-pointer hover:bg-blue-100 transition">
                  <span className="text-3xl mb-2 block">🚀</span>
                  <p className="text-sm font-bold text-blue-900 mb-1">No Warm Connections Found</p>
                  <p className="text-xs text-blue-700">Let's make your application stand out with a tailored resume.</p>
                  <p className="text-[10px] text-blue-500 mt-3">Click to continue →</p>
                </div>
              </div>
            ) : (
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
                      onClick={goToTailoring}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
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

                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-blue-800">No resume on file yet</p>
                    <p className="text-[11px] text-blue-700 mt-0.5">Upload your resume below, or{' '}
                      <button type="button" onClick={() => { onClose(); window.location.hash = '#/ResumeTailoring'; }} className="underline font-semibold cursor-pointer" style={{ minHeight: 'auto', minWidth: 'auto' }}>
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

              {(!hasResume || resumeChoice === 'submit_current') && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition cursor-pointer disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', minHeight: 'auto' }}
                >
                  {submitting ? 'Submitting…' : '⚡ Submit Application via CFF'}
                </button>
              )}

              {hasResume && !resumeChoice && (
                <p className="text-[11px] text-center text-gray-400">Choose a resume option above to continue.</p>
              )}

              <p className="text-[10px] text-center text-gray-400">
                Your application will be tracked in your CFF pipeline.
              </p>
            </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
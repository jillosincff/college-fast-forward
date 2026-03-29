import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { tailorResume } from '@/functions/tailorResume';
import JobDescriptionStep from '@/components/resume-tailor/JobDescriptionStep';
import TailoringLoader from '@/components/resume-tailor/TailoringLoader';
import TailoringResults from '@/components/resume-tailor/TailoringResults';

export default function ResumeTailoring({ onOpenUpgrade }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [phase, setPhase] = useState('entry');
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  useEffect(() => {
    if (!user) return;
    if (user.resume_url) setPhase('uploaded');

    // Load existing resume text
    base44.entities.Resume.filter({ student_email: user.email, is_active: true }, '-created_date', 1)
      .then(resumes => {
        if (resumes[0]) {
          setResumeText(resumes[0].parsed_text || '');
          setFileName(resumes[0].original_file_name || 'Resume on file');
          setResumeId(resumes[0].id);
        }
      }).catch(() => {});
  }, [user?.email]);

  const uploadResume = async (file) => {
    setFileName(file.name);
    setPhase('uploading');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ resume_url: file_url });
      setPhase('uploaded');
    } catch (e) {
      console.error('Upload failed:', e);
      setPhase('entry');
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadResume(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadResume(file);
  };

  const handleTailor = async () => {
    if (!resumeText || !jobDescription.trim()) return;
    setPhase('tailoring');
    setError(null);
    try {
      const res = await tailorResume({
        resumeText,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
        sourceResumeId: resumeId || '',
      });
      if (res.data?.success) {
        setResult(res.data);
        setPhase('results');
      } else {
        setError(res.data?.error || 'Tailoring failed. Please try again.');
        setPhase('tailor');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setPhase('tailor');
    }
  };

  if (!user) return null;

  // PHASE: tailoring loader
  if (phase === 'tailoring') return <TailoringLoader />;

  // PHASE: results
  if (phase === 'results' && result) {
    return (
      <TailoringResults
        result={result}
        companyName={companyName}
        jobTitle={jobTitle}
        originalResumeText={resumeText}
        onStartOver={() => { setResult(null); setPhase('uploaded'); }}
        userEmail={user.email}
      />
    );
  }

  // PHASE: tailor
  if (phase === 'tailor') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <button
          onClick={() => setPhase('uploaded')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 24, padding: 0, minHeight: 'auto' }}
        >
          ← Back
        </button>
        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}
        <JobDescriptionStep
          companyName={companyName}
          jobTitle={jobTitle}
          jobDescription={jobDescription}
          resumeText={resumeText}
          onCompanyChange={setCompanyName}
          onJobTitleChange={setJobTitle}
          onJobDescriptionChange={setJobDescription}
          onTailor={handleTailor}
        />
      </div>
    );
  }

  // PHASE: uploading
  if (phase === 'uploading') {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          border: '4px solid #F0F0F0',
          borderTop: '4px solid #E85D20',
          margin: '0 auto 24px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Reading your resume...
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
          FastIQ is analyzing your experience and skills.
        </p>
      </div>
    );
  }

  // PHASE: uploaded
  if (phase === 'uploaded') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>RESUME</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Got it. Here's what we found.
          </h1>
        </div>

        {/* Resume card */}
        <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
              {fileName || 'Your Resume'}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#22C55E', margin: 0, fontWeight: 600 }}>
              ✓ Uploaded successfully
            </p>
          </div>
          <button
            onClick={() => setPhase('entry')}
            style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '7px 14px', fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
          >
            Replace
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            onClick={() => isFastIQ ? setPhase('tailor') : onOpenUpgrade?.()}
            style={{ background: isFastIQ ? '#0A0A0A' : '#FAFAFA', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, border: isFastIQ ? 'none' : '1px solid #E0E0E0' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: isFastIQ ? 'rgba(232,93,32,0.2)' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎯</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: isFastIQ ? '#fff' : '#1A1A1A', margin: 0 }}>Tailor to a job description</p>
                {!isFastIQ && <span style={{ background: '#FFF5F0', color: '#E85D20', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>FASTIQ</span>}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: isFastIQ ? 'rgba(255,255,255,0.5)' : '#888', margin: 0 }}>
                Paste a job description and FastIQ rewrites your resume to match it
              </p>
            </div>
            <span style={{ color: isFastIQ ? '#E85D20' : '#CCCCCC', fontSize: 18, flexShrink: 0 }}>→</span>
          </div>

          <div
            onClick={() => isFastIQ ? setPhase('review') : onOpenUpgrade?.()}
            style={{ background: '#fff', border: '1px solid #E0E0E0', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⭐</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Get a resume score & feedback</p>
                {!isFastIQ && <span style={{ background: '#FFF5F0', color: '#E85D20', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.05em' }}>FASTIQ</span>}
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>
                FastIQ scores your resume and tells you exactly what to improve
              </p>
            </div>
            <span style={{ color: '#CCCCCC', fontSize: 18, flexShrink: 0 }}>→</span>
          </div>
        </div>

        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F0F0F0' }}>
          <button
            onClick={() => navigate('FreeTierDashboard')}
            style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}
          >
            Next: Find Alumni at Target Companies →
          </button>
        </div>
      </div>
    );
  }

  // PHASE: entry (default)
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>RESUME</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px', lineHeight: 1.2 }}>
          Your resume is your first impression.
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: 0, lineHeight: 1.6 }}>
          Let's make it count. Do you have one already?
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Path A — Upload */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ background: '#fff', border: '2px dashed #E85D20', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>📄</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Yes, I have one</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>
            Upload your resume and FastIQ will review it, score it, and help you tailor it to any job.
          </p>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', fontWeight: 600 }}>Drop PDF or Word doc here or click to upload →</span>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>

        {/* Path B — Build */}
        <div
          onClick={() => isFastIQ ? setPhase('builder') : onOpenUpgrade?.()}
          style={{ background: isFastIQ ? '#fff' : '#FAFAFA', border: '1px solid #E0E0E0', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          {!isFastIQ && (
            <div style={{ position: 'absolute', top: 12, right: 12, background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.08em' }}>FASTIQ</div>
          )}
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✨</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Help me build one</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>
            Answer a few questions about your experience and FastIQ will build a professional resume for you.
          </p>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: isFastIQ ? '#E85D20' : '#AAAAAA', fontWeight: 600 }}>
            {isFastIQ ? 'Build my resume →' : 'Unlock with FastIQ →'}
          </span>
        </div>
      </div>

      <p
        onClick={() => navigate('FreeTierDashboard')}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', cursor: 'pointer', textAlign: 'center', margin: 0 }}
      >
        Skip for now — go to dashboard →
      </p>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { tailorResume } from '@/functions/tailorResume';

import ResumeUploadStep from '@/components/resume-tailor/ResumeUploadStep';
import JobDescriptionStep from '@/components/resume-tailor/JobDescriptionStep';
import TailoringLoader from '@/components/resume-tailor/TailoringLoader';
import TailoringResults from '@/components/resume-tailor/TailoringResults';

const dmSans = "'DM Sans', system-ui, sans-serif";
const playfair = "'Playfair Display', Georgia, serif";

export default function ResumeTailoring() {
  const { user } = useAuth();
  const [step, setStep] = useState('input');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    if (params.get('company')) setCompanyName(params.get('company'));
    if (params.get('role')) setJobTitle(params.get('role'));
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.Resume.filter({ student_email: user.email, is_active: true }, '-created_date', 1)
      .then(resumes => {
        if (resumes[0]) {
          setExistingResume(resumes[0]);
          setResumeText(resumes[0].parsed_text || '');
          setResumeFileName(resumes[0].original_file_name || 'Resume on file');
          setResumeId(resumes[0].id);
        }
      }).catch(() => {});
    base44.entities.FastTrackProProfile.filter({ user_email: user.email })
      .then(profiles => {
        if (profiles[0]?.resume_text && !resumeText) {
          setResumeText(profiles[0].resume_text);
          setResumeFileName('Resume from profile');
        }
      }).catch(() => {});
  }, [user?.email]);

  const handleResumeReady = (text, fileName, id) => {
    setResumeText(text);
    setResumeFileName(fileName);
    if (id) setResumeId(id);
  };

  const handleTailor = async () => {
    if (!resumeText || !jobDescription.trim()) return;
    setStep('loading');
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
        setStep('results');
      } else {
        setError(res.data?.error || 'Tailoring failed. Please try again.');
        setStep('input');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
      setStep('input');
    }
  };

  const handleStartOver = () => {
    setStep('input');
    setResult(null);
    setJobDescription('');
    setJobTitle('');
    setCompanyName('');
  };

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');

  if (user === undefined) return null;
  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
      <p style={{ fontFamily: dmSans, color: '#888' }}>Sign in to tailor your resume</p>
    </div>
  );

  if (step === 'loading') return <TailoringLoader />;

  if (step === 'results' && result) {
    return (
      <TailoringResults
        result={result}
        companyName={companyName}
        jobTitle={jobTitle}
        originalResumeText={resumeText}
        onStartOver={handleStartOver}
        userEmail={user.email}
      />
    );
  }

  return (
    <div style={{ fontFamily: dmSans, background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <h1 style={{ fontFamily: playfair, fontWeight: 700, fontSize: 28, color: '#1a1a1a', margin: 0, letterSpacing: '-0.02em' }}>
          Resume <em style={{ fontFamily: playfair, fontWeight: 400, fontStyle: 'italic', color: '#E85D20' }}>Tailoring</em>
        </h1>
        <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#888', marginTop: 4, marginBottom: 28 }}>
          Paste a job description and FastIQ will tailor your resume to match it — explaining every change.
        </p>

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Step 1 — Resume upload (free) */}
        <ResumeUploadStep
          existingResume={existingResume}
          resumeText={resumeText}
          resumeFileName={resumeFileName}
          userEmail={user.email}
          onResumeReady={handleResumeReady}
        />

        {/* Step 2 — FastIQ gate */}
        {resumeText && !isFastIQ && (
          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 12, padding: '24px', textAlign: 'center', marginTop: 8 }}>
            <p style={{ fontFamily: dmSans, fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px' }}>Resume tailoring is a FastIQ feature</p>
            <p style={{ fontFamily: dmSans, fontSize: 13, color: '#555', margin: '0 0 16px', lineHeight: 1.5 }}>Upload is free. Tailoring to a job description, AI scoring, and downloading the optimized version require FastIQ.</p>
            <a href="#FreeTierDashboard" style={{ display: 'inline-block', background: '#E85D20', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none' }}>Unlock FastIQ →</a>
          </div>
        )}

        {/* Step 2 — Job description (FastIQ users) */}
        {resumeText && isFastIQ && (
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
        )}
      </div>
    </div>
  );
}
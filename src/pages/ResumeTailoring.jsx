import React, { useState, useEffect, useRef } from 'react';
import FastIQUpgradeModal from '@/components/free-tier/FastIQUpgradeModal';
import { maybeActivateTrial } from '@/utils/trialActivation';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { navigate } from '@/components/utils/navigation';
import { tailorResume } from '@/functions/tailorResume';
import JobDescriptionStep from '@/components/resume-tailor/JobDescriptionStep';
import ResumeBuilderStep from '@/components/fast-track-pro/ResumeBuilderStep';
import TailoringLoader from '@/components/resume-tailor/TailoringLoader';
import TailoringResults from '@/components/resume-tailor/TailoringResults';
import ApplyTailorStep from '@/components/resume-tailor/ApplyTailorStep';
import { checkIsFastIQ } from '@/utils/isFastIQ';
import { getFastTrackVariant, trackQueuedView, trackQueuedUpgradeClick, trackQueuedBackOut } from '@/utils/tailoringLatency';


export default function ResumeTailoring({ onOpenUpgrade: onOpenUpgradeProp }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const onOpenUpgrade = onOpenUpgradeProp || (() => setShowUpgradeModal(true));
  const { user, refreshUser } = useAuth();
  const isFastIQ = checkIsFastIQ(user);
  const [trialAttempted, setTrialAttempted] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const [resumes, setResumes] = useState([]);
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('loading');
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedTailored, setSelectedTailored] = useState(null);
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [queuedAvailableAt, setQueuedAvailableAt] = useState(null);
  const [analysisError, setAnalysisError] = useState(false);
  // When arriving from the job-application "Yes, tailor it first" flow, we carry
  // the job context so we can return to the listing and submit once done.
  const [applyContext, setApplyContext] = useState(null);

  // Churn tracking — lifted above conditional render to satisfy rules-of-hooks
  const queuedViewTracked = useRef(false);
  useEffect(() => {
    if (phase === 'queued' && user?.email && !queuedViewTracked.current) {
      queuedViewTracked.current = true;
      const variantId = getFastTrackVariant(user.email).id;
      trackQueuedView(user.email, variantId);
    }
  }, [phase, user?.email]);

  // Auto-activate trial when user first lands on this page
  useEffect(() => {
    if (!trialAttempted && user && !isFastIQ) {
      setTrialAttempted(true);
      maybeActivateTrial(user, refreshUser).catch(() => {});
    }
  }, [user?.id]);
  const hasResumes = resumes.length > 0;
  const canAddMore = isFastIQ || resumes.length === 0;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasUpgradeSuccess = urlParams.get('upgrade') === 'success';
    if (hasUpgradeSuccess) {
      setUpgradeSuccess(true);
      if (refreshUser) refreshUser();
      setTimeout(() => setUpgradeSuccess(false), 3000);
    } else if (refreshUser) {
      refreshUser();
    }
  }, [refreshUser]);

  useEffect(() => {
    const loadResumes = async () => {
      try {
        const [res, tailored] = await Promise.all([
          base44.entities.Resume.filter({ student_email: user.email }),
          base44.entities.TailoredResume.filter({ user_email: user.email }),
        ]);
        const resList = res || [];
        const tailoredList = tailored || [];
        setResumes(resList);
        setTailoredResumes(tailoredList);
        // Did we arrive from the apply-modal handoff? If so, keep the focused
        // tailoring phase — never fall back to the resume hub.
        const fromApply = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search).get('from') === 'apply_modal';
        if (resList.length > 0) {
          const active = resList.find(r => r.is_active) || resList[0];
          setResumeText(active.parsed_text || '');
          setFileName(active.original_file_name || 'Resume on file');
          setResumeId(active.id);
          // Load analysis from entity first, fallback to localStorage
          if (active.analysis_data) {
            setAnalysis(active.analysis_data);
          } else {
            const cached = localStorage.getItem(`resume_analysis_${active.id}`);
            if (cached) {
              try { setAnalysis(JSON.parse(cached)); } catch (e) {}
            }
          }
          // Only show the hub if we are NOT mid apply-handoff. The applyContext
          // effect owns the phase when arriving from the job-apply modal.
          setPhase(prev => (fromApply || prev === 'applyTailor') ? 'applyTailor' : 'hub');
        } else {
          setPhase(prev => fromApply ? prev : 'entry');
        }
      } catch (e) {
        console.error('Failed to load resumes:', e);
        setPhase('entry');
      }
      setLoading(false);
    };
    if (user?.email) loadResumes();
  }, [user?.email]);

  // Handle hand-off from the job-application modal ("Yes, tailor it first").
  // Reads ?company=&role=&jd=&from=apply_modal, pre-fills the job, and jumps
  // straight to the focused tailoring screen — skipping the resume hub.
  useEffect(() => {
    if (applyContext) return; // already captured
    const detectApplyHandoff = () => {
      const hashQuery = window.location.hash.split('?')[1] || '';
      const params = new URLSearchParams(hashQuery || window.location.search);
      if (params.get('from') !== 'apply_modal') return;
      const ctx = {
        company: params.get('company') || '',
        role: params.get('role') || '',
        jd: params.get('jd') || '',
        jobUrl: params.get('job_url') || '',
        location: params.get('location') || '',
      };
      setApplyContext(ctx);
      setCompanyName(ctx.company);
      setJobTitle(ctx.role);
      setJobDescription(ctx.jd);
      setPhase('applyTailor');
      // Clean params so a refresh doesn't re-trigger
      try {
        const cleanHash = window.location.hash.split('?')[0];
        window.history.replaceState(null, '', cleanHash);
      } catch {}
    };
    // Run on mount AND on hashchange — the modal sets the hash right before
    // navigation, which can land just after this component mounts.
    detectApplyHandoff();
    window.addEventListener('hashchange', detectApplyHandoff);
    return () => window.removeEventListener('hashchange', detectApplyHandoff);
  }, [applyContext]);

  // Handle deep-link from batch completion email: ?resume_id=xxx
  useEffect(() => {
    if (phase !== 'hub' || tailoredResumes.length === 0) return;
    const hashQuery = window.location.hash.split('?')[1] || '';
    const hashParams = new URLSearchParams(hashQuery);
    const deepLinkId = hashParams.get('resume_id');
    if (!deepLinkId) return;
    const found = tailoredResumes.find(t => t.id === deepLinkId && t.status === 'completed');
    if (found && found.tailored_content) {
      setResult({
        tailoredResume: found,
        success: true,
      });
      setPhase('results');
      // Clean the URL so it doesn't re-trigger on refresh
      try {
        const cleanHash = window.location.hash.split('?')[0];
        window.history.replaceState(null, '', cleanHash);
      } catch {}
    }
  }, [phase, tailoredResumes]);

  useEffect(() => {
    if (analyzing || analysis || resumes.length === 0 || phase !== 'hub') return;

    const primaryResume = resumes.find(r => r.is_active) || resumes[0];
    if (!primaryResume?.parsed_text && !primaryResume?.original_file_url) return;

    const cached = localStorage.getItem(`resume_analysis_${primaryResume.id}`);
    if (cached) {
      try { setAnalysis(JSON.parse(cached)); } catch (e) {}
      return;
    }

    const runAnalysis = async () => {
      setAnalyzing(true);
      setAnalysisError(false);
      try {
        const res = await base44.functions.invoke('analyzeResumeAgainstGoals', {
          resumeText: primaryResume.parsed_text || '',
          fileUrl: !primaryResume.parsed_text ? primaryResume.original_file_url : undefined,
          targetRoles: user?.career_goals?.target_roles,
          targetIndustries: user?.career_goals?.target_industries,
          jobType: user?.career_goals?.job_type,
          location: user?.career_goals?.location,
          careerGoals: user?.career_goals,
        });
        if (res?.data?.analysis) {
          setAnalysis(res.data.analysis);
          localStorage.setItem(`resume_analysis_${primaryResume.id}`, JSON.stringify(res.data.analysis));
          base44.entities.Resume.update(primaryResume.id, { analysis_data: res.data.analysis }).catch(() => {});
          if (res.data.analysis.overall_score) {
            base44.auth.updateMe({ resume_score: res.data.analysis.overall_score }).catch(() => {});
          }
        } else {
          setAnalysisError(true);
        }
      } catch (e) {
        console.error('Analysis failed:', e);
        setAnalysisError(true);
      } finally {
        setAnalyzing(false);
      }
    };

    runAnalysis();
  }, [resumes.length, user?.email, user?.career_goals?.target_roles?.length, phase, analysis]);

  const uploadResume = async (file) => {
    setFileName(file.name);
    setPhase('uploading');
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updatedUser = await base44.auth.updateMe({ resume_url: file_url, resume_filename: file.name }).catch(() => {});
      
      // Create resume record immediately (don't wait for text extraction)
      const newResume = await base44.entities.Resume.create({
        student_email: user.email,
        original_file_name: file.name,
        original_file_url: file_url,
        parsed_text: '',
        is_active: resumes.length === 0,
      });
      
      setResumes(prev => [...prev, newResume]);
      setResumeId(newResume.id);
      localStorage.removeItem(`resume_analysis_${newResume.id}`);
      setAnalysis(null);
      setAnalysisError(false);
      setPhase('hub');
      
      // Refresh user data and notify dashboard
      const freshUser = updatedUser || await base44.auth.me();
      window.dispatchEvent(new CustomEvent('cff:user-updated', { detail: freshUser }));
      
      // Force reload the dashboard by navigating away and back
      setTimeout(() => {
        window.location.hash = '#FreeTierDashboard';
      }, 500);
      
      // Extract text asynchronously in background
      base44.integrations.Core.InvokeLLM({
        prompt: 'Extract all text content from this resume document. Return only the raw text, preserving structure but no JSON or formatting.',
        file_urls: [file_url],
        model: 'gemini_3_flash',
      })
        .then(extracted => {
          const parsed_text = typeof extracted === 'string' ? extracted : '';
          return base44.entities.Resume.update(newResume.id, { parsed_text });
        })
        .catch(e => console.warn('Text extraction failed:', e));
        
    } catch (e) {
      console.error('Upload failed:', e);
      setPhase(hasResumes ? 'hub' : 'entry');
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

  const handleTailor = (resume) => {
    setSelectedResume(resume);
    setResumeText(resume.parsed_text || '');
    setResumeId(resume.id);
    setPhase('tailor');
  };

  const handleViewTailored = (tailored) => {
    setSelectedTailored(tailored);
    setResult({
      tailoredResume: {
        id: tailored.id,
        tailored_content: tailored.tailored_content,
        changes: tailored.changes || [],
        ats_score: tailored.ats_score,
        original_score: tailored.original_score,
        keywords_added: tailored.keywords_added || [],
        keywords_missing: tailored.keywords_missing || [],
      },
      originalScore: tailored.original_score,
      tailoredScore: tailored.ats_score,
    });
    setCompanyName(tailored.company_name || '');
    setJobTitle(tailored.role_title || '');
    setPhase('results');
  };

  const handleDoTailor = async () => {
    // Ensure we have resume text — re-fetch from active resume if state is stale
    let effectiveResumeText = resumeText;
    if (!effectiveResumeText) {
      const active = resumes.find(r => r.is_active) || resumes[0];
      effectiveResumeText = active?.parsed_text || '';
    }
    if (!effectiveResumeText) {
      setError('Your resume text hasn\'t finished processing yet. Please wait a moment and try again.');
      return;
    }
    setPhase('tailoring');
    setError(null);
    try {
      // Hard timeout so a stalled request can never leave the user stuck on the loader
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 120000));
      const res = await Promise.race([timeout, tailorResume({
        resumeText: effectiveResumeText,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
        sourceResumeId: resumeId || '',
      })]);
      const failPhase = applyContext ? 'applyTailor' : 'tailor';
      if (res.data?.upgrade_required) {
        setError(res.data.message || 'Upgrade to unlock full resume tailoring.');
        setPhase(failPhase);
      } else if (res.data?.queued) {
        // Free tier latency — show the queued screen
        setQueuedAvailableAt(res.data.available_at);
        setPhase('queued');
      } else if (res.data?.success && res.data?.tailoredResume?.tailored_content) {
        setResult(res.data);
        base44.entities.TailoredResume.filter({ user_email: user.email })
          .then(t => setTailoredResumes(t || []))
          .catch(() => {});
        setPhase('results');
      } else {
        setError(res.data?.error || 'Tailoring failed. Please try again.');
        setPhase(failPhase);
      }
    } catch (e) {
      setError(e?.message === 'timeout'
        ? 'This is taking longer than expected. Please try again.'
        : 'Something went wrong. Please try again.');
      setPhase(applyContext ? 'applyTailor' : 'tailor');
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Delete this resume?')) return;
    await base44.entities.Resume.delete(resumeId);
    setResumes(prev => prev.filter(r => r.id !== resumeId));
  };

  if (!user || phase === 'loading') return null;

  // Show success toast if just upgraded
  if (upgradeSuccess) {
    return (
      <div style={{ position: 'fixed', top: 0, inset: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', textAlign: 'center' }}>Welcome to FastIQ!</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 300 }}>Your subscription is now active. Unlocking all features...</p>
      </div>
    );
  }

  // ── PHASE: queued (free tier latency) ───────────────────────────────────
  if (phase === 'queued') {
    const availableAt = queuedAvailableAt ? new Date(queuedAvailableAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    const timeRemaining = availableAt.getTime() - Date.now();
    const hoursLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
    const minsLeft = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)));
    const ftVariant = getFastTrackVariant(user?.email);

    const handleQueuedUpgrade = () => {
      trackQueuedUpgradeClick(user?.email, ftVariant.id);
      onOpenUpgrade();
    };
    const handleQueuedBack = () => {
      trackQueuedBackOut(user?.email, ftVariant.id);
      setPhase('hub');
    };

    return (
      <div style={{ maxWidth: 520, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <style>{`
          @keyframes queuePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
          @keyframes shimmerLine { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        `}</style>

        {/* Queue icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#fffbeb', border: '2px solid #fcd34d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 32,
          animation: 'queuePulse 2s ease infinite',
        }}>
          ⏳
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#d97706', margin: '0 0 8px' }}>Batch Queue</p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px', lineHeight: 1.3 }}>
          Your resume is in the queue
        </h1>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', margin: '0 0 28px', lineHeight: 1.6 }}>
        We batch-process free requests to keep CLIFF available for all students. Your tailored resume will be ready in <strong>usually 12–24 hours</strong>:
        </p>

        {/* Countdown */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: 16, padding: '24px 20px', marginBottom: 24,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 800, color: '#92400e', margin: '0 0 4px' }}>
            {hoursLeft}h {minsLeft}m
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#a16207', margin: 0 }}>
            Expected by {availableAt.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
          </p>

          {/* Progress bar */}
          <div style={{
            background: 'rgba(255,255,255,0.5)', borderRadius: 6,
            height: 8, overflow: 'hidden', marginTop: 16,
          }}>
            <div style={{
              height: '100%', width: '8%', borderRadius: 6,
              background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
              backgroundSize: '200px 100%',
              animation: 'shimmerLine 2s linear infinite',
            }} />
          </div>
        </div>

        {/* Fast-Track CTA */}
        <div style={{
          background: '#faf5ff', border: '1.5px solid #c4b5fd',
          borderRadius: 16, padding: '20px', marginBottom: 20,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#6b21a8', margin: '0 0 6px' }}>
            ⚡ Skip the wait with Premium
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7c3aed', margin: '0 0 16px', lineHeight: 1.5 }}>
            Premium users get instant AI resume tailoring — results in under 60 seconds.
          </p>
          <button
            onClick={handleQueuedUpgrade}
            data-variant={ftVariant.id}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              color: '#fff', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', borderRadius: 10, padding: '14px 28px',
              cursor: 'pointer', minHeight: 'auto', width: '100%',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            }}
          >
            {ftVariant.label}
          </button>
        </div>

        {/* Back to hub */}
        <button
          onClick={handleQueuedBack}
          style={{
            background: 'none', border: 'none',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            color: '#888', cursor: 'pointer', padding: 0, minHeight: 'auto',
            textDecoration: 'underline',
          }}
        >
          ← Back to Resume Hub
        </button>
      </div>
    );
  }

  // ── PHASE: tailoring loader ──────────────────────────────────────────────
  if (phase === 'tailoring') return <TailoringLoader onCancel={() => { setError(null); setPhase(applyContext ? 'applyTailor' : (hasResumes ? 'hub' : 'entry')); }} />;

  // ── PHASE: applyTailor (arrived from job-application "tailor it first") ────
  if (phase === 'applyTailor') {
    const active = resumes.find(r => r.is_active) || resumes[0];
    const resumeName = active?.name || active?.original_file_name || fileName || 'Your Resume';
    return (
      <ApplyTailorStep
        applyContext={applyContext}
        resumeName={resumeName}
        companyName={companyName}
        jobTitle={jobTitle}
        jobDescription={jobDescription}
        resumeText={resumeText}
        error={error}
        onCompanyChange={setCompanyName}
        onJobTitleChange={setJobTitle}
        onJobDescriptionChange={setJobDescription}
        onTailor={handleDoTailor}
        onCancel={() => navigate('FreeTierDashboard')}
      />
    );
  }

  // ── PHASE: results ───────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <TailoringResults
        result={result}
        companyName={companyName}
        jobTitle={jobTitle}
        originalResumeText={resumeText}
        onStartOver={() => { setResult(null); setPhase(applyContext ? 'applyTailor' : 'hub'); }}
        applyContext={applyContext}
        userEmail={user.email}
      />
    );
  }

  // ── PHASE: tailor ────────────────────────────────────────────────────────
  if (phase === 'tailor') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <button
          onClick={() => setPhase(hasResumes ? 'hub' : 'uploaded')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 32, padding: 0, minHeight: 'auto' }}
        >
          ← Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>Resume Studio</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px', lineHeight: 1.2 }}>
            Let the Agent optimize your resume
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#666', margin: 0, lineHeight: 1.6 }}>
            Based on your <strong>career goals</strong>, the Agent will strengthen your bullet points, improve clarity, and better align your experience with what employers are looking for.
          </p>
        </div>

        {/* Current File */}
        {selectedResume && (
          <div style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 32 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>Current File</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {selectedResume.name || selectedResume.original_file_name || 'My Resume'}
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#e53935', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Primary: Optimize by Career Goals */}
        <div style={{ marginBottom: 40 }}>
          <button
            onClick={() => {
              setCompanyName('');
              setJobTitle('');
              setJobDescription('');
              handleDoTailor();
            }}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}
          >
            Optimize My Resume →
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAA' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#E5E5E5' }} />
        </div>

        {/* Secondary: Tailor to Specific Job */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#1A1A1A', margin: '0 0 8px' }}>
              Want to tailor it to a specific job?
            </h3>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
              Paste a job description and the Agent will customize your resume for that exact role.
            </p>
          </div>
          <JobDescriptionStep
            companyName={companyName}
            jobTitle={jobTitle}
            jobDescription={jobDescription}
            resumeText={resumeText}
            onCompanyChange={setCompanyName}
            onJobTitleChange={setJobTitle}
            onJobDescriptionChange={setJobDescription}
            onTailor={handleDoTailor}
          />
        </div>
      </div>
    );
  }

  // ── PHASE: uploading ─────────────────────────────────────────────────────
  if (phase === 'uploading') {
    return (
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #F0F0F0', borderTop: '4px solid #E85D20', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Uploading your resume...</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>This will only take a moment.</p>
      </div>
    );
  }

  // ── PHASE: builder ─────────────────────────────────────────────────────
  if (phase === 'builder') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => setPhase('entry')}
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 4, minHeight: 'auto' }}
          >
            ← Back
          </button>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 4px' }}>RESUME BUILDER</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Let's build your resume.</h1>
          </div>
        </div>
        <div style={{ background: '#0d1117', borderRadius: 16, padding: 24 }}>
          <ResumeBuilderStep
            user={user}
            onResumeReady={async (resumeText, parsed) => {
              try {
                const resume = await base44.entities.Resume.create({
                  student_email: user?.email,
                  original_file_name: `${user?.full_name?.split(' ')[0] || 'My'}_Resume_${new Date().getFullYear()}.txt`,
                  parsed_text: resumeText || '',
                  is_active: resumes.length === 0,
                  name: 'My Resume',
                  last_used_at: new Date().toISOString(),
                });
                await base44.auth.updateMe({ resume_url: resume?.id || 'built' }).catch(() => {});
                setResumes(prev => [...prev, resume]);
                setResumeText(resumeText || '');
                setResumeId(resume.id);
                setAnalysis(null);
                setAnalysisError(false);
                setPhase('hub');
              } catch (e) {
                console.error('Resume save failed:', e);
                setPhase('hub');
              }
            }}
            onBack={() => setPhase('entry')}
          />
        </div>
      </div>
    );
  }

  // ── PHASE: hub ───────────────────────────────────────────────────────────
  if (phase === 'hub' && hasResumes) {
    return (
      <>
        {showUpgradeModal && <FastIQUpgradeModal user={user} onClose={() => setShowUpgradeModal(false)} />}
        <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: window.innerWidth < 600 ? 'wrap' : 'nowrap' }}>
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>Resume Studio</p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Resumes</h1>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={() => isFastIQ ? setPhase('builder') : onOpenUpgrade()}
                style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 10, padding: window.innerWidth < 600 ? '10px 14px' : '10px 18px', fontSize: 13, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
              >
                ✨ Build from scratch
              </button>
              {canAddMore ? (
                <button
                  onClick={() => setPhase('entry')}
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: window.innerWidth < 600 ? '10px 16px' : '10px 20px', fontSize: window.innerWidth < 600 ? 'clamp(12px, 2.5vw, 13px)' : 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto', width: window.innerWidth < 600 ? '100%' : 'auto' }}
                >
                  + Upload Resume
                </button>
              ) : (
                <button
                  onClick={() => onOpenUpgrade()}
                  style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 10, padding: window.innerWidth < 600 ? '10px 16px' : '10px 20px', fontSize: window.innerWidth < 600 ? 'clamp(12px, 2.5vw, 13px)' : 13, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto', width: window.innerWidth < 600 ? '100%' : 'auto' }}
                >
                  + Add Resume
                </button>
              )}
            </div>
          </div>

          {/* Free tier gate banner */}
          {!isFastIQ && resumes.length >= 1 && (
            <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0 }}>
                Free accounts can have 1 master resume. Upgrade to store unlimited versions and get advanced tailoring.
              </p>
              <button onClick={() => onOpenUpgrade()} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}>
                Unlock Accelerator →
              </button>
            </div>
          )}

          {/* Analysis section */}
          {(analyzing || analysis || analysisError) && (
            <div style={{ marginBottom: 32 }}>
              {analyzing && (
                <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #F0F0F0', borderTop: '3px solid #E85D20', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#1A1A1A', margin: '0 0 4px' }}>The Agent is reviewing your resume...</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>Scoring against your career goals</p>
                  </div>
                </div>
              )}

              {analysisError && !analyzing && (
                <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: 0 }}>Resume analysis couldn't load.</p>
                  <button onClick={() => { setAnalysisError(false); setAnalysis(null); }} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', minHeight: 'auto', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>Try Again</button>
                </div>
              )}

              {analysis && !analyzing && (
                <div style={{ background: '#0A0A0A', borderRadius: 16, padding: '28px 32px' }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 20px' }}>Resume Analysis • Matched to Your Career Goals</p>

                  <div style={{ display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', gap: 24, alignItems: window.innerWidth < 600 ? 'center' : 'flex-start', marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ width: 90, height: 90, borderRadius: '50%', border: `4px solid ${analysis.overall_score >= 80 ? '#22C55E' : analysis.overall_score >= 60 ? '#F59E0B' : '#EF4444'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{analysis.overall_score}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>/100</span>
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: analysis.overall_score >= 80 ? '#22C55E' : analysis.overall_score >= 60 ? '#F59E0B' : '#EF4444', margin: '8px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{analysis.score_label}</p>
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ background: 'rgba(232,93,32,0.15)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                         <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#E85D20', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Priority</p>
                         <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>{analysis.top_fix}</p>
                       </div>
                       <div style={{ marginTop: 12 }}>
                         <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Analyzing Against</p>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                           {user?.career_goals?.target_roles?.slice(0, 3).map((role, i) => (
                             <span key={i} style={{ background: 'rgba(232,93,32,0.2)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100, padding: '3px 8px', fontSize: 10, fontWeight: 600, color: '#fff' }}>{role}</span>
                           ))}
                           {user?.career_goals?.target_industries?.slice(0, 2).map((ind, i) => (
                             <span key={i} style={{ background: 'rgba(232,93,32,0.2)', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 100, padding: '3px 8px', fontSize: 10, fontWeight: 600, color: '#fff' }}>{ind}</span>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 600 ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#22C55E', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✅ Strengths</p>
                      {analysis.strengths?.map((s, i) => (
                        <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px', lineHeight: 1.4, paddingLeft: 8, borderLeft: '2px solid rgba(34,197,94,0.4)' }}>{s}</p>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#F59E0B', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Gaps</p>
                      {analysis.gaps?.map((g, i) => (
                        <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px', lineHeight: 1.4, paddingLeft: 8, borderLeft: '2px solid rgba(245,158,11,0.4)' }}>{g}</p>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#EF4444', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>❌ Missing</p>
                      {analysis.missing?.map((m, i) => (
                        <p key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px', lineHeight: 1.4, paddingLeft: 8, borderLeft: '2px solid rgba(239,68,68,0.4)' }}>{m}</p>
                      ))}
                    </div>
                  </div>

                  {!isFastIQ && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>The Agent can help fix these gaps.</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Tell it your target job or company and it will tailor your resume in seconds.</p>
                      </div>
                      <button onClick={() => handleTailor(resumes.find(r => r.is_active) || resumes[0])} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}>Let the Agent Optimize This Resume →</button>
                    </div>
                  )}

                  {isFastIQ && (
                    <button onClick={() => handleTailor(resumes.find(r => r.is_active) || resumes[0])} style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}>Optimize My Resume Now →</button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Master Resumes */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AAAAAA', margin: '0 0 12px' }}>MASTER RESUMES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {resumes.map(resume => (
                <div key={resume.id} style={{ background: '#fff', border: `2px solid ${resume.is_active ? '#E85D20' : '#E5E5E5'}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: resume.is_active ? '#FFF5F0' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resume.name || resume.original_file_name || 'My Resume'}
                      </p>
                      {resume.is_active && (
                        <span style={{ background: '#f5f3ff', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.06em', flexShrink: 0 }}>PRIMARY</span>
                      )}
                    </div>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: 0 }}>
                      {tailoredResumes.filter(t => t.source_resume_id === resume.id).length} tailored versions
                      {resume.last_used_at ? ` · Last used ${new Date(resume.last_used_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => isFastIQ ? handleTailor(resume) : onOpenUpgrade()}
                      style={{ background: isFastIQ ? '#E85D20' : '#F5F5F5', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, color: isFastIQ ? '#fff' : '#AAAAAA', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
                    >
                      {isFastIQ ? 'Tailor →' : '🔒 Tailor'}
                    </button>
                    {resume.original_file_url && (
                      <button
                        onClick={() => window.open(resume.original_file_url, '_blank')}
                        style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tailored Versions */}
          {tailoredResumes.length > 0 && (
            <div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#AAAAAA', margin: '0 0 12px' }}>TAILORED VERSIONS</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tailoredResumes.map(tailored => (
                  <div key={tailored.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎯</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tailored.role_title || 'Tailored Resume'}
                        {tailored.company_name ? ` · ${tailored.company_name}` : ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {tailored.ats_score && (
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: tailored.ats_score >= 80 ? '#22C55E' : tailored.ats_score >= 60 ? '#F59E0B' : '#EF4444' }}>
                            ATS {tailored.ats_score}%
                          </span>
                        )}
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAAAAA' }}>
                          {tailored.created_date ? new Date(tailored.created_date).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewTailored(tailored)}
                      style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next step CTA */}
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #F0F0F0' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#666', margin: '0 0 12px', textAlign: 'center' }}>
              Your resume is optimized for your career goals. Now research companies and find roles.
            </p>
            <button
              onClick={() => {
                const targetCompany = user?.career_goals?.target_companies?.[0] || '';
                navigate(`FreeTierDashboard${targetCompany ? `?company=${encodeURIComponent(targetCompany)}` : ''}`);
              }}
              style={{ background: 'linear-gradient(135deg, #E85D20, #d44e14)', border: 'none', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", width: '100%', minHeight: 'auto' }}
              >
              Go to Job Discovery →
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── PHASE: entry (default / no resumes) ─────────────────────────────────
  return (
    <>
      {showUpgradeModal && <FastIQUpgradeModal user={user} onClose={() => setShowUpgradeModal(false)} />}
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '48px 24px', width: '100%' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

        {hasResumes && (
          <button
            onClick={() => setPhase('hub')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 24, padding: 0, minHeight: 'auto' }}
          >
            ← Back to Hub
          </button>
        )}

        <button onClick={() => navigate('FreeTierDashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#64748b', marginBottom: 24, padding: 0, minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back to Dashboard
        </button>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', margin: '0 0 12px' }}>Resume</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', margin: '0 0 16px', lineHeight: 1.2 }}>
          Your resume is your first impression.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#666', margin: 0, lineHeight: 1.6 }}>
            Let's make it count. Do you have one already?
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 20, marginBottom: 32 }}>
          {/* Left Card: Yes, I have one (Recommended) */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ background: '#fff', border: '2px dashed #7c3aed', borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>📄</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Yes, I have one</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
              Upload your resume and the Agent will review it, score it, and help you tailor it to any job.
            </p>
            <div style={{
              background: '#f5f3ff', border: '1px dashed rgba(124,58,237,0.4)',
              borderRadius: 12, padding: '24px 16px', marginBottom: '16px',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#7c3aed', fontWeight: 500,
            }}>
              Drop PDF or Word doc here or click to upload
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#AAA', margin: 0, letterSpacing: '0.03em' }}>
              Supported formats: PDF, Word (.docx)
            </p>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>

          {/* Right Card: Help me build one */}
          <div
            onClick={() => setPhase('builder')}
            style={{
              background: '#fff', border: '1px solid #E0E0E0', borderRadius: 16, padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >

            <div style={{ width: 56, height: 56, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>✨</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Help me build one</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', margin: '0 0 24px', lineHeight: 1.5 }}>
              Answer a few quick questions and the Agent will build a strong, professional resume for you from scratch.
            </p>
            <button style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10, padding: '12px 24px',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff',
              cursor: 'pointer', minHeight: 'auto', width: '100%'
            }}>
              Start Building →
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => navigate('FreeTierDashboard')}
            style={{
              background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, color: '#888', cursor: 'pointer', padding: 0, minHeight: 'auto',
              textDecoration: 'underline'
            }}
          >
            Skip for now — go to dashboard →
          </button>
        </div>
      </div>
    </>
  );
}
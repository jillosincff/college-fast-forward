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

  // Resume data
  const [resumes, setResumes] = useState([]);
  const [tailoredResumes, setTailoredResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phase management
  const [phase, setPhase] = useState('loading');

  // Selected items
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedTailored, setSelectedTailored] = useState(null);

  // Upload state
  const [fileName, setFileName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeId, setResumeId] = useState(null);

  // Tailor state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq');
  const hasResumes = resumes.length > 0;
  const canAddMore = isFastIQ || resumes.length === 0;

  // Load resumes on mount
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

        if (resList.length > 0) {
          // Pre-load the active resume's text for tailoring
          const active = resList.find(r => r.is_active) || resList[0];
          setResumeText(active.parsed_text || '');
          setFileName(active.original_file_name || 'Resume on file');
          setResumeId(active.id);
          setPhase('hub');
        } else {
          setPhase('entry');
        }
      } catch (e) {
        console.error('Failed to load resumes:', e);
        setPhase('entry');
      }
      setLoading(false);
    };
    if (user?.email) loadResumes();
  }, [user?.email]);

  const uploadResume = async (file) => {
    setFileName(file.name);
    setPhase('uploading');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ resume_url: file_url });

      // Create Resume entity record
      const newResume = await base44.entities.Resume.create({
        student_email: user.email,
        original_file_name: file.name,
        original_file_url: file_url,
        is_active: resumes.length === 0,
      });

      setResumes(prev => [...prev, newResume]);
      setResumeId(newResume.id);
      setPhase('hub');
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
    // Reconstruct result shape for TailoringResults
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
        // Refresh tailored list
        base44.entities.TailoredResume.filter({ user_email: user.email })
          .then(t => setTailoredResumes(t || []))
          .catch(() => {});
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

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Delete this resume?')) return;
    await base44.entities.Resume.delete(resumeId);
    setResumes(prev => prev.filter(r => r.id !== resumeId));
  };

  if (!user || phase === 'loading') return null;

  // ── PHASE: tailoring loader ──────────────────────────────────────────────
  if (phase === 'tailoring') return <TailoringLoader />;

  // ── PHASE: results ───────────────────────────────────────────────────────
  if (phase === 'results' && result) {
    return (
      <TailoringResults
        result={result}
        companyName={companyName}
        jobTitle={jobTitle}
        originalResumeText={resumeText}
        onStartOver={() => { setResult(null); setPhase('hub'); }}
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 24, padding: 0, minHeight: 'auto' }}
        >
          ← Back
        </button>
        {selectedResume && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 16 }}>
            Tailoring: <strong style={{ color: '#1A1A1A' }}>{selectedResume.name || selectedResume.original_file_name || 'My Resume'}</strong>
          </p>
        )}
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
          onTailor={handleDoTailor}
        />
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

  // ── PHASE: hub ───────────────────────────────────────────────────────────
  if (phase === 'hub' && hasResumes) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 8px' }}>RESUME HUB</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Your Resumes</h1>
          </div>
          {canAddMore ? (
            <button
              onClick={() => setPhase('entry')}
              style={{ background: '#E85D20', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
            >
              + Add Resume
            </button>
          ) : (
            <button
              onClick={() => onOpenUpgrade?.()}
              style={{ background: 'none', border: '1px solid #E85D20', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#E85D20', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}
            >
              + Add Resume · FastIQ
            </button>
          )}
        </div>

        {/* Free tier gate banner */}
        {!isFastIQ && resumes.length >= 1 && (
          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0 }}>
              Free accounts include 1 master resume. Upgrade to store unlimited versions.
            </p>
            <button onClick={() => onOpenUpgrade?.()} style={{ background: '#E85D20', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', minHeight: 'auto' }}>
              Unlock FastIQ →
            </button>
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
                      <span style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#E85D20', letterSpacing: '0.06em', flexShrink: 0 }}>PRIMARY</span>
                    )}
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#AAAAAA', margin: 0 }}>
                    {tailoredResumes.filter(t => t.source_resume_id === resume.id).length} tailored versions
                    {resume.last_used_at ? ` · Last used ${new Date(resume.last_used_at).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => isFastIQ ? handleTailor(resume) : onOpenUpgrade?.()}
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
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleViewTailored(tailored)}
                      style={{ background: 'none', border: '1px solid #E0E0E0', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#555', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", minHeight: 'auto' }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next step CTA */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #F0F0F0' }}>
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

  // ── PHASE: entry (default / no resumes) ─────────────────────────────────
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');`}</style>

      {hasResumes && (
        <button
          onClick={() => setPhase('hub')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 24, padding: 0, minHeight: 'auto' }}
        >
          ← Back to Hub
        </button>
      )}

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
          style={{ background: '#fff', border: '2px dashed #E85D20', borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer' }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>📄</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>Yes, I have one</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 20px', lineHeight: 1.5 }}>
            Upload your resume and FastIQ will review it, score it, and help you tailor it to any job.
          </p>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#E85D20', fontWeight: 600 }}>Drop PDF or Word doc here or click to upload →</span>
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
        </div>

        {/* Path B — Build with FastIQ */}
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
            Answer a few questions and FastIQ will build a professional resume for you.
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
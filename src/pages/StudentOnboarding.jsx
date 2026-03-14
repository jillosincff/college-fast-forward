import React, { useState, useEffect } from 'react';
import { navigate } from '@/components/utils/navigation';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/components/auth/AuthContext';
import { 
  GRAD_YEARS 
} from '@/components/onboarding/onboardingOptions';
import { JobRequest } from '@/entities/JobRequest';
import confetti from 'canvas-confetti';
import CelebrationScreen from '@/components/onboarding/student/CelebrationScreen';
import AskFirstQuestion from '@/components/onboarding/student/AskFirstQuestion';
import StudentStep1LeftPanel from '@/components/onboarding/student/StudentStep1LeftPanel';
import StudentStep1ProgressBar from '@/components/onboarding/student/StudentStep1ProgressBar';
import StudentStep2Interests from '@/components/onboarding/student/StudentStep2Interests';

export default function StudentOnboarding() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: About You
  const [major, setMajor] = useState('');
  const [minor, setMinor] = useState('');
  const [preTrack, setPreTrack] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [referralCode, setReferralCode] = useState('');
  
  // Step 2: Interests
  const [industries, setIndustries] = useState([]);
  const [seeking, setSeeking] = useState([]);
  
  // Step 3: Question (new flow)
  const [helpNeeded, setHelpNeeded] = useState([]);
  const [helpRequest, setHelpRequest] = useState('');
  const [questionCategory, setQuestionCategory] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  
  // Pre-professional track options
  const PRE_TRACKS = [
    { id: '', label: 'None / Not applicable' },
    { id: 'Pre-Law', label: 'Pre-Law' },
    { id: 'Pre-Med', label: 'Pre-Med' },
    { id: 'Pre-Dental', label: 'Pre-Dental' },
    { id: 'Pre-Vet', label: 'Pre-Vet' },
    { id: 'Pre-Pharmacy', label: 'Pre-Pharmacy' },
    { id: 'Pre-PA', label: 'Pre-PA' },
    { id: 'Pre-Nursing', label: 'Pre-Nursing' },
    { id: 'Pre-Business', label: 'Pre-Business' },
  ];
  
  // Timeline options
  const TIMELINE_OPTIONS = [
    { id: '', label: 'Not sure yet' },
    { id: 'immediate', label: 'ASAP' },
    { id: 'this_semester', label: 'This Semester' },
    { id: 'next_semester', label: 'Next Semester' },
    { id: 'summer', label: 'Summer 2026' },
  ];
  
  // State for celebration screen
  const [showCelebration, setShowCelebration] = useState(false);
  const [matchCount, setMatchCount] = useState(null);

  // Pre-fill from user data if available
  useEffect(() => {
    if (user) {
      if (user.major) setMajor(user.major);
      if (user.minor) setMinor(user.minor);
      if (user.pre_professional_track) setPreTrack(user.pre_professional_track);
      if (user.graduation_year) setGradYear(user.graduation_year);
      if (user.industries_interested) setIndustries(user.industries_interested);
      if (user.seeking_type) setSeeking(user.seeking_type);
      if (user.help_needed) setHelpNeeded(user.help_needed);
      if (user.preferred_work_location) setPreferredLocation(user.preferred_work_location);
      if (user.target_timeline) setTargetTimeline(user.target_timeline);
    }
  }, [user]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    
    try {
      // Upload resume if provided
      let resumeUrl = null;
      if (resumeFile) {
        setResumeUploading(true);
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({ file: resumeFile });
          resumeUrl = uploadResult.file_url;
        } catch (uploadError) {
          console.error('Resume upload failed:', uploadError);
          // Continue without resume - don't block onboarding
        }
        setResumeUploading(false);
      }

      // Save student profile data
      const updateData = {
        major,
        minor: minor || '',
        pre_professional_track: preTrack || '',
        graduation_year: gradYear,
        industries_interested: industries,
        seeking_type: seeking,
        help_needed: helpNeeded,
        preferred_work_location: preferredLocation || '',
        target_timeline: targetTimeline || '',
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        // Start the 30-day intro challenge
        challenge_start_date: new Date().toISOString(),
        challenge_intros_count: 0,
        challenge_completed: false,
        challenge_intros: []
      };
      
      if (resumeUrl) updateData.resume_url = resumeUrl;
      if (referralCode.trim()) updateData.referral_code = referralCode.trim();
      
      await base44.auth.updateMe(updateData);

      // Post the help request to All Questions (skip if student chose to skip)
      const skipped = helpRequest === '__SKIP__';
      const nameParts = (user?.full_name || 'Student').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      
      if (!skipped) {
      const fullDescription = helpRequest.trim() + (questionContext.trim() ? '\n\n' + questionContext.trim() : '');
      const jobRequestData = {
        role: 'Student Question',
        title: helpRequest.trim(),
        description: fullDescription,
        category: questionCategory,
        target_industry: industries[0] || 'Other',
        poster_type: 'student',
        // CRITICAL: Always store poster_email so answer notifications can reach the student
        poster_email: user?.email,
        poster_name: user?.full_name || 'Student',
        poster_first_name: firstName,
        poster_last_name: lastName,
        // Store student academic info for QuestionCard display
        student_year: gradYear || '',
        student_major: major || '',
        student_minor: minor || '',
        student_pre_track: preTrack || '',
        status: 'active',
        role_type: 'full_time',
        target_helpers: ['alumni', 'parents'],
        resume_url: resumeUrl,
        help_types: questionCategory ? [questionCategory] : helpNeeded,
        start_timing: targetTimeline || '',
        location_preference: preferredLocation.trim() || ''
      };
      
      await JobRequest.create(jobRequestData);
      } // end if (!skipped)

      // Create ActivationPrompt for tracking first meaningful action
      // Student just posted a question during onboarding — that counts as activation
      try {
        const utmSource = sessionStorage.getItem('utm_source');
        const utmCampaign = sessionStorage.getItem('utm_campaign');
        let source = 'organic';
        if (utmSource === 'newsletter' && utmCampaign) {
          source = `newsletter_${utmCampaign}`;
        } else if (utmSource) {
          source = utmSource;
        }

        await base44.entities.ActivationPrompt.create({
          user_id: user.id,
          user_type: 'student',
          user_email: user.email,
          prompt_stage: 'welcome',
          status: 'acted',
          action_taken: true,
          action_type: 'posted_question',
          acted_at: new Date().toISOString(),
          source,
        });
        console.log('✅ ActivationPrompt created for student (already activated via question)');
      } catch (apErr) {
        console.log('ActivationPrompt creation failed (non-critical):', apErr.message);
      }

      await refreshUser();

      // Award student karma for completing profile (+15)
      try {
        await base44.functions.invoke('awardStudentKarma', {
          userId: user.id,
          userEmail: user.email,
          actionType: 'complete_profile',
          description: 'Completed student profile'
        });
        console.log('✅ Student karma awarded for profile completion');
      } catch (karmaErr) {
        console.log('Student karma for profile failed (non-critical):', karmaErr.message);
      }

      // Check if a parent already linked this student's email (auto-link)
      try {
        await base44.functions.invoke('linkStudentToParent', {
          action: 'auto_link',
          studentUserId: user.id,
          studentEmailAddress: user.email
        });
        console.log('✅ Auto-link check completed');
      } catch (autoLinkErr) {
        console.log('Auto-link check failed (non-critical):', autoLinkErr.message);
      }

      // Send welcome email (fire-and-forget)
      try {
        base44.functions.invoke('sendWelcomeEmail', {
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          persona: 'gator',
          userIndustries: industries,
        }).catch(e => console.log('Welcome email failed (non-critical):', e.message));
        console.log('✅ Welcome email triggered');
      } catch (e) {
        console.log('Welcome email trigger failed (non-critical):', e.message);
      }

      // Show celebration screen instead of navigating directly
      setShowCelebration(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setLoading(false);
    }
  };
  
  // Show celebration screen after onboarding complete
  if (showCelebration) {
    return <CelebrationScreen user={user} />;
  }

  // Resume handlers
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetResume(file);
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetResume(file);
  };

  const validateAndSetResume = (file) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    setResumeFile(file);
  };

  // Validation for each step
  const isStep1Valid = major.trim().length > 0 && gradYear;
  const isStep2Valid = industries.length > 0 && seeking.length > 0;
  const isStep3Valid = questionCategory && helpRequest.trim().length >= 10;

  // STEP 1: About You - Two-Column Layout
  if (step === 1) {
    const dmSans = "'DM Sans', system-ui, sans-serif";
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Progress bar */}
        <StudentStep1ProgressBar currentStep={1} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }} className="flex-col lg:flex-row">
          {/* LEFT PANEL — value proposition (hidden on mobile) */}
          <div className="hidden lg:flex" style={{ width: '45%', minHeight: 'calc(100vh - 52px)' }}>
            <StudentStep1LeftPanel />
          </div>

          {/* Mobile condensed value prop */}
          <div className="lg:hidden" style={{ background: 'linear-gradient(to bottom, #0d1117, #0821A5)', padding: '28px 24px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>For UF Students</p>
            <p style={{ fontFamily: dmSans, fontSize: 20, fontWeight: 600, color: '#f4f0e8', lineHeight: 1.25, marginBottom: 4 }}>
              You've discovered the secret:
            </p>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, fontStyle: 'italic', color: '#E85D20', lineHeight: 1.25, marginBottom: 12 }}>
              access beats resumes.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 14px' }}>🔑 Skip the black hole</span>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 14px' }}>🤝 Warm intros</span>
              <span style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '5px 14px' }}>⚡ 1,000 connections</span>
            </div>
          </div>

          {/* RIGHT PANEL — form */}
          <div className="lg:w-[55%] w-full" style={{ background: '#fff', padding: '40px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ maxWidth: 440, margin: '0 auto', width: '100%' }}>
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: dmSans, fontSize: 22, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  Let's get to know you
                </h2>
                <p style={{ fontFamily: dmSans, fontSize: 14, fontWeight: 300, color: '#94a3b8' }}>
                  Takes 2 minutes.
                </p>
              </div>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                    What's your major? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g., Computer Science, Business, Psychology"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                    Minor <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={minor}
                    onChange={(e) => setMinor(e.target.value)}
                    placeholder="e.g., Economics, Spanish"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                    Pre-professional track <span style={{ fontWeight: 300, color: '#94a3b8' }}>(if applicable)</span>
                  </label>
                  <select
                    value={preTrack}
                    onChange={(e) => setPreTrack(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none transition-colors bg-white"
                  >
                    {PRE_TRACKS.map(track => (
                      <option key={track.id} value={track.id}>{track.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 10 }}>
                    When do you graduate? <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GRAD_YEARS.map(year => (
                      <button
                        key={year}
                        type="button"
                        data-chip="true"
                        onClick={() => setGradYear(year)}
                        className={`chip-btn px-4 py-2.5 rounded-xl font-medium transition-all border-2 text-sm ${
                          gradYear === year
                            ? 'bg-blue-50 border-[#0021A5] text-[#0021A5] shadow-md'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: dmSans, fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
                    Referral code <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g., UF-JOHN"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base focus:border-[#0021A5] focus:outline-none uppercase transition-colors"
                    maxLength={20}
                  />
                  <p style={{ fontFamily: dmSans, fontSize: 12, fontWeight: 300, color: '#94a3b8', marginTop: 4 }}>
                    Got a code from a friend or ambassador? Enter it here.
                  </p>
                </div>

                <button
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  style={{
                    width: '100%', padding: '16px 0', borderRadius: 12, border: 'none',
                    fontFamily: dmSans, fontSize: 16, fontWeight: 600,
                    cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                    background: isStep1Valid ? '#E85D20' : '#e2e8f0',
                    color: isStep1Valid ? '#fff' : '#94a3b8',
                    transition: 'all 0.2s',
                    minHeight: 'auto',
                  }}
                >
                  Continue →
                </button>

                <p style={{ fontFamily: dmSans, fontSize: 13, fontWeight: 300, color: '#94a3b8', textAlign: 'center' }}>
                  Join nearly <span style={{ fontWeight: 500, color: '#64748b' }}>1,000</span> students already connecting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Interests
  if (step === 2) {
    return (
      <StudentStep2Interests
        industries={industries}
        onIndustriesChange={setIndustries}
        seeking={seeking}
        onSeekingChange={setSeeking}
        onNext={handleNext}
        onBack={handleBack}
        isValid={isStep2Valid}
      />
    );
  }

  // STEP 3: Ask First Question
  const orangeColor = '#E85D20';
  const orangeHoverColor = '#d44e14';
  const step3Valid = isStep3Valid || helpRequest === '__SKIP__';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f2ee' }}>
      <style>{`@keyframes s3FadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@media(max-width:768px){.step3-container{padding:32px 20px 60px !important}.step3-buttons{flex-direction:column-reverse !important}.step3-buttons button{width:100% !important}}`}</style>
      <StudentStep1ProgressBar currentStep={3} />

      <div className="step3-container" style={{ flex: 1, maxWidth: 640, margin: '0 auto', width: '100%', padding: '48px 24px 80px' }}>
        <div style={{ animation: 's3FadeUp 0.4s ease both' }}>
          <AskFirstQuestion
            question={helpRequest}
            onQuestionChange={setHelpRequest}
            category={questionCategory}
            onCategoryChange={setQuestionCategory}
            context={questionContext}
            onContextChange={setQuestionContext}
            location={preferredLocation}
            onLocationChange={setPreferredLocation}
            timeline={targetTimeline}
            onTimelineChange={setTargetTimeline}
          />
        </div>

        {/* Skip option */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            onClick={() => { setHelpRequest('__SKIP__'); setQuestionCategory('networking'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 300, color: '#bbb', minHeight: 'auto', width: 'auto' }}
          >
            Skip for now — I'll post a question later
          </button>
        </div>

        {/* Resume Upload */}
        {questionCategory && helpRequest.trim().length >= 10 && helpRequest !== '__SKIP__' && (
          <div style={{ maxWidth: 560, margin: '24px auto 0' }}>
            <label style={{ display: 'block', fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13, fontWeight: 500, color: '#334155', marginBottom: 8 }}>
              Upload your resume <span style={{ fontWeight: 300, color: '#94a3b8' }}>(optional)</span>
            </label>
            <div
              style={{
                border: `2px dashed ${resumeFile ? '#86efac' : 'rgba(0,0,0,0.12)'}`,
                borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer',
                background: resumeFile ? '#f0fdf4' : '#fff',
                transition: 'all 0.2s',
              }}
              onClick={() => document.getElementById('resume-upload').click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={handleResumeDrop}
            >
              <input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
              {resumeFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📄</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, color: '#1e293b', margin: 0 }}>{resumeFile.name}</p>
                    <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#94a3b8', margin: 0 }}>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setResumeFile(null); }} style={{ marginLeft: 16, padding: 4, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', minHeight: 'auto', width: 'auto' }}>✕</button>
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 400, color: '#555', margin: '0 0 4px' }}>Drag & drop your resume here</p>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: '#aaa', margin: 0 }}>PDF, DOC, DOCX (max 5MB)</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Button row */}
        <div className="step3-buttons" style={{ display: 'flex', gap: 12, marginTop: 28, animation: 's3FadeUp 0.4s 0.2s ease both' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.1)',
              color: '#888', fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 400,
              borderRadius: 100, padding: '13px 24px', cursor: 'pointer',
              transition: 'all 0.2s', minHeight: 'auto',
            }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!step3Valid || loading}
            style={{
              flex: 1, borderRadius: 100, padding: 13, border: 'none',
              background: (step3Valid && !loading) ? orangeColor : 'rgba(0,0,0,0.06)',
              color: (step3Valid && !loading) ? '#fff' : '#bbb',
              fontFamily: "'DM Sans'", fontSize: 15, fontWeight: 500,
              cursor: (step3Valid && !loading) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', minHeight: 'auto',
            }}
            onMouseEnter={e => { if (step3Valid && !loading) e.currentTarget.style.background = orangeHoverColor; }}
            onMouseLeave={e => { if (step3Valid && !loading) e.currentTarget.style.background = orangeColor; }}
          >
            {loading ? (resumeUploading ? 'Uploading resume...' : 'Finding matches...') : 'Post my question →'}
          </button>
        </div>
      </div>
    </div>
  );
}
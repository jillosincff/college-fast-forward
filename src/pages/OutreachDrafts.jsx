import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { maybeActivateTrial } from '@/utils/trialActivation';
import { navigate } from '@/components/utils/navigation';
import ColdInroadScout from '@/components/free-tier/ColdInroadScout';
import AutomatedAlumniActionPanel from '@/components/free-tier/AutomatedAlumniActionPanel';
import { findPipelineMatch } from '@/components/pipeline/findPipelineMatch';

const CONTEXTS = [
  { id: 'alumni_search', label: 'Alumni Outreach', icon: '🔍', desc: 'Reaching out to a UF alumni you found' },
  { id: 'cff_connection', label: 'CFF Connection', icon: '🤝', desc: 'Messaging a parent or alumni in the CFF network' },
  { id: 'job_application', label: 'Job Application Follow-up', icon: '📋', desc: 'Following up on a job you applied for' },
  { id: 'cold_outreach', label: 'Cold Outreach', icon: '🎯', desc: 'Reaching out to someone at a target company' },
  { id: 'thank_you', label: 'Thank You Note', icon: '💙', desc: 'Thanking someone after a conversation' },
];

const STATUS_COLORS = {
  draft: '#AAAAAA',
  sent: '#F59E0B',
  replied: '#22C55E',
  archived: '#E0E0E0',
};

const STATUS_LABELS = {
  draft: 'Draft',
  sent: 'Sent — awaiting reply',
  replied: 'Replied ✓',
  archived: 'Archived',
};

export default function OutreachDrafts({ user: userProp, onOpenUpgrade }) {
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(() => {
    const hash = window.location.hash;
    const paramStr = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(paramStr);
    if (params.get('context') === 'cold_outreach' && params.get('company')) return 'scout';
    if (params.get('skipForm') === '1') return 'compose';
    if (params.get('contact') && params.get('company')) return 'form';
    return 'list';
  });
  const [selectedContext, setSelectedContext] = useState(null);
  const [form, setForm] = useState({
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    recipientEmail: '',
    recipientLinkedinUrl: '',
    jobTitle: '',
    jobUrl: '',
    jobDescription: '',
    conversationContext: '',
  });
  
  // CLiFF Scout state for automated targeting
  const [scoutPhase, setScoutPhase] = useState('analyzing'); // 'analyzing' | 'recommendation'
  const [recommendedTarget, setRecommendedTarget] = useState(null);
  
  // Handle pre-population from URL params (when coming from MatchDeepDiveModal or Pure Sourcing or Kanban)
  useEffect(() => {
    const hash = window.location.hash;
    const hashParamsPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(hashParamsPart);
    const contact = params.get('contact');
    const company = params.get('company');
    const role = params.get('role');
    const tab = params.get('tab');
    const context = params.get('context');
    const alumniName = params.get('alumniName');
    const alumniRole = params.get('alumniRole');
    const alumniLinkedin = params.get('alumniLinkedin');
    const jobTitle = params.get('jobTitle');

    if (context === 'cold_outreach' && company) {
      // Pure Sourcing Play — pre-populate company/role, trigger CLiFF Scout
      setForm(prev => ({
        ...prev,
        recipientCompany: decodeURIComponent(company),
        recipientTitle: role ? decodeURIComponent(role) : '',
        jobTitle: role ? decodeURIComponent(role) : '',
        conversationContext: `Cold outreach for a role I found directly on ${decodeURIComponent(company)}'s careers page.`,
      }));
      setSelectedContext('cold_outreach');
      setScoutPhase('analyzing');
      setPhase('scout');
      window.history.replaceState({}, '', '#OutreachDrafts');
    } else if (alumniName && company) {
      // From Kanban modal alumni selection
      const skipForm = params.get('skipForm') === '1';
      const formData = {
        recipientName: decodeURIComponent(alumniName),
        recipientCompany: decodeURIComponent(company),
        recipientTitle: alumniRole ? decodeURIComponent(alumniRole) : '',
        recipientLinkedinUrl: alumniLinkedin ? decodeURIComponent(alumniLinkedin) : '',
        jobTitle: jobTitle ? decodeURIComponent(jobTitle) : '',
        jobUrl: '',
        conversationContext: '',
      };
      setForm(formData);
      setSelectedContext('alumni_search');
      
      // If skipForm=1, auto-generate the message and go straight to compose
      if (skipForm) {
        window.history.replaceState({}, '', '#OutreachDrafts');
        // Trigger auto-generation
        setTimeout(async () => {
          try {
            // First, try to find their direct email (Hunter.io / RocketReach)
            try {
              const domain = decodeURIComponent(company).toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9.]/g, '') + '.com';
              const emailRes = await base44.functions.invoke('findContactEmail', {
                contactName: formData.recipientName,
                companyDomain: domain,
              });
              if (emailRes?.data?.email) {
                formData.recipientEmail = emailRes.data.email;
                setForm(prev => ({ ...prev, recipientEmail: emailRes.data.email }));
              }
            } catch {}
            const isLinkedInRoute = !formData.recipientEmail;
            const res = await base44.functions.invoke('generateOutreachMessage', {
              context: 'alumni_search',
              recipientName: formData.recipientName,
              recipientTitle: formData.recipientTitle,
              recipientCompany: formData.recipientCompany,
              recipientEmail: formData.recipientEmail,
              recipientLinkedinUrl: formData.recipientLinkedinUrl,
              isLinkedInRoute: isLinkedInRoute, // Dynamic constraint flag
              studentName: user?.full_name || firstName,
              studentMajor: user?.major || '',
              targetRole: user?.career_goals?.target_roles?.[0] || '',
              targetIndustry: user?.career_goals?.target_industries?.[0] || '',
              graduationYear: user?.career_goals?.graduation_year || '',
              school: user?.school_name || 'University of Florida',
              jobTitle: formData.jobTitle,
              jobUrl: formData.jobUrl,
              jobDescription: formData.jobDescription,
              conversationContext: formData.conversationContext,
            });
            const msg = res?.data?.message || '';
            setGeneratedMessage(msg);
            setEditedMessage(msg);
            setPhase('compose');
          } catch (e) {
            console.error('Auto-generation failed:', e);
            setPhase('form');
          }
        }, 100);
      } else {
        setPhase('form');
      }
    } else if (contact && company) {
      setForm({
        recipientName: decodeURIComponent(contact),
        recipientCompany: decodeURIComponent(company),
        recipientTitle: role ? decodeURIComponent(role) : '',
        recipientLinkedinUrl: '',
        jobTitle: '',
        jobUrl: '',
        conversationContext: '',
      });
      setSelectedContext(tab === 'parents' ? 'cff_connection' : 'alumni_search');
      window.history.replaceState({}, '', '#OutreachDrafts');
    }
  }, []);
  const [generating, setGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [editedMessage, setEditedMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedDraft, setExpandedDraft] = useState(null);
  const [copyToast, setCopyToast] = useState(null);
  const [followUpDraft, setFollowUpDraft] = useState(null);
  const [followUpMessage, setFollowUpMessage] = useState('');

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq' || user?.fastiq_trial_active || user?.trial_status === 'active' || user?.membership_tier === 'fastiq_trial');

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Load drafts
  useEffect(() => {
    const loadDrafts = async () => {
      setLoading(true);
      try {
        const res = await base44.entities.OutreachDraft.list('-created_date');
        setDrafts(res || []);
      } catch (e) {
        console.error('Failed to load drafts:', e);
      }
      setLoading(false);
    };
    if (user?.email) loadDrafts();
  }, [user]);

  // Check for follow-up nudges
  const draftsDueFollowUp = drafts.filter(d => {
    if (d.status !== 'sent' || d.follow_up_sent) return false;
    if (!d.follow_up_due_at) return false;
    return new Date(d.follow_up_due_at) <= new Date();
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Determine if this is LinkedIn-only route (no email found)
      const isLinkedInRoute = selectedContext === 'alumni_search' && !form.recipientEmail;
      
      const res = await base44.functions.invoke('generateOutreachMessage', {
        context: selectedContext,
        recipientName: form.recipientName,
        recipientTitle: form.recipientTitle,
        recipientCompany: form.recipientCompany,
        recipientEmail: form.recipientEmail,
        recipientLinkedinUrl: form.recipientLinkedinUrl,
        isLinkedInRoute: isLinkedInRoute, // Dynamic constraint flag
        studentName: user?.full_name || firstName,
        studentMajor: user?.major || '',
        targetRole: user?.career_goals?.target_roles?.[0] || '',
        targetIndustry: user?.career_goals?.target_industries?.[0] || '',
        graduationYear: user?.career_goals?.graduation_year || '',
        school: user?.school_name || 'University of Florida',
        jobTitle: form.jobTitle,
        jobUrl: form.jobUrl,
        jobDescription: form.jobDescription,
        conversationContext: form.conversationContext,
      });
      const msg = res?.data?.message || '';
      setGeneratedMessage(msg);
      setEditedMessage(msg);
      setPhase('compose');
    } catch (e) {
      console.error('Generation failed:', e);
    }
    setGenerating(false);
  };

  const handleSaveDraft = async (status = 'draft') => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const sentAt = status === 'sent' ? now : null;
      const followUpDueAt = status === 'sent'
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const draft = await base44.entities.OutreachDraft.create({
        recipient_name: form.recipientName,
        recipient_title: form.recipientTitle,
        recipient_company: form.recipientCompany,
        recipient_linkedin_url: form.recipientLinkedinUrl,
        context: selectedContext,
        message: editedMessage,
        status,
        sent_at: sentAt,
        follow_up_due_at: followUpDueAt,
        follow_up_sent: false,
        job_url: form.jobUrl,
      });

      setDrafts(prev => [draft, ...prev]);

      // When marking as sent, update or create a NetworkingPipeline record
      const currentUser = user;
      if (status === 'sent' && currentUser?.email && form.recipientName) {
        try {
          // RLS already scopes to the current user — filter only by the contact fields
          const allPipelines = await base44.entities.NetworkingPipeline.list('-created_date', 200);
          const ADVANCED_STATUSES = ['replied', 'coffee_chat', 'interview', 'offer'];
          const match = findPipelineMatch(allPipelines, form.recipientName, form.recipientCompany);
          if (match) {
            if (!ADVANCED_STATUSES.includes(match.status)) {
              await base44.entities.NetworkingPipeline.update(match.id, {
                status: 'reached_out',
                reached_out_date: now,
                status_date: now,
              });
            }
          } else {
            await base44.entities.NetworkingPipeline.create({
              user_email: currentUser.email,
              alumni_name: form.recipientName,
              alumni_role: form.recipientTitle || '',
              alumni_email: form.recipientEmail || '',
              alumni_linkedin: form.recipientLinkedinUrl || '',
              company: form.recipientCompany || '',
              job_title: form.jobTitle || '',
              job_description: form.conversationContext || '',
              job_url: form.jobUrl || '',
              status: 'reached_out',
              reached_out_date: now,
              status_date: now,
              alumni_source: 'manual',
            });
          }
          window.dispatchEvent(new CustomEvent('cliff:pipeline-refresh'));
        } catch (e) {
          console.error('Pipeline update failed:', e);
        }
      }

      resetForm();

      if (status === 'sent') {
        navigate('FreeTierDashboard?outreach_sent=1');
      } else {
        setPhase('list');
      }
    } catch (e) {
      console.error('Save failed:', e);
    }
    setSaving(false);
  };

  const handleCopy = (message, draftId) => {
    navigator.clipboard.writeText(message);
    setCopyToast(draftId);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const handleStatusUpdate = async (draft, newStatus) => {
    try {
      const now = new Date().toISOString();
      const updates = { status: newStatus };
      if (newStatus === 'sent') {
        updates.sent_at = now;
        updates.follow_up_due_at = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      }
      await base44.entities.OutreachDraft.update(draft.id, updates);
      setDrafts(prev => prev.map(d => d.id === draft.id ? { ...d, ...updates } : d));

      // Sync NetworkingPipeline when marking as sent from the list view
      if (newStatus === 'sent' && user?.email && draft.recipient_name) {
        try {
          const allPipelines = await base44.entities.NetworkingPipeline.list('-created_date', 200);
          const ADVANCED = ['replied', 'coffee_chat', 'interview', 'offer'];
          const match = findPipelineMatch(allPipelines, draft.recipient_name, draft.recipient_company);
          if (match) {
            if (!ADVANCED.includes(match.status)) {
              await base44.entities.NetworkingPipeline.update(match.id, { status: 'reached_out', reached_out_date: now, status_date: now });
            }
          } else {
            await base44.entities.NetworkingPipeline.create({
              user_email: user.email,
              alumni_name: draft.recipient_name,
              alumni_role: draft.recipient_title || '',
              alumni_email: draft.recipient_email || '',
              alumni_linkedin: draft.recipient_linkedin_url || '',
              company: draft.recipient_company || '',
              job_title: draft.job_title || '',
              job_description: draft.message || '',
              job_url: draft.job_url || '',
              status: 'reached_out',
              reached_out_date: now,
              status_date: now,
              alumni_source: 'manual',
            });
          }
          window.dispatchEvent(new CustomEvent('cliff:pipeline-refresh'));
        } catch (e) {
          console.error('Pipeline sync failed:', e);
        }
      }
    } catch (e) {
      console.error('Status update failed:', e);
    }
  };

  const handleDelete = async (draftId) => {
    if (!window.confirm('Delete this draft?')) return;
    try {
      await base44.entities.OutreachDraft.delete(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleGenerateFollowUp = async (draft) => {
    setFollowUpDraft(draft);
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateOutreachMessage', {
        context: 'cff_connection',
        recipientName: draft.recipient_name,
        recipientTitle: draft.recipient_title,
        recipientCompany: draft.recipient_company,
        studentName: user?.full_name || firstName,
        studentMajor: user?.major || '',
        targetRole: user?.career_goals?.target_roles?.[0] || '',
        targetIndustry: user?.career_goals?.target_industries?.[0] || '',
        graduationYear: user?.career_goals?.graduation_year || '',
        school: user?.school_name || 'University of Florida',
        conversationContext: `This is a follow-up to a message sent 5 days ago that hasn't received a reply yet. Original message: "${draft.message?.slice(0, 200)}"`,
      });
      setFollowUpMessage(res?.data?.message || '');
      setPhase('followup');
    } catch (e) {
      console.error('Follow-up generation failed:', e);
    }
    setGenerating(false);
  };

  const handleSendFollowUp = async () => {
    if (!followUpDraft) return;
    navigator.clipboard.writeText(followUpMessage);
    try {
      await base44.entities.OutreachDraft.update(followUpDraft.id, {
        follow_up_sent: true,
      });
      setDrafts(prev => prev.map(d =>
        d.id === followUpDraft.id ? { ...d, follow_up_sent: true } : d
      ));
    } catch (e) {}
    setCopyToast('followup');
    setTimeout(() => {
      setCopyToast(null);
      setPhase('list');
      setFollowUpDraft(null);
    }, 2000);
  };

  const resetForm = () => {
    setForm({ recipientName: '', recipientTitle: '', recipientCompany: '', recipientLinkedinUrl: '', jobTitle: '', jobUrl: '', conversationContext: '' });
    setSelectedContext(null);
    setGeneratedMessage('');
    setEditedMessage('');
  };

  // CLiFF Scout handlers
  const handleScoutAnalyze = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('scoutCompanyTarget', {
        company: form.recipientCompany,
        role: form.recipientTitle || form.jobTitle,
        jobDescription: form.conversationContext,
      });
      if (res?.data?.success) {
        setRecommendedTarget(res.data);
        setScoutPhase('recommendation');
      }
    } catch (e) {
      console.error('Scout failed:', e);
    }
    setGenerating(false);
  };

  const handleTargetConfirmed = async (scoutResult) => {
    // Auto-populate form with target data
    setForm(prev => ({
      ...prev,
      recipientName: scoutResult.recommendedTarget?.name || '',
      recipientTitle: scoutResult.recommendedTarget?.title || '',
      recipientLinkedinUrl: scoutResult.recommendedTarget?.linkedinUrl || '',
    }));
    
    // Skip form entirely - go straight to message generation
    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateOutreachMessage', {
        context: 'cold_outreach',
        recipientName: scoutResult.recommendedTarget?.name || '',
        recipientTitle: scoutResult.recommendedTarget?.title || '',
        recipientCompany: scoutResult.company || form.recipientCompany,
        studentName: user?.full_name || firstName,
        studentMajor: user?.major || '',
        targetRole: user?.career_goals?.target_roles?.[0] || '',
        targetIndustry: user?.career_goals?.target_industries?.[0] || '',
        graduationYear: user?.career_goals?.graduation_year || '',
        school: user?.school_name || 'University of Florida',
        jobTitle: form.jobTitle || '',
        jobUrl: form.jobUrl || '',
        conversationContext: form.conversationContext || `Cold outreach for a role at ${scoutResult.company || form.recipientCompany}`,
      });
      const msg = res?.data?.message || '';
      setGeneratedMessage(msg);
      setEditedMessage(msg);
      setPhase('compose');
    } catch (e) {
      console.error('Generation failed:', e);
    }
    setGenerating(false);
  };

  const inputStyle = {
    width: '100%', fontSize: 14,
    padding: '11px 14px',
    border: '1px solid #E0E0E0',
    borderRadius: 8, background: '#fff',
    color: '#1A1A1A', fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box', outline: 'none',
  };

  const labelStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.1em',
    color: '#888', display: 'block', marginBottom: 6,
  };

  // FastIQ gate — only show when embedded as a component (onOpenUpgrade provided), not as a standalone page route
  if (!isFastIQ && phase === 'list' && typeof onOpenUpgrade === 'function') {
    const handleTryTrial = async () => {
      const activated = await maybeActivateTrial(user);
      if (!activated) onOpenUpgrade?.();
    };
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FFF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✉️</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 12px' }}>Outreach Drafts</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#888', margin: '0 0 32px', lineHeight: 1.6 }}>
          Draft AI-written messages for any outreach context, track who you've contacted, and get follow-up nudges 5 days after sending.
        </p>
        <button onClick={handleTryTrial} style={{ background: '#1e3a5f', border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
          Start Free 7-Day Trial →
        </button>
      </div>
    );
  }

  // Follow-up nudge banner — plain JSX variable (not a component) to avoid remount on every render
  const nudgeBanner = draftsDueFollowUp.length > 0 ? (
    <div style={{
      background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.3)',
      borderRadius: 12, padding: '14px 20px', marginBottom: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1A1A1A', margin: 0 }}>
        ⏰ <strong>{draftsDueFollowUp.length} follow-up{draftsDueFollowUp.length > 1 ? 's' : ''} due</strong> — it's been 5 days since you reached out to {draftsDueFollowUp[0].recipient_name}{draftsDueFollowUp.length > 1 ? ` and ${draftsDueFollowUp.length - 1} others` : ''}.
      </p>
      <button
        onClick={() => handleGenerateFollowUp(draftsDueFollowUp[0])}
        style={{
          background: '#1e3a5f', border: 'none', borderRadius: 8,
          padding: '8px 16px', fontSize: 13, fontWeight: 600,
          color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          whiteSpace: 'nowrap',
        }}
      >
        Draft Follow-up →
      </button>
    </div>
  ) : null;

  // Phase: List
  if (phase === 'list') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate('FreeTierDashboard')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: '#888',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1e3a5f';
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              ← Back
            </button>
            <div>
              <button
                onClick={() => navigate('FreeTierDashboard')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 13,
                  color: '#64748b',
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ← Back
              </button>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#7c3aed', margin: '0 0 8px' }}>
                Outreach Drafts
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' }}>
                Your Outreach Pipeline
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
                {drafts.length} message{drafts.length !== 1 ? 's' : ''} · {drafts.filter(d => d.status === 'sent').length} sent · {drafts.filter(d => d.status === 'replied').length} replied
              </p>
            </div>
          </div>
          <button
            onClick={() => setPhase('new')}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', borderRadius: 10,
              padding: '10px 20px', fontSize: 13, fontWeight: 600,
              color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            + New Draft
          </button>
        </div>

        {/* Follow-up nudge */}
        {nudgeBanner}

        {/* Empty state */}
        {!loading && drafts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            border: '2px dashed #E0E0E0', borderRadius: 16,
          }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>✉️</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
              No outreach yet
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: '0 0 24px' }}>
              Draft your first message and start building your network.
            </p>
            <button
              onClick={() => setPhase('new')}
              style={{
                background: '#1e3a5f', border: 'none', borderRadius: 10,
                              padding: '12px 28px', fontSize: 14, fontWeight: 600,
                              color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Draft First Message →
            </button>
          </div>
        )}

        {/* Draft list */}
        {!loading && drafts.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {drafts.map(draft => {
              const contextInfo = CONTEXTS.find(c => c.id === draft.context);
              const isExpanded = expandedDraft === draft.id;
              const isDueFollowUp = draftsDueFollowUp.find(d => d.id === draft.id);

              return (
                <div key={draft.id} style={{
                  background: '#fff',
                  border: `1px solid ${isDueFollowUp ? 'rgba(232,93,32,0.4)' : '#E5E5E5'}`,
                  borderRadius: 14, overflow: 'hidden',
                }}>
                  {/* Card header */}
                  <div
                    onClick={() => setExpandedDraft(isExpanded ? null : draft.id)}
                    style={{
                      padding: '16px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>
                      {contextInfo?.icon || '✉️'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
                          {draft.recipient_name || 'Unknown'}
                        </p>
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 10, fontWeight: 700,
                          color: STATUS_COLORS[draft.status] || '#888',
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          · {STATUS_LABELS[draft.status]}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
                        {[draft.recipient_title, draft.recipient_company].filter(Boolean).join(' · ')}
                        {draft.sent_at ? ` · Sent ${new Date(draft.sent_at).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                    <span style={{ color: '#CCCCCC', fontSize: 14, flexShrink: 0 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid #F0F0F0', padding: '16px 20px' }}>
                      {/* Message preview */}
                      <div style={{
                        background: '#F9F9F9', borderRadius: 8,
                        padding: '12px 16px', marginBottom: 16,
                      }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#555', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {draft.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCopy(draft.message, draft.id)}
                          style={{
                            background: copyToast === draft.id ? '#22C55E' : '#1e3a5f',
                            border: 'none', borderRadius: 8,
                            padding: '8px 16px', fontSize: 12, fontWeight: 600,
                            color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {copyToast === draft.id ? 'Copied ✓' : 'Copy Message'}
                        </button>

                        {draft.status === 'draft' && (
                          <button
                            onClick={() => handleStatusUpdate(draft, 'sent')}
                            style={{
                              background: 'none', border: '1px solid #F59E0B',
                              borderRadius: 8, padding: '8px 16px',
                              fontSize: 12, fontWeight: 600, color: '#F59E0B',
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            Mark as Sent
                          </button>
                        )}

                        {draft.status === 'sent' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(draft, 'replied')}
                              style={{
                                background: 'none', border: '1px solid #22C55E',
                                borderRadius: 8, padding: '8px 16px',
                                fontSize: 12, fontWeight: 600, color: '#22C55E',
                                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              Mark Replied ✓
                            </button>
                            {!draft.follow_up_sent && (
                              <button
                                onClick={() => handleGenerateFollowUp(draft)}
                                style={{
                                  background: 'none', border: '1px solid #1e3a5f',
                                                                  borderRadius: 8, padding: '8px 16px',
                                                                  fontSize: 12, fontWeight: 600, color: '#1e3a5f',
                                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                }}
                              >
                                Draft Follow-up →
                              </button>
                            )}
                          </>
                        )}

                        {draft.recipient_linkedin_url && (
                          <a
                            href={draft.recipient_linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: 'none', border: '1px solid #0077B5',
                              borderRadius: 8, padding: '8px 16px',
                              fontSize: 12, fontWeight: 600, color: '#0077B5',
                              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                              textDecoration: 'none',
                            }}
                          >
                            Open LinkedIn →
                          </a>
                        )}

                        <button
                          onClick={() => handleDelete(draft.id)}
                          style={{
                            background: 'none', border: 'none',
                            fontSize: 12, color: '#CCCCCC',
                            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                            marginLeft: 'auto',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Phase: New — pick context
  if (phase === 'new') {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <button
          onClick={() => setPhase('list')}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}
        >
          ← Back
        </button>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: '0 0 8px' }}>
          NEW DRAFT
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
          Choose your outreach context
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: '0 0 32px' }}>
          FastIQ will tailor the message to the context.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CONTEXTS.map(ctx => (
            <div
              key={ctx.id}
              onClick={() => { setSelectedContext(ctx.id); setPhase('form'); }}
              style={{
                background: '#fff', border: '1px solid #E5E5E5',
                borderRadius: 12, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14,
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1e3a5f'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E5E5'}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{ctx.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: '0 0 2px' }}>
                  {ctx.label}
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888', margin: 0 }}>
                  {ctx.desc}
                </p>
              </div>
              <span style={{ color: '#CCCCCC', fontSize: 16 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Phase: Scout — CLiFF automated targeting (cold outreach only) - auto-triggers analysis
  if (phase === 'scout' && selectedContext === 'cold_outreach') {
    return (
      <ColdInroadScout
        company={form.recipientCompany}
        role={form.recipientTitle || form.jobTitle}
        onBack={() => { setPhase('list'); setSelectedContext(null); }}
        onTargetConfirmed={handleTargetConfirmed}
      />
    );
  }

  // Phase: Form — automated action panel (alumni context)
  if (phase === 'form') {
    if (selectedContext === 'alumni_search') {
      return (
        <AutomatedAlumniActionPanel
          lead={form}
          user={user}
          generating={generating}
          onBack={() => setPhase('new')}
          onGenerate={handleGenerate}
          onEmailFound={(email) => setForm(p => ({ ...p, recipientEmail: email }))}
        />
      );
    }

    // Other contexts still use form
    const ctx = CONTEXTS.find(c => c.id === selectedContext);
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <button
          onClick={() => setPhase('new')}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}
        >
          ← Back
        </button>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: '0 0 8px' }}>
          {ctx?.icon} {ctx?.label.toUpperCase()}
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 28px' }}>
          Who are you reaching out to?
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Their Name *</label>
              <input
                value={form.recipientName}
                onChange={e => setForm(p => ({ ...p, recipientName: e.target.value }))}
                placeholder="e.g. Jennifer Gomez"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Their Title</label>
              <input
                value={form.recipientTitle}
                onChange={e => setForm(p => ({ ...p, recipientTitle: e.target.value }))}
                placeholder="e.g. Marketing Manager"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Their Company</label>
            <input
              value={form.recipientCompany}
              onChange={e => setForm(p => ({ ...p, recipientCompany: e.target.value }))}
              placeholder="e.g. Disney"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Their Email (optional)</label>
            <input
              value={form.recipientEmail}
              onChange={e => setForm(p => ({ ...p, recipientEmail: e.target.value }))}
              placeholder="e.g. name@company.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Their LinkedIn URL (optional)</label>
            <input
              value={form.recipientLinkedinUrl}
              onChange={e => setForm(p => ({ ...p, recipientLinkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/in/..."
              style={inputStyle}
            />
          </div>

          {selectedContext === 'job_application' && (
            <>
              <div>
                <label style={labelStyle}>Job Title You Applied For</label>
                <input
                  value={form.jobTitle}
                  onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))}
                  placeholder="e.g. Marketing Coordinator"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Job URL</label>
                <input
                  value={form.jobUrl}
                  onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </>
          )}

          <div>
            <label style={labelStyle}>Job Description / Context</label>
            <textarea
              value={form.jobDescription}
              onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
              placeholder="Paste the job description or add context about the role..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {selectedContext === 'thank_you' && (
            <div>
              <label style={labelStyle}>What did you talk about? (optional)</label>
              <textarea
                value={form.conversationContext}
                onChange={e => setForm(p => ({ ...p, conversationContext: e.target.value }))}
                placeholder="e.g. They shared advice about breaking into marketing at large companies..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!form.recipientName || generating}
            style={{
              background: !form.recipientName || generating ? '#F0F0F0' : '#1e3a5f',
              border: 'none', borderRadius: 10,
              padding: '14px', fontSize: 14, fontWeight: 600,
              color: !form.recipientName || generating ? '#CCC' : '#fff',
              cursor: !form.recipientName || generating ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {generating ? '⚡ Drafting your message...' : '⚡ Generate Message →'}
          </button>
        </div>
      </div>
    );
  }

  // Phase: Compose — edit and save
  if (phase === 'compose') {
    const ctx = CONTEXTS.find(c => c.id === selectedContext);
    const isLinkedIn = selectedContext === 'alumni_search';
    const hasEmail = !!form.recipientEmail; // Only enforce limit if no email found
    
    // Determine if this is LinkedIn-only route (no email)
    const isLinkedInRoute = selectedContext === 'alumni_search' && !form.recipientEmail;
    
    // Parse the JSON output from LLM
    let draftSubject = '';
    let draftBody = '';
    try {
      const cleanRawText = editedMessage.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanRawText);
      draftSubject = parsed.subject || '';
      draftBody = parsed.body || '';
    } catch (e) {
      // If JSON parsing fails, treat entire message as body
      draftBody = editedMessage;
    }

    // For LinkedIn route, only count body (no subject)
    // For email route, count both subject and body
    const messageLength = isLinkedInRoute ? draftBody.length : (draftSubject + draftBody).length;
    const enforceLimit = isLinkedInRoute;
    const exceedsLimit = enforceLimit && messageLength > 300;

    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <button
          onClick={() => setPhase('form')}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}
        >
          ← Regenerate
        </button>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', margin: '0 0 8px' }}>
          YOUR DRAFT
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
          To {form.recipientName}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 8px' }}>
          {ctx?.icon} {ctx?.label} · Edit freely before sending
        </p>

        {/* Inline destination status badge */}
        {selectedContext === 'alumni_search' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, color: '#666' }}>Destination:</span>
            {form.recipientEmail ? (
              <span style={{
                padding: '5px 10px',
                background: '#DCFCE7',
                color: '#166534',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid #86EFAC',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                📧 {form.recipientEmail}
              </span>
            ) : (
              <span style={{
                padding: '5px 10px',
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid #FCD34D',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                💼 LinkedIn InMail
              </span>
            )}
          </div>
        )}

        {enforceLimit && (
          <div style={{
            background: exceedsLimit ? '#FEE2E2' : '#E8F4FD',
            border: `1px solid ${exceedsLimit ? '#FCA5A5' : '#B3D9FF'}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: exceedsLimit ? '#DC2626' : '#0057B8', margin: 0 }}>
              LinkedIn connection requests are limited to 300 characters.
            </p>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, fontWeight: 700,
              color: exceedsLimit ? '#EF4444' : '#0057B8',
              marginLeft: 'auto', flexShrink: 0,
            }}>
              {messageLength}/300
            </span>
          </div>
        )}

        {form.recipientEmail && (
          <div style={{
            background: '#F0F7FF',
            border: '1px solid #B3D9FF',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 14 }}>✓</span>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#0057B8', margin: 0 }}>
              Email verified — message can be longer for direct email outreach
            </p>
          </div>
        )}

        {/* Subject field — hidden for LinkedIn-only route */}
        {draftSubject && !isLinkedInRoute && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...labelStyle, marginBottom: 8 }}>Subject:</label>
            <input
              value={draftSubject}
              onChange={e => {
                const newSubject = e.target.value;
                const updatedMsg = JSON.stringify({
                  subject: newSubject,
                  body: draftBody
                });
                setEditedMessage(updatedMsg);
              }}
              style={{
                ...inputStyle,
                fontSize: 13,
                fontWeight: 500,
              }}
            />
          </div>
        )}

        {/* Body field */}
        <textarea
          value={draftBody}
          onChange={e => {
            const newBody = isLinkedInRoute && e.target.value.length > 300
              ? e.target.value.substring(0, 300)
              : e.target.value;
            const updatedMsg = JSON.stringify({
              subject: draftSubject,
              body: newBody
            });
            setEditedMessage(updatedMsg);
          }}
          rows={8}
          style={{
            ...inputStyle,
            resize: 'vertical',
            lineHeight: 1.7,
            marginBottom: 16,
            border: exceedsLimit ? '1px solid #EF4444' : '1px solid #E0E0E0',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleSaveDraft('draft')}
            disabled={saving}
            style={{
              background: 'none', border: '1px solid #CBD5E1',
              borderRadius: 10, padding: '14px 20px',
              fontSize: 13, fontWeight: 500, color: '#475569',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            Save as Draft
          </button>
          <button
            onClick={async () => {
              handleCopy(editedMessage, 'compose');
              await new Promise(r => setTimeout(r, 800));
              handleSaveDraft('sent');
            }}
            disabled={saving}
            style={{
              background: copyToast === 'compose' ? '#22C55E' : '#1e3a5f',
              border: 'none', borderRadius: 10,
              padding: '14px 24px', fontSize: 13, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", flex: 1,
            }}
          >
            {copyToast === 'compose' ? 'Copied ✓ — Saved!' : 'Copy & Mark Sent →'}
          </button>
        </div>

        {/* Explicit "how to send" step so students always know what to do next */}
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#888',
          margin: '14px 0 0', textAlign: 'center', lineHeight: 1.6,
        }}>
          {form.recipientEmail
            ? <>Copy your message, then email it to <strong>{form.recipientEmail}</strong> — or use the button below.</>
            : <>No email found for them — copy your message, open their LinkedIn, and paste it into a connection request or InMail.</>}
        </p>

        {form.recipientEmail && (
          <a
            href={`mailto:${form.recipientEmail}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`}
            style={{
              display: 'block', textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: '#166534',
              marginTop: 10, textDecoration: 'none', fontWeight: 600,
            }}
          >
            ✉️ Open Email to {form.recipientName?.split(' ')[0] || 'them'} →
          </a>
        )}

        {form.recipientLinkedinUrl && (
          <a
            href={form.recipientLinkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12, color: '#0077B5',
              marginTop: 12, textDecoration: 'none', fontWeight: 600,
            }}
          >
            Open LinkedIn Profile →
          </a>
        )}
      </div>
    );
  }

  // Phase: Follow-up
  if (phase === 'followup' && followUpDraft) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <button
          onClick={() => { setPhase('list'); setFollowUpDraft(null); }}
          style={{ background: 'none', border: 'none', fontSize: 13, color: '#888', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 24 }}
        >
          ← Back
        </button>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', margin: '0 0 8px' }}>
          FOLLOW-UP DRAFT
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' }}>
          Following up with {followUpDraft.recipient_name}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', margin: '0 0 24px' }}>
          It's been 5 days — here's a gentle follow-up.
        </p>

        {generating ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid rgba(30,58,95,0.15)',
              borderTop: '3px solid #1e3a5f',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888' }}>
              Drafting your follow-up...
            </p>
          </div>
        ) : (
          <>
            <textarea
              value={followUpMessage}
              onChange={e => setFollowUpMessage(e.target.value)}
              rows={6}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, marginBottom: 16 }}
            />
            <button
              onClick={handleSendFollowUp}
              style={{
                background: copyToast === 'followup' ? '#22C55E' : '#1e3a5f',
                border: 'none', borderRadius: 10,
                padding: '14px', fontSize: 14, fontWeight: 600,
                color: '#fff', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif", width: '100%',
              }}
            >
              {copyToast === 'followup' ? 'Copied ✓' : 'Copy Follow-up →'}
            </button>
          </>
        )}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return null;
}
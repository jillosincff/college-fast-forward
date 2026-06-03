import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CliffLogo } from '@/components/brand/CliffLogo';
import CliFFOutreachModal from './CliFFOutreachModal';

const dm = "'DM Sans', system-ui, sans-serif";

const STARTER_PROMPTS = [
  "Who do we have at Spotify or Disney?",
  "Any alumni with a marketing background?",
  "How do I follow up after an interview without being annoying?",
];

export default function PremiumHiringChat({ user, selectedSignal, selectedJob }) {
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const schoolAbbr = user?.school_abbreviation || user?.school_code?.toUpperCase() || 'your university';

  const defaultGreeting = `Hi ${firstName}! 📎 I'm CliFF, your CFF Career Agent. Ask me anything — tricky interview follow-ups, salary negotiations, or how to reach out to that alum at your target company. I'm locked in 24/7.`;

  const [messages, setMessages] = useState([{ role: 'agent', text: defaultGreeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [parentMatch, setParentMatch] = useState(null);
  const [matchDismissed, setMatchDismissed] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [interviewDismissed, setInterviewDismissed] = useState(false);
  const [recapLoaded, setRecapLoaded] = useState(false);
  const [recapAction, setRecapAction] = useState(null);
  const [outreachContext, setOutreachContext] = useState(null);
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [outreachModalData, setOutreachModalData] = useState(null);
  const bottomRef = useRef(null);

  // Intent detection: returns { isNetworkQuery, networkType, company, industry }


  const handleInlineInsiderClick = (contact) => {
    setOutreachModalData({
      name: contact.fullName,
      title: contact.currentRole,
      company: contact.companyName,
    });
    setOutreachModalOpen(true);
  };

  // On mount — run pipeline-based coaching or recap context check
  useEffect(() => {
    if (!user?.id || recapLoaded) return;

    const loadPipelineCoaching = async () => {
      try {
        const recapRes = await base44.functions.invoke('getAgentRecapContext', {});
        const recap = recapRes?.data ?? recapRes ?? {};
        const pipelineCount = recap.metrics?.totalInPipeline || 0;
        const schoolAbbr = recap.schoolAbbreviation || schoolAbbr;

        if (recap.actionItem && recap.actionItem.type === 'STALE_APPLICATION') {
          // Smart CRM nudge: stale application detected
          const daysStale = recap.actionItem.daysStale || 5;
          const greeting = `Hey ${firstName}! 📎 I'm monitoring your pipeline — you have ${pipelineCount} active opportunities tracked.\n\n⚠️ **Nudge Alert**: Your application for **${recap.actionItem.companyName}** has been sitting for ${daysStale} days without activity. Let's send an elegant check-in to bypass the cold portal.\n\nYour Sprint Objective Today: Deploy a scout to find backdoors for your top targets (Spotify, BuzzFeed, or Warner Bros Discovery), or tap below to draft a follow-up for ${recap.actionItem.companyName}.`;
          setMessages([{ role: 'agent', text: greeting }]);
          setRecapAction(recap.actionItem);
        } else if (pipelineCount > 0) {
          // Active pipeline coaching
          const targetCompanies = ['Spotify', 'BuzzFeed', 'Warner Bros Discovery'];
          const greeting = `Hey ${firstName}! 📎 I'm monitoring your pipeline — you have **${pipelineCount} active opportunities** saved.\n\nYour main sprint objective today is deploying a scout to find backdoors for **${targetCompanies.join(', ')}**, or ask me how to prep for an upcoming conversation!\n\nPick a target above, or tap below to draft outreach for your top priority.`;
          setMessages([{ role: 'agent', text: greeting }]);
          setRecapAction({ type: 'PIPELINE_COACHING', pipelineCount });
        } else if (recap.actionItem) {
          // Fallback to original recap logic
          const companyText = recap.actionItem.companyName || 'your top target';
          if (recap.actionItem.type === 'DRAFT_ALUMNI_OUTREACH' && recap.actionItem.alumniCount > 0) {
            const greeting = `Welcome back, ${recap.studentName || firstName}! 📎 Quick recap: We found ${recap.actionItem.alumniCount} ${schoolAbbr} alumni at ${companyText}. Let's draft a backdoor message to get your resume pulled from the black hole.`;
            setMessages([{ role: 'agent', text: greeting }]);
            setRecapAction(recap.actionItem);
          } else {
            const greeting = `Hi ${firstName}! 📎 I'm CLiFF, your career agent. Your pipeline is looking clean — let's load some warm leads or I can help with interview prep, salary negotiations, or outreach scripts.`;
            setMessages([{ role: 'agent', text: greeting }]);
          }
        } else {
          const greeting = `Hi ${firstName}! 📎 I'm CLiFF, your career agent. Ask me anything — interview follow-ups, salary negotiations, or how to reach out to that alum at your target company. I'm locked in 24/7.`;
          setMessages([{ role: 'agent', text: greeting }]);
        }
      } catch (err) {
        console.error('Failed to load pipeline coaching:', err);
      } finally {
        setRecapLoaded(true);
      }
    };

    loadPipelineCoaching();
  }, [user?.id, recapLoaded]);

  // Secondary checks — only run if no recap action was found
  useEffect(() => {
    if (!user?.id || recapLoaded) return;

    Promise.all([
      base44.functions.invoke('checkUpcomingInterviews', {}).catch(() => null),
      base44.functions.invoke('getDashboardParentMatch', {}).catch(() => null),
    ]).then(([intRes, parentRes]) => {
      const interview = intRes?.data ?? intRes ?? {};
      const parentD = parentRes?.data ?? parentRes ?? {};

      if (interview?.has_upcoming && interview?.interview) {
        setInterviewData(interview.interview);
        const { company, role } = interview.interview;
        const roleStr = role ? ` for the ${role} role` : '';
        const greeting = `Hey ${firstName}! 📎 I noticed you have an interview coming up${roleStr} at ${company}. Let's make sure you're absolutely locked in.\n\nWant to run a quick 10-minute mock interview right now to prep for the questions they're going to throw at you?`;
        setMessages([{ role: 'agent', text: greeting }]);
      } else if (parentD?.match_found && parentD?.parent) {
        setParentMatch(parentD);
        const { parent, industry, school_code } = parentD;
        const school = school_code || schoolAbbr;
        const greeting = `Hey ${firstName}! 📎 I was just scanning our network and found a ${school} parent — ${parent.first_name}, a ${parent.role_title} at ${parent.company_name}. They've explicitly opted in to backchanneling resumes and mentoring students in ${industry}. Want to connect with them for insider advice or a warm referral?`;
        setMessages([{ role: 'agent', text: greeting }]);
      }
    });
  }, [user?.id, recapLoaded]);

  // Reset greeting when a Ghost Risk Meter "Bypass" job is selected
  useEffect(() => {
    if (!selectedJob) return;
    const { title, companyName, riskLevel, daysLive, totalAlumni, parentConnections } = selectedJob;

    let greeting;
    if (riskLevel === 'HIGH') {
      const alumniLine = totalAlumni ? `there are ${totalAlumni} ${schoolAbbr} grads there` : "let's find alumni contacts";
      const parentLine = parentConnections ? ` and ${parentConnections} parent backdoor${parentConnections > 1 ? 's' : ''}` : '';
      greeting = `Hey ${firstName}! 🛑 That listing for ${title}${companyName ? ` at ${companyName}` : ''} has been live for ${daysLive} days — cold applications are hitting a black hole right now.\n\nDon't apply blind. Here's the play: ${alumniLine}${parentLine}. Want me to draft a targeted outreach that bypasses the queue entirely?`;
    } else if (riskLevel === 'MEDIUM') {
      greeting = `Hey ${firstName}! ⚠️ The **${title}${companyName ? ` at ${companyName}` : ''}** listing is ${daysLive} days old — it's filling up fast.\n\nBest move: apply AND hit the network simultaneously. ${totalAlumni ? `I see ${totalAlumni} ${schoolAbbr} grads there` : 'Let me find warm contacts'}. Want me to draft a backdoor outreach to run alongside your application?`;
    } else {
      greeting = `Hey ${firstName}! ⏱️ Great timing — **${title}${companyName ? ` at ${companyName}` : ''}** just dropped${daysLive !== null ? ` ${daysLive} day${daysLive !== 1 ? 's' : ''} ago` : ''}. Your resume has a high chance of landing at the top.\n\n${totalAlumni ? `There are ${totalAlumni} ${schoolAbbr} grads there too.` : ''} Want me to tailor your pitch for this specific role before you apply?`;
    }

    setMessages([{ role: 'agent', text: greeting }]);
    setInput('');
  }, [selectedJob]);

  // Listen for outreach requests from job cards
  useEffect(() => {
    const handleOutreachRequest = (event) => {
      const ctx = event.detail;
      if (!ctx) return;
      setOutreachContext(ctx);
      
      // Generate auto-greeting with outreach draft
      const greeting = `Welcome back! 📎 I see you want to reach out to **${ctx.recipientName}** at **${ctx.company}**.\n\nI've cooked up an authentic, un-cringe outreach draft leveraging your shared ${ctx.schoolNetwork} network:\n\n---\n\n**Subject:** Fellow ${ctx.schoolNetwork.replace('University of ', '')} / Quick question about ${ctx.company}\n\nHi ${ctx.recipientName.split(' ')[0]},\n\nI saw your path from ${ctx.schoolNetwork} to ${ctx.company}—love what you've done there. I'm a current ${ctx.schoolNetwork} student and would love to grab 10 mins to hear how you made the jump from Gainesville to the team.\n\nGo Gators,\n${user?.full_name || '[Your Name]'}\n\n---\n\n📋 Want me to tweak anything or make it punchier?`;
      
      setMessages([{ role: 'agent', text: greeting }]);
      setRecapAction({ type: 'OUTREACH_DRAFT_READY', context: ctx });
    };

    window.addEventListener('cliff:outreach-request', handleOutreachRequest);
    return () => window.removeEventListener('cliff:outreach-request', handleOutreachRequest);
  }, [user?.full_name]);

  // Listen for CRM nudge triggers from pipeline
  useEffect(() => {
    const handleNudgeTriggered = (event) => {
      const { lead, nudgeType, daysStale, companyName, role } = event.detail;
      if (!lead || !companyName) return;

      let greeting;
      if (nudgeType === 'FOLLOW_UP') {
        greeting = `Hey ${firstName}! ⏰ I noticed you haven't heard back from **${companyName}** after **${daysStale} days**.\n\nLet's send an elegant check-in prompt to bypass the cold portal. Here's what I recommend:\n\n---\n\n**Subject:** Following up on ${role} application\n\nHi [Recruiter Name],\n\nI hope this message finds you well. I wanted to briefly follow up on my application for the ${role} position at ${companyName}, submitted about ${daysStale} days ago.\n\nI remain incredibly enthusiastic about this opportunity and would love to discuss how my background aligns with your team's needs.\n\nBest regards,\n${user?.full_name || '[Your Name]'}\n\n---\n\n📋 Want me to adjust the tone or make it more specific?`;
      } else if (nudgeType === 'THANK_YOU') {
        greeting = `Hey ${firstName}! ⚡ It's been **${daysStale} days** since your last update for **${companyName}**.\n\nLet's send a thoughtful thank-you or status update to keep the momentum going:\n\n---\n\n**Subject:** Thank you / Quick update\n\nHi [Interviewer Name],\n\nThank you again for taking the time to speak with me about the ${role} opportunity at ${companyName}. I really enjoyed learning more about [specific topic from interview].\n\nI wanted to share a quick update: [brief relevant update or continued enthusiasm].\n\nLooking forward to hearing from you.\n\nBest,\n${user?.full_name || '[Your Name]'}\n\n---\n\n📋 Want me to personalize this further?`;
      }

      setMessages([{ role: 'agent', text: greeting }]);
      setRecapAction({ type: 'NUDGE_FOLLOW_UP', companyName, role, nudgeType });
    };

    window.addEventListener('cliff:nudge-triggered', handleNudgeTriggered);
    return () => window.removeEventListener('cliff:nudge-triggered', handleNudgeTriggered);
  }, [user?.full_name]);

  // Email sync suggestion — shown after user manually adds applications or when no recap/interview/parent match is found
  useEffect(() => {
    if (!user?.id || recapLoaded || interviewData || parentMatch || selectedJob || selectedSignal || outreachContext) return;
    
    // Only suggest if user hasn't synced email yet
    if (user?.is_email_synced) return;

    const checkAndSuggest = async () => {
      try {
        // Check if user has recent applications
        const applications = await base44.entities.JobApplication.filter({ user_id: user.id }, '-created_date', 5);
        const recentApps = applications?.filter(a => {
          const createdDate = new Date(a.created_date);
          const now = new Date();
          const hoursDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
          return hoursDiff < 24; // Added in last 24 hours
        });

        if (recentApps && recentApps.length > 0) {
          const greeting = `Hey ${firstName}! 📎 I just logged your new application. To save you some time moving forward, you can sync your inbox directly from the banner at the top of your dashboard. Once connected, I can automatically watch for interview dates and updates from companies, so you never have to drag a card manually again. Want me to open the setup?`;
          setMessages([{ role: 'agent', text: greeting }]);
          
          // Add action button
          setTimeout(() => {
            setRecapAction({ type: 'SYNC_EMAIL_PROMPT' });
          }, 100);
        }
      } catch (err) {
        console.error('Failed to check applications:', err);
      }
    };

    const timeoutId = setTimeout(checkAndSuggest, 2000);
    return () => clearTimeout(timeoutId);
  }, [user?.id, recapLoaded, interviewData, parentMatch, selectedJob, selectedSignal]);

  // Reset greeting whenever a coffee-chat signal is selected
  useEffect(() => {
    if (!selectedSignal) return;
    const { company, alumniCount, parentCount, sampleConnections } = selectedSignal;

    const parentContact = (sampleConnections || []).find(c => c.connection_type === 'parent');
    const alumContact = (sampleConnections || []).find(c => c.connection_type === 'alum');

    let greeting;
    if (parentCount > 0 && parentContact) {
      greeting = `Hi ${firstName}! 📎 I found a ${schoolAbbr} parent — ${parentContact.name}, ${parentContact.role_title} at ${company}. Parents who've opted into our network are 10× more likely to pick up the phone. Let me write them a targeted, warm message that leads with your ${schoolAbbr} connection. Just say "write it" and I'll draft it now.`;
    } else if (parentCount > 0) {
      greeting = `Hi ${firstName}! 📎 There ${parentCount === 1 ? 'is' : 'are'} ${parentCount} opted-in ${schoolAbbr} parent${parentCount > 1 ? 's' : ''} at ${company} — these are your highest-conversion contacts. Want me to write a targeted outreach that opens with your shared ${schoolAbbr} connection?`;
    } else if (alumniCount > 0 && alumContact) {
      greeting = `Hi ${firstName}! 📎 I'm looking at ${company} — ${alumniCount} ${schoolAbbr} grads work there. I found ${alumContact.name} (${alumContact.role_title}) as a warm lead. Want me to draft a concise coffee chat request that's personalized to their background? Just say "write it."`;
    } else if (alumniCount > 0) {
      greeting = `Hi ${firstName}! 📎 There are ${alumniCount} ${schoolAbbr} grads at ${company}. Want me to draft a warm coffee chat outreach — short, personal, and impossible to ignore?`;
    } else {
      greeting = `Hi ${firstName}! 📎 I'm on ${company} for you. No direct contacts mapped yet, but I can write a cold outreach that still feels warm based on your background. Ready to craft your pitch?`;
    }

    setMessages([{ role: 'agent', text: greeting }]);
    setInput('');
  }, [selectedSignal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);

    // Intent intercept: is this a network query?


    // Default: CLIFF agent
    try {
      const res = await base44.functions.invoke('cliffCareerAgent', { message: q });
      const reply = res?.data?.response || "I'm here to help! What can I do for you today?";
      setMessages(prev => [...prev, { role: 'agent', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'agent', text: "I had trouble processing that request. Please try rephrasing, or ask me something else." }]);
    }
    setLoading(false);
  };

  return (
    <>
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22, animation: 'clipBounce 2s ease-in-out infinite' }}>📎</span>
          <style>{`@keyframes clipBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
          <div>
            <div style={{ marginBottom: 2 }}>
              <CliffLogo size="text-lg" />
            </div>
            <p style={{ fontFamily: dm, fontSize: 10, color: '#cbd5e1', margin: 0, letterSpacing: '0.03em', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Your CFF Career Agent</p>
          </div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(6,78,59,0.5)', border: '1px solid #065f46', borderRadius: 6, padding: '4px 10px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Online 24/7</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: '14px 16px', maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '82%',
              background: m.role === 'user' ? '#0A0A0A' : '#f9fafb',
              color: m.role === 'user' ? '#fff' : '#111827',
              border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
              borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '10px 14px',
            }}>
              <p style={{ fontFamily: dm, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{m.text}</p>
            </div>

            {/* Inline Contact Grid — rendered when CLiFF returns network results */}
            {m.role === 'agent' && m.inlineContacts?.length > 0 && (
              <div style={{ maxWidth: '92%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {m.inlineContacts.map((contact, ci) => (
                  <div key={ci} style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{contact.fullName}</span>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 100,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: contact.networkType === 'PARENT' ? '#fef3c7' : '#ede9fe',
                          color: contact.networkType === 'PARENT' ? '#92400e' : '#6d28d9',
                        }}>
                          {contact.networkType === 'PARENT' ? '💼 Parent Network' : `🐊 ${schoolAbbr} Alum`}
                        </span>
                      </div>
                      <p style={{ fontFamily: dm, fontSize: 11, color: '#64748b', margin: 0 }}>
                        {contact.currentRole} · {contact.companyName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleInlineInsiderClick(contact)}
                      style={{
                        fontFamily: dm,
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 10px',
                        cursor: 'pointer',
                        minHeight: 'auto',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Find Insider →
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Interview prep action buttons — shown only under the first agent message */}
            {i === 0 && m.role === 'agent' && interviewData && !interviewDismissed && messages.length <= 1 && (
              <div style={{ marginTop: 8, background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 12, padding: '10px 12px', maxWidth: '82%' }}>
                <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 700, color: '#4f46e5', margin: '0 0 8px' }}>🎯 Recommended Prep Event Triggered</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setInterviewDismissed(true);
                      const params = new URLSearchParams({ company: interviewData.company });
                      if (interviewData.role) params.set('role', interviewData.role);
                      window.location.hash = `#MockInterview?${params.toString()}`;
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    🎙️ Start Practice Session
                  </button>
                  <button
                    onClick={() => setInterviewDismissed(true)}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}

            {/* Parent match action buttons — shown only under the first agent message */}
            {i === 0 && m.role === 'agent' && parentMatch && !matchDismissed && messages.length <= 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setMatchDismissed(true);
                    sendMessage(`Yes, draft an opener for ${parentMatch.parent.first_name} at ${parentMatch.parent.company_name}`);
                  }}
                  style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                  onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                >
                  ⚡ Yes, draft an opener
                </button>
                <button
                  onClick={() => setMatchDismissed(true)}
                  style={{ fontFamily: dm, fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#f1f5f9', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                >
                  Not right now
                </button>
              </div>
            )}

            {/* Recap action buttons — shown only under the first agent message */}
            {i === 0 && m.role === 'agent' && recapAction && messages.length <= 1 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {/* Pipeline Coaching - General */}
                {recapAction.type === 'PIPELINE_COACHING' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      sendMessage('Help me prioritize which company to target first from my pipeline');
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    🎯 Prioritize My Pipeline
                  </button>
                )}
                {/* Stale Application Nudge */}
                {recapAction.type === 'STALE_APPLICATION' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      sendMessage(`Draft a follow-up message for my application at ${recapAction.companyName}`);
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#f97316', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
                  >
                    ⏰ Draft Follow-up for {recapAction.companyName}
                  </button>
                )}
                {/* Scenario A: Alumni connections exist */}
                {recapAction.type === 'DRAFT_ALUMNI_OUTREACH' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      sendMessage(`Draft a personalized outreach script for a verified alum at ${recapAction.companyName}`);
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    ⚡ Draft Alumni Intro Script
                  </button>
                )}
                {/* Scenario B: Parent advisors available */}
                {recapAction.type === 'DRAFT_PARENT_OUTREACH' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      sendMessage(`Draft a message to parent advisors for career guidance at ${recapAction.companyName}`);
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    💡 Ask Parent for Advice
                  </button>
                )}
                {/* Scenario C: Zero connections - show alternate targets */}
                {recapAction.type === 'VIEW_CAROUSEL_MATCHES' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      window.location.hash = '#FreeTierDashboard?tab=matches';
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    🛰️ View Connected Matches
                  </button>
                )}
                {/* Outreach draft ready - copy to clipboard */}
                {recapAction.type === 'OUTREACH_DRAFT_READY' && (
                  <button
                    onClick={() => {
                      const ctx = recapAction.context;
                      const draft = `Subject: Fellow ${ctx.schoolNetwork.replace('University of ', '')} / Quick question about ${ctx.company}\n\nHi ${ctx.recipientName.split(' ')[0]},\n\nI saw your path from ${ctx.schoolNetwork} to ${ctx.company}. I'm a current ${ctx.schoolNetwork} student and would love to grab 10 mins to hear how you made the jump.\n\nGo Gators,\n${user?.full_name || '[Your Name]'}`;
                      navigator.clipboard.writeText(draft);
                      setRecapAction(null);
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    📋 Copy Draft
                  </button>
                )}
                {/* Nudge follow-up - copy to clipboard */}
                {recapAction.type === 'NUDGE_FOLLOW_UP' && (
                  <button
                    onClick={() => {
                      const draft = recapAction.nudgeType === 'FOLLOW_UP'
                        ? `Subject: Following up on ${recapAction.role} application\n\nHi [Recruiter Name],\n\nI hope this message finds you well. I wanted to briefly follow up on my application for the ${recapAction.role} position at ${recapAction.companyName}, submitted about 5 days ago.\n\nI remain incredibly enthusiastic about this opportunity and would love to discuss how my background aligns with your team's needs.\n\nBest regards,\n${user?.full_name || '[Your Name]'}`
                        : `Subject: Thank you / Quick update\n\nHi [Interviewer Name],\n\nThank you again for taking the time to speak with me about the ${recapAction.role} opportunity at ${recapAction.companyName}. I really enjoyed learning more about the team.\n\nI wanted to share a quick update on my end. Looking forward to hearing from you.\n\nBest,\n${user?.full_name || '[Your Name]'}`;
                      navigator.clipboard.writeText(draft);
                      setRecapAction(null);
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#f97316', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
                  >
                    📋 Copy Follow-up Draft
                  </button>
                )}
                {/* Legacy / fallback scenarios */}
                {recapAction.type === 'FRESH_FEED_LOOKUP' && (
                  <button
                    onClick={() => {
                      setRecapAction(null);
                      const signalsEl = document.querySelector('[data-signals]');
                      signalsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    🔍 Explore Live Feed
                  </button>
                )}
                {recapAction.type === 'SYNC_EMAIL_PROMPT' && (
                  <button
                    onClick={async () => {
                      setRecapAction(null);
                      try {
                        const res = await base44.functions.invoke('getEmailOAuthUrl', {});
                        const oauthUrl = res?.data?.url || res?.url;
                        if (oauthUrl) window.open(oauthUrl, '_blank');
                      } catch (err) {
                        alert('Email sync is temporarily unavailable.');
                      }
                    }}
                    style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#fff', background: '#4f46e5', border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', minHeight: 'auto', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    ⚡ Open Email Sync Setup
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '14px 14px 14px 4px', width: 'fit-content' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9ca3af', animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STARTER_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              style={{ fontFamily: dm, fontSize: 11, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', minHeight: 'auto', textAlign: 'left', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask anything — interview, salary, outreach..."
          style={{ flex: 1, fontFamily: dm, fontSize: 12, color: '#374151', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', outline: 'none', minHeight: 'auto' }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ fontFamily: dm, fontSize: 12, fontWeight: 700, color: '#fff', background: input.trim() && !loading ? '#0A0A0A' : '#d1d5db', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', minHeight: 'auto', whiteSpace: 'nowrap', transition: 'background 0.15s' }}
        >
          Send →
        </button>
      </div>
    </div>

    {/* Outreach Modal — pre-filled from inline contact card click */}
    <CliFFOutreachModal
      isOpen={outreachModalOpen}
      onClose={() => setOutreachModalOpen(false)}
      initialData={outreachModalData}
      onGenerate={(formData) => {
        setOutreachModalOpen(false);
        sendMessage(`Draft a personalized outreach message for ${formData.name}, ${formData.title} at ${formData.company}`);
      }}
    />
    </>
  );
}
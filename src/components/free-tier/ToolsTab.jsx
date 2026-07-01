import { navigate } from '@/components/utils/navigation';
import { MessageCircle, FileText, Mic, Linkedin, Brain, Mail } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

const TOOLS = [
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'CLIFF AI Chat',
    desc: 'Your AI hiring companion. Get instant answers on resumes, interviews, networking, and job search strategy.',
    cta: 'Start Chatting',
    route: 'cliff-chat',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    premium: false,
  },
  {
    id: 'resume',
    icon: FileText,
    title: 'Resume Studio',
    desc: 'Upload, tailor, and optimize your resume for any job description with AI-powered ATS matching.',
    cta: 'Open Resume Studio',
    route: 'ResumeTailoring',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    id: 'mock_interview',
    icon: Mic,
    title: 'Mock Interviews',
    desc: 'Practice with CLiFF AI — behavioral, technical, and case interviews tailored to your target roles.',
    cta: 'Start Practicing',
    route: 'MockInterview',
    accent: '#6d28d9',
    bg: '#faf5ff',
    border: '#e9d5ff',
  },
  {
    id: 'linkedin',
    icon: Linkedin,
    title: 'LinkedIn Optimizer',
    desc: 'Get a full review of your LinkedIn profile and specific rewrites for your headline, about section, and more.',
    cta: 'Review My Profile',
    route: 'LinkedInReview',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    id: 'career_assessment',
    icon: Brain,
    title: 'Career Archetype',
    desc: 'Discover your unique career archetype — how you think, what drives you, and which roles you\'re built for.',
    cta: 'Take Assessment',
    route: 'CareerAssessment',
    accent: '#6d28d9',
    bg: '#faf5ff',
    border: '#e9d5ff',
  },
  {
    id: 'outreach',
    icon: Mail,
    title: 'Outreach Drafts',
    desc: 'AI-generated outreach messages for alumni and hiring managers — ready to send.',
    cta: 'View Drafts',
    route: 'OutreachDrafts',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
];

export default function ToolsTab({ user, onUpgrade }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <h2 style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          Your Career Tools
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          Everything you need to land the interview — resumes, interviews, and outreach, all in one place.
        </p>
      </div>

      {/* Tool cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }} className="tools-grid">
        {TOOLS.map(tool => (
          <div
            key={tool.id}
            onClick={() => navigate(tool.route)}
            style={{
              background: '#fff',
              border: `1px solid ${tool.border}`,
              borderRadius: 16,
              padding: 20,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 6px 20px ${tool.accent}22`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: tool.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <tool.icon size={20} color={tool.accent} />
              </div>
              <h3 style={{ fontFamily: dm, fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>
                {tool.title}
              </h3>
            </div>

            {/* Description */}
            <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6, flex: 1 }}>
              {tool.desc}
            </p>

            {/* CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: dm, fontSize: 12, fontWeight: 700, color: tool.accent,
            }}>
              {tool.cta}
              <span style={{ fontSize: 14 }}>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Premium teaser */}
      <div
        onClick={() => onUpgrade?.('Hiring Expert Chat')}
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
          borderRadius: 16, padding: 20, cursor: 'pointer',
          border: '1px solid #1e293b', marginTop: 8,
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}
      >
        <MessageCircle size={28} color="#818cf8" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontFamily: dm, fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
            Hiring Experts Chat
          </p>
          <p style={{ fontFamily: dm, fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Chat with CLiFF AI to draft intros, prep for interviews, and get real-time career guidance.
          </p>
        </div>
        <span style={{
          fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#818cf8',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 100, padding: '4px 12px', whiteSpace: 'nowrap',
        }}>
          PREMIUM
        </span>
      </div>
    </div>
  );
}
import { navigate } from '@/components/utils/navigation';
import { MessageCircle, FileText, Mic, Linkedin, Brain, Mail } from 'lucide-react';

const dm = "'DM Sans', system-ui, sans-serif";

// Secondary, deliberately low-key Toolbox. CLIFF already routes students through
// jobs and Today's Best Moves — this page is standalone direct access only.
// Tools opened from a job workspace arrive preloaded with that job's context;
// entries here open the tool with no job context.
const GROUPS = [
  {
    label: 'Primary tools',
    tools: [
      { id: 'chat', icon: MessageCircle, title: 'Ask CLIFF', desc: 'Ask about any job, application or career decision.', route: 'cliff-chat' },
      { id: 'resume', icon: FileText, title: 'Resume Studio', desc: 'Manage your master resume or tailor one without starting from a job.', route: 'ResumeTailoring' },
      { id: 'mock_interview', icon: Mic, title: 'Mock Interviews', desc: 'Practice for a role or upcoming interview.', route: 'MockInterview' },
    ],
  },
  {
    label: 'Profile & exploration',
    tools: [
      { id: 'linkedin', icon: Linkedin, title: 'LinkedIn Optimizer', desc: 'Get a full review of your LinkedIn profile with specific rewrites.', route: 'LinkedInReview' },
      { id: 'career_assessment', icon: Brain, title: 'Career Archetype', desc: 'Discover how you think, what drives you, and which roles fit.', route: 'CareerAssessment' },
    ],
  },
  {
    label: 'Saved work',
    tools: [
      { id: 'outreach', icon: Mail, title: 'Outreach Drafts', desc: 'Review messages CLIFF has already prepared.', route: 'OutreachDrafts' },
    ],
  },
];

function ToolRow({ tool }) {
  const Icon = tool.icon;
  return (
    <div
      onClick={() => navigate(tool.route)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '12px 16px', cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.background = '#fdfcff'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.99)'; e.currentTarget.style.background = '#faf9ff'; }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = '#fff'; }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} color="#7c3aed" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>{tool.title}</p>
        <p style={{ fontFamily: dm, fontSize: 12, color: '#6b7280', margin: '2px 0 0', lineHeight: 1.45 }}>{tool.desc}</p>
      </div>
      <span style={{ fontFamily: dm, fontSize: 13, fontWeight: 700, color: '#9ca3af', flexShrink: 0 }}>→</span>
    </div>
  );
}

export default function ToolsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* Header — makes clear students normally don't need this page */}
      <div>
        <h2 style={{ fontFamily: dm, fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>
          CLIFF's Toolbox
        </h2>
        <p style={{ fontFamily: dm, fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          CLIFF already uses these tools while building your plan. You can also open them directly anytime.
        </p>
      </div>

      {GROUPS.map(group => (
        <div key={group.label}>
          <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.tools.map(tool => <ToolRow key={tool.id} tool={tool} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
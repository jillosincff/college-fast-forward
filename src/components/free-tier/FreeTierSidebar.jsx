import { useState } from 'react';
import {
  Home, Target, FileText, Building2,
  Users, Search, Mail, MessageSquare,
  Sparkles, Brain, Zap, BookOpen,
  ChevronDown, ChevronUp
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'MY CAREER',
    items: [
      { label: 'Home', tab: 'home', icon: Home },
      { label: 'Career Goals', tab: 'career_goals', icon: Target },
      { label: 'Resume', tab: 'resume', icon: FileText },
      { label: 'Company Intel', tab: 'company_intel', icon: Building2 },
    ]
  },
  {
    label: 'MY NETWORK',
    items: [
      { label: 'CFF Connections', tab: 'directory', icon: Users },
      { label: 'Alumni Search', tab: 'alumni_search', icon: Search },
      { label: 'Outreach Drafts', tab: 'outreach_drafts', icon: Mail },
      { label: 'Messages', tab: 'messages', icon: MessageSquare },
    ]
  },
];

const FASTIQ_ITEMS = [
  {
    label: 'Career Concierge',
    icon: Sparkles,
    expandable: true,
    children: [
      { label: 'Mock Interviews', tab: 'mock_interview' },
      { label: 'LinkedIn Review', tab: 'linkedin_review' },
      { label: 'Résumés & Cover Letters', tab: 'resume' },
    ]
  },
  { label: 'Career Assessment', tab: 'career_assessment', icon: Brain },
  { label: 'FastIQ', tab: 'fastiq_dashboard', icon: Zap },
];

export default function FreeTierSidebar({ currentTab, onNavigate, user, onOpenUpgrade }) {
  const [conciergeOpen, setConciergeOpen] = useState(
    ['mock_interview', 'linkedin_review'].includes(currentTab)
  );

  const isFastIQ = !!(user?.fastiq_setup_complete || user?.subscription_status === 'active' || user?.membership_tier === 'fastiq' || user?.trial_status === 'active' || user?.fastiq_trial_active === true);

  const firstName = user?.full_name?.split(' ')[0] || '';
  const schoolName = user?.school_name || 'University of Florida';

  const isActive = (tab) => currentTab === tab;

  const NavItem = ({ item, indent = false }) => (
    <button
      onClick={() => onNavigate(item.tab)}
      style={{
        width: '100%', display: 'flex',
        alignItems: 'center', gap: 10,
        padding: indent ? '7px 12px 7px 36px' : '8px 12px',
        borderRadius: 8, border: 'none',
        background: isActive(item.tab) ? '#FFF5F0' : 'none',
        cursor: 'pointer',
        transition: 'background 0.15s',
        minHeight: 'auto',
      }}
      onMouseEnter={e => {
        if (!isActive(item.tab)) e.currentTarget.style.background = '#F5F5F5';
      }}
      onMouseLeave={e => {
        if (!isActive(item.tab)) e.currentTarget.style.background = 'none';
      }}
    >
      {item.icon && (
        <item.icon
          size={15}
          color={isActive(item.tab) ? '#E85D20' : '#888'}
          strokeWidth={isActive(item.tab) ? 2.5 : 1.8}
        />
      )}
      <span style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: indent ? 12 : 13,
        fontWeight: isActive(item.tab) ? 600 : 400,
        color: isActive(item.tab) ? '#E85D20' : '#444',
        textAlign: 'left',
      }}>
        {item.label}
      </span>
      {isActive(item.tab) && (
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: '#E85D20', marginLeft: 'auto', flexShrink: 0,
        }} />
      )}
    </button>
  );

  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: '#fff',
      borderRight: '1px solid #F0F0F0',
      height: '100vh',
      position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      padding: '20px 12px',
      boxSizing: 'border-box',
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 24, padding: '0 4px' }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/684474c5723dc90efce23588/801071149_BlackWhiteMinimalistInitialsMonogramJewelryLogo.jpg"
          alt="CFF"
          style={{ height: 32, width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* User pill */}
      <div style={{
        background: '#F5F5F5', borderRadius: 10,
        padding: '8px 12px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#E85D20', color: '#fff',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 12,
          fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}>
          {firstName?.[0] || 'S'}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, fontWeight: 600,
            color: '#1A1A1A', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{firstName}</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10, color: '#888', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{schoolName}</p>
        </div>
      </div>

      {/* MY CAREER + MY NETWORK groups */}
      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 9, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            color: '#BBBBBB', margin: '0 0 6px 4px',
          }}>
            {group.label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {group.items.map(item => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ height: 1, background: '#F0F0F0', margin: '0 4px 20px' }} />

      {/* FASTIQ FEATURES */}
      <div style={{ marginBottom: 24 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 9, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: isFastIQ ? '#E85D20' : '#BBBBBB',
          margin: '0 0 6px 4px',
        }}>
          {isFastIQ ? '⚡' : '🔒'} FASTIQ FEATURES
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FASTIQ_ITEMS.map(item => (
            <div key={item.label}>
              {item.expandable ? (
                <>
                  <button
                    onClick={() => setConciergeOpen(prev => !prev)}
                    style={{
                      width: '100%', display: 'flex',
                      alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8,
                      border: 'none', background: 'none',
                      cursor: 'pointer', minHeight: 'auto',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <item.icon
                      size={15}
                      color={isFastIQ ? '#888' : '#CCCCCC'}
                      strokeWidth={1.8}
                    />
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13, fontWeight: 400,
                      color: isFastIQ ? '#444' : '#CCCCCC',
                      flex: 1, textAlign: 'left',
                    }}>
                      {item.label}
                    </span>
                    {isFastIQ
                      ? (conciergeOpen ? <ChevronUp size={12} color="#888" /> : <ChevronDown size={12} color="#888" />)
                      : <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, color: '#CCCCCC', textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPGRADE</span>
                    }
                  </button>
                  {conciergeOpen && isFastIQ && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {item.children.map(child => (
                        <NavItem key={child.label} item={child} indent />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => isFastIQ ? onNavigate(item.tab) : onOpenUpgrade?.()}
                  style={{
                    width: '100%', display: 'flex',
                    alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    border: 'none',
                    background: isActive(item.tab) ? '#FFF5F0' : 'none',
                    cursor: 'pointer',
                    opacity: isFastIQ ? 1 : 0.5,
                    minHeight: 'auto',
                  }}
                  onMouseEnter={e => {
                    if (!isActive(item.tab)) e.currentTarget.style.background = '#F5F5F5';
                  }}
                  onMouseLeave={e => {
                    if (!isActive(item.tab)) e.currentTarget.style.background = 'none';
                  }}
                >
                  <item.icon
                    size={15}
                    color={isActive(item.tab) ? '#E85D20' : isFastIQ ? '#888' : '#CCCCCC'}
                    strokeWidth={isActive(item.tab) ? 2.5 : 1.8}
                  />
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: isActive(item.tab) ? 600 : 400,
                    color: isActive(item.tab) ? '#E85D20' : isFastIQ ? '#444' : '#CCCCCC',
                    flex: 1, textAlign: 'left',
                  }}>
                    {item.label}
                  </span>
                  {!isFastIQ && (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, color: '#CCCCCC', textTransform: 'uppercase', letterSpacing: '0.06em' }}>UPGRADE</span>
                  )}
                  {isActive(item.tab) && isFastIQ && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E85D20', flexShrink: 0 }} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#F0F0F0', margin: '0 4px 16px' }} />

      {/* Saved / Notebook */}
      <button
        onClick={() => onNavigate('notebook')}
        style={{
          width: '100%', display: 'flex',
          alignItems: 'center', gap: 10,
          padding: '8px 12px', borderRadius: 8,
          border: 'none',
          background: isActive('notebook') ? '#FFF5F0' : 'none',
          cursor: 'pointer', marginBottom: 8, minHeight: 'auto',
          }}
          onMouseEnter={e => { if (!isActive('notebook')) e.currentTarget.style.background = '#F5F5F5'; }}
          onMouseLeave={e => { if (!isActive('notebook')) e.currentTarget.style.background = 'none'; }}
          >
          <BookOpen size={15} color={isActive('notebook') ? '#E85D20' : '#888'} strokeWidth={isActive('notebook') ? 2.5 : 1.8} />
          <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: isActive('notebook') ? 600 : 400,
          color: isActive('notebook') ? '#E85D20' : '#444',
        }}>
          Saved
        </span>
      </button>

      {/* Spacer pushes CTA to bottom */}
      <div style={{ flex: 1 }} />

      {/* FastIQ upgrade CTA for free users */}
      {!isFastIQ && (
        <div style={{
          marginTop: 'auto',
          background: 'linear-gradient(135deg, #0A0A0A, #1A1A1A)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 700,
            color: '#E85D20', margin: '0 0 4px',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>⚡ Unlock FastIQ</p>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11, color: 'rgba(255,255,255,0.5)',
            margin: '0 0 10px', lineHeight: 1.5,
          }}>
            AI interviews, LinkedIn review, unlimited alumni search & more.
          </p>
          <button
            onClick={() => onOpenUpgrade?.()}
            style={{
              background: '#E85D20', border: 'none',
              borderRadius: 8, padding: '8px 0',
              fontSize: 11, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              width: '100%', minHeight: 'auto',
            }}
          >
            {new Date() < new Date('2026-04-15T23:59:59') ? 'Upgrade — $14.50/mo →' : 'Upgrade — $29/mo →'}
          </button>
        </div>
      )}
    </div>
  );
}
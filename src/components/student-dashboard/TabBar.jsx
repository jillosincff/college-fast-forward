import React from 'react';
import { dmSans, ORANGE, CARD_BG, BORDER, ACTIVE_TABS, LOCKED_TABS } from './constants';
import { Lock } from 'lucide-react';

export default function TabBar({ activeTab, onTabChange, isPaid, onLockedClick }) {
  const allTabs = isPaid ? [...ACTIVE_TABS, ...LOCKED_TABS] : ACTIVE_TABS;
  const lockedIds = isPaid ? [] : LOCKED_TABS.map(t => t.id);

  return (
    <>
      {/* Mobile: horizontal scrollable */}
      <div className="md:hidden" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', gap: 6, paddingBottom: 4 }}>
          {allTabs.map(tab => {
            const isLocked = lockedIds.includes(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => isLocked ? onLockedClick(tab.id) : onTabChange(tab.id)}
                data-chip="true"
                style={{
                  fontFamily: dmSans, fontSize: 13, fontWeight: isActive ? 600 : 400,
                  color: isLocked ? 'rgba(255,255,255,0.4)' : isActive ? '#fff' : '#888',
                  background: isActive ? 'rgba(232,93,32,0.15)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(232,93,32,0.3)' : BORDER}`,
                  borderRadius: 100, padding: '8px 16px', cursor: 'pointer',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                  minHeight: 'auto', minWidth: 'auto', opacity: isLocked ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isLocked && <Lock size={12} style={{ color: ORANGE }} />}
              </button>
            );
          })}
        </div>
        {/* Locked tabs for free users */}
        {!isPaid && (
          <div style={{ display: 'flex', gap: 6, paddingTop: 4 }}>
            {LOCKED_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onLockedClick(tab.id)}
                data-chip="true"
                style={{
                  fontFamily: dmSans, fontSize: 13, fontWeight: 400,
                  color: 'rgba(255,255,255,0.4)', background: 'transparent',
                  border: `1px solid ${BORDER}`, borderRadius: 100,
                  padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6,
                  minHeight: 'auto', minWidth: 'auto', opacity: 0.5,
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <Lock size={12} style={{ color: ORANGE }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: sidebar */}
      <div className="hidden md:block" style={{ minWidth: 220, flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: 100 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ACTIVE_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    fontFamily: dmSans, fontSize: 14, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : '#888',
                    background: isActive ? 'rgba(232,93,32,0.12)' : 'transparent',
                    border: 'none', borderRadius: 10,
                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10,
                    minHeight: 'auto', transition: 'all 0.2s',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            {/* Locked section */}
            {!isPaid && (
              <>
                <div style={{ padding: '16px 14px 6px' }}>
                  <span style={{ fontFamily: dmSans, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: ORANGE }}>
                    FASTIQ FEATURES
                  </span>
                </div>
                {LOCKED_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onLockedClick(tab.id)}
                    style={{
                      fontFamily: dmSans, fontSize: 14, fontWeight: 400,
                      color: 'rgba(255,255,255,0.4)', background: 'transparent',
                      border: 'none', borderRadius: 10,
                      padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 10,
                      minHeight: 'auto', opacity: 0.5,
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    <Lock size={13} style={{ color: ORANGE, marginLeft: 'auto' }} />
                  </button>
                ))}
              </>
            )}

            {/* Paid users see all tabs */}
            {isPaid && LOCKED_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    fontFamily: dmSans, fontSize: 14, fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : '#888',
                    background: isActive ? 'rgba(232,93,32,0.12)' : 'transparent',
                    border: 'none', borderRadius: 10,
                    padding: '10px 14px', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 10,
                    minHeight: 'auto', transition: 'all 0.2s',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
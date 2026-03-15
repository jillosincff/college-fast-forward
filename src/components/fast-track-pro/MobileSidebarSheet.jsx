import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatSidebar from './ChatSidebar';

const dmSans = "'DM Sans', sans-serif";

export default function MobileSidebarSheet({ open, onClose, profile, onBack, onResearchCompany, onRerunAssessment, onProfileUpdated, onOpenChat }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              zIndex: 10000,
            }}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#0d1117',
              borderTop: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '80vh', overflowY: 'auto',
              zIndex: 10001,
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Handle + close */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px 0',
            }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'rgba(255,255,255,0.15)', margin: '0 auto',
              }} />
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', right: 16, top: 12,
                  background: 'none', border: 'none', color: 'rgba(244,240,232,0.4)',
                  fontSize: 20, cursor: 'pointer', minHeight: 'auto', width: 'auto',
                  fontFamily: dmSans,
                }}
              >×</button>
            </div>
            {/* Sidebar content */}
            <div style={{ padding: '8px 0 0' }}>
              <ChatSidebar
                profile={profile}
                onBack={() => { onClose(); onBack(); }}
                onResearchCompany={(c) => { onClose(); onResearchCompany(c); }}
                onRerunAssessment={() => { onClose(); onRerunAssessment(); }}
                onProfileUpdated={onProfileUpdated}
                onOpenChat={(msg) => { onClose(); onOpenChat(msg); }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EasterEggs() {
  const [konamiCode, setKonamiCode] = useState([]);
  const [swampMode, setSwampMode] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...konamiCode, e.code].slice(-konamiSequence.length);
      setKonamiCode(newSequence);

      if (JSON.stringify(newSequence) === JSON.stringify(konamiSequence)) {
        activateSwampMode();
        setKonamiCode([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode]);

  const activateSwampMode = () => {
    setSwampMode(true);
    // Add swamp mode styling to body
    document.body.classList.add('swamp-mode');
    
    // Auto-disable after 30 seconds
    setTimeout(() => {
      setSwampMode(false);
      document.body.classList.remove('swamp-mode');
    }, 30000);
  };

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    
    if (newCount === 10) {
      // Special animation for 10 clicks
      const elements = document.querySelectorAll('.gator-logo');
      elements.forEach(el => {
        el.style.animation = 'gatorDance 2s ease-in-out';
      });
      setLogoClicks(0);
    }
  };

  return (
    <>
      {/* Global styles for swamp mode */}
      <style>{`
        .swamp-mode {
          background: linear-gradient(45deg, #1a4d2e, #0f2a1d) !important;
          transition: all 0.5s ease;
        }
        
        .swamp-mode .card {
          background: rgba(34, 139, 34, 0.1) !important;
          border-color: #228B22 !important;
        }
        
        @keyframes gatorDance {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.2); }
          75% { transform: rotate(15deg) scale(1.2); }
        }
        
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        .swamp-mode::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(0, 100, 0, 0.2) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }
      `}</style>

      {/* Swamp Mode Notification */}
      <AnimatePresence>
        {swampMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-800 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐊</span>
              <span className="font-bold">SWAMP MODE ACTIVATED!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo click detector */}
      <div
        onClick={handleLogoClick}
        className="gator-logo-detector"
        style={{ display: 'none' }}
      />
    </>
  );
}
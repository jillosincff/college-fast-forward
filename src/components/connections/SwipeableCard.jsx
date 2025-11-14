import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import HelpRequestCard from './HelpRequestCard';

const SwipeAction = ({ icon: Icon, label, color, side, intensity = 0 }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: 1, 
      opacity: Math.max(0.7, intensity),
      y: intensity > 0.3 ? [-2, 2, -2] : 0
    }}
    exit={{ scale: 0, opacity: 0 }}
    transition={{
      y: { duration: 0.1, repeat: intensity > 0.3 ? Infinity : 0 }
    }}
    className={`
      absolute top-1/2 transform -translate-y-1/2 
      ${side === 'left' ? 'left-4' : 'right-4'}
      flex flex-col items-center gap-2 text-white font-bold z-10
    `}
  >
    <motion.div 
      className={`p-4 rounded-full ${color} shadow-lg border-4 border-white`}
      animate={{
        scale: 1 + (intensity * 0.3),
        boxShadow: intensity > 0.5 ? "0 0 20px rgba(255,255,255,0.8)" : "0 4px 12px rgba(0,0,0,0.15)"
      }}
    >
      <Icon className="w-8 h-8" />
    </motion.div>
    <motion.span 
      className="text-sm font-bold bg-slate-900/80 px-3 py-1 rounded-full"
      animate={{
        scale: 1 + (intensity * 0.1)
      }}
    >
      {label}
    </motion.span>
    
    {/* Haptic feedback sparkles */}
    <AnimatePresence>
      {intensity > 0.6 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ 
                scale: 0,
                x: 0,
                y: 0,
                opacity: 1
              }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.cos((i * 60) * Math.PI / 180) * 30),
                y: (Math.sin((i * 60) * Math.PI / 180) * 30),
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 0.2
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  </motion.div>
);

const HapticFeedback = ({ type, intensity }) => {
  if (intensity < 0.3) return null;
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Screen flash for strong feedback */}
      {intensity > 0.7 && (
        <motion.div
          className={`absolute inset-0 ${
            type === 'connect' ? 'bg-green-500/10' : 'bg-blue-500/10'
          }`}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Edge glow effect */}
      <motion.div
        className={`absolute inset-0 border-4 ${
          type === 'connect' 
            ? 'border-green-400/20' 
            : 'border-blue-400/20'
        } rounded-2xl`}
        animate={{ 
          borderWidth: [4, 8, 4],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{ 
          duration: 0.3,
          repeat: intensity > 0.6 ? Infinity : 0
        }}
      />
    </motion.div>
  );
};

const SwipeInstructions = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="absolute inset-x-0 bottom-4 flex justify-center z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-3">
          <div className="flex items-center gap-1">
            <motion.div
              className="w-6 h-6 border-2 border-green-400 rounded-full flex items-center justify-center"
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <UserPlus className="w-3 h-3 text-green-400" />
            </motion.div>
            <span className="text-xs">Swipe right to connect</span>
          </div>
          <div className="w-px h-4 bg-slate-600" />
          <div className="flex items-center gap-1">
            <motion.div
              className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center"
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            >
              <Users className="w-3 h-3 text-blue-400" />
            </motion.div>
            <span className="text-xs">Swipe left to refer</span>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function SwipeableCard({ 
  request, 
  onConnect, 
  onIndirectHelp, 
  onViewDetails,
  isMobile = false 
}) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAction, setSwipeAction] = useState(null);
  const [swipeIntensity, setSwipeIntensity] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasShownInstructions, setHasShownInstructions] = useState(false);

  // Show instructions on first mobile load
  React.useEffect(() => {
    if (isMobile && !hasShownInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(true);
        setHasShownInstructions(true);
        setTimeout(() => setShowInstructions(false), 4000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, hasShownInstructions]);

  const handleDragStart = () => {
    setIsDragging(true);
    setShowInstructions(false);
  };

  const handleDrag = (event, info) => {
    const dragDistance = Math.abs(info.offset.x);
    const maxDrag = 150;
    const intensity = Math.min(dragDistance / maxDrag, 1);
    
    setDragX(info.offset.x);
    setSwipeIntensity(intensity);
    
    // Determine swipe action and intensity
    if (info.offset.x > 50) {
      setSwipeAction('connect');
    } else if (info.offset.x < -50) {
      setSwipeAction('refer');
    } else {
      setSwipeAction(null);
    }
    
    // Haptic-style feedback via vibration (if supported)
    if (intensity > 0.7 && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleDragEnd = (event, info) => {
    setIsDragging(false);
    const threshold = 120;
    
    if (info.offset.x > threshold) {
      // Swipe right - Connect
      onConnect(request);
    } else if (info.offset.x < -threshold) {
      // Swipe left - Indirect Help
      onIndirectHelp(request);
    }
    
    // Reset states
    setDragX(0);
    setSwipeAction(null);
    setSwipeIntensity(0);
  };

  if (!isMobile) {
    // Desktop version - no swipe functionality
    return <HelpRequestCard request={request} onConnect={onConnect} onIndirectHelp={onIndirectHelp} />;
  }

  return (
    <div className="relative">
      <SwipeInstructions show={showInstructions} />
      
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ 
          x: isDragging ? dragX : 0,
          rotate: isDragging ? dragX * 0.05 : 0,
          scale: isDragging ? 0.95 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30 
        }}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          zIndex: isDragging ? 10 : 1
        }}
      >
        {/* Background color hints */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            background: swipeAction === 'connect' 
              ? `linear-gradient(to right, transparent, rgba(34, 197, 94, ${swipeIntensity * 0.3}))` 
              : swipeAction === 'refer'
              ? `linear-gradient(to left, transparent, rgba(59, 130, 246, ${swipeIntensity * 0.3}))`
              : 'transparent'
          }}
        />
        
        <HelpRequestCard 
          request={request} 
          onConnect={onConnect} 
          onIndirectHelp={onIndirectHelp}
          onViewDetails={onViewDetails}
        />
        
        {/* Swipe action indicators */}
        <AnimatePresence>
          {swipeAction === 'connect' && (
            <SwipeAction
              icon={UserPlus}
              label="Connect!"
              color="bg-green-500"
              side="right"
              intensity={swipeIntensity}
            />
          )}
          {swipeAction === 'refer' && (
            <SwipeAction
              icon={Users}
              label="Refer!"
              color="bg-blue-500"
              side="left"
              intensity={swipeIntensity}
            />
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Haptic feedback overlay */}
      <HapticFeedback type={swipeAction} intensity={swipeIntensity} />
    </div>
  );
}
import React, { useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const THRESHOLD = 80; // px to trigger refresh

export default function PullToRefresh({ onRefresh, children, className = '' }) {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    // Only enable when scrolled to top
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      // Diminishing pull effect
      setPullDistance(Math.min(diff * 0.5, 120));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pulling, pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative' }}
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="flex items-center justify-center w-full pointer-events-none"
          style={{
            height: pullDistance,
            transition: pulling ? 'none' : 'height 0.3s ease',
            overflow: 'hidden',
          }}
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-white shadow border border-slate-200 ${refreshing ? '' : ''}`}
            style={{
              opacity: Math.min(pullDistance / THRESHOLD, 1),
              transform: `rotate(${pullDistance * 2}deg)`,
              transition: pulling ? 'none' : 'all 0.3s ease',
            }}
          >
            <Loader2
              className={`w-4 h-4 text-[#0021A5] ${refreshing ? 'animate-spin' : ''}`}
            />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
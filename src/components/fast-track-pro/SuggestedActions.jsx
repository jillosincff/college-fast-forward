import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable clickable action buttons for FASTIQ agent suggestions.
 * Every suggestion the agent makes should be one tap away from executing.
 */
export default function SuggestedActions({ actions, onSendMessage, className = '' }) {
  if (!actions || !Array.isArray(actions) || actions.length === 0 || !onSendMessage) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {actions.map((action, i) => {
        const text = String(typeof action === 'object' ? action.text || action.label || action : action).replace(/^→\s*/, '').trim();
        if (!text) return null;
        return (
          <button
            key={i}
            onClick={() => onSendMessage(text)}
            className="w-full flex items-start gap-2 bg-white/80 rounded-lg px-3 py-2.5 border border-current/10 text-left cursor-pointer hover:bg-blue-50 hover:border-[#0021A5]/30 active:bg-blue-100 transition-all group"
            style={{ minHeight: 'auto' }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#0021A5] mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span className="text-xs text-slate-700 font-medium group-hover:text-[#0021A5] transition-colors">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
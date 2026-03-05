import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Reusable clickable action buttons for FASTIQ agent suggestions.
 * Every suggestion the agent makes should be one tap away from executing.
 * Renders as styled pill buttons with colored borders matching the feature's accent.
 * On hover: fill with color, text turns white.
 */
export default function SuggestedActions({ actions, onSendMessage, className = '', accentColor = '#0021A5', label = 'Next Steps' }) {
  if (!actions || !Array.isArray(actions) || actions.length === 0 || !onSendMessage) return null;

  return (
    <div className={className}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((action, i) => {
          const text = String(typeof action === 'object' ? action.text || action.label || action : action).replace(/^→\s*/, '').trim();
          if (!text) return null;
          return (
            <button
              key={i}
              onClick={() => onSendMessage(text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all duration-200 cursor-pointer group"
              style={{
                borderColor: accentColor,
                color: accentColor,
                backgroundColor: 'transparent',
                minHeight: 'auto',
                minWidth: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentColor;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = accentColor;
              }}
            >
              <ArrowRight className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <span>{text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
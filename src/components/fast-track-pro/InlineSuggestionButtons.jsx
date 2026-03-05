import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Parses agent markdown text for inline suggestions like:
 * - "Want me to find companies hiring for this?"
 * - "You could also draft a cover letter"
 * - "Shall I research Apple for you?"
 * - "I can also help you with X"
 * - Lines starting with → or "→ "
 * 
 * Returns clickable pill buttons that send the suggestion text to the agent.
 */

const SUGGESTION_PATTERNS = [
  // "Want me to X?" or "Want me to X."
  /(?:^|\n)\s*(?:[-•*]?\s*)?(?:🔹|💡|👉|➡️|→)?\s*(?:Want me to|Shall I|Should I|I can also|I could also|You could also|Would you like me to|Let me know if you want me to|I can help you)\s+(.+?)(?:[.?!]\s*$|[.?!]\s*\n|\s*$)/gim,
  // "→ Do X" or "→ Find Y" (arrow suggestions)
  /(?:^|\n)\s*→\s+(.+?)(?:\s*$)/gm,
];

export function extractSuggestions(text) {
  if (!text || typeof text !== 'string') return [];
  
  const suggestions = [];
  const seen = new Set();
  
  for (const pattern of SUGGESTION_PATTERNS) {
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let suggestion = match[1]?.trim();
      if (!suggestion) continue;
      
      // Clean up: remove trailing punctuation, quotes, markdown
      suggestion = suggestion
        .replace(/[*_`]+/g, '')
        .replace(/\s*[→]+\s*$/, '')
        .replace(/^\s*["'"]+|["'"]+\s*$/g, '')
        .trim();
      
      // Skip too short or too long
      if (suggestion.length < 5 || suggestion.length > 150) continue;
      
      // Normalize for dedup
      const key = suggestion.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      
      suggestions.push(suggestion);
    }
  }
  
  return suggestions.slice(0, 4); // Max 4 inline suggestions
}

export default function InlineSuggestionButtons({ text, onSendMessage, accentColor = '#0021A5' }) {
  const suggestions = extractSuggestions(text);
  
  if (!suggestions.length || !onSendMessage) return null;
  
  return (
    <div className="mt-3 pt-2 space-y-1.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quick Actions</p>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(suggestion)}
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
            <span className="whitespace-nowrap">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchUsersForTagging } from '@/functions/searchUsersForTagging';
import UserAvatar from '../common/UserAvatar';
import { Loader2 } from 'lucide-react';
import _ from 'lodash';

export default function MentionInput({ value, onChange, placeholder, rows = 5, className, maxLength }) {
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mentionStart, setMentionStart] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Debounced search
  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const res = await searchUsersForTagging({ query, limit: 6 });
        setResults(res?.data?.users || []);
      } catch (err) {
        console.error('Mention search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (e) => {
    const newValue = maxLength ? e.target.value.slice(0, maxLength) : e.target.value;
    onChange(newValue);

    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = newValue.slice(0, cursorPos);

    // Find the last @ that isn't preceded by a word character
    const mentionMatch = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      const start = cursorPos - query.length - 1; // -1 for @
      setMentionStart(start);
      setSearchQuery(query);
      setShowDropdown(true);
      setSelectedIndex(0);
      if (query.length >= 2) {
        setLoading(true);
        debouncedSearch(query);
      } else {
        setResults([]);
      }
    } else {
      setShowDropdown(false);
      setMentionStart(null);
    }
  };

  const insertMention = (user) => {
    if (mentionStart === null) return;
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const displayName = user.full_name || user.email.split('@')[0];
    
    // Replace @query with @DisplayName
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursorPos);
    // Include a space prefix if mentionStart > 0 and char before isn't already space
    const prefix = mentionStart > 0 && value[mentionStart - 1] !== ' ' ? '' : '';
    const newValue = `${before}${prefix}@${displayName} ${after}`;
    
    onChange(newValue);
    setShowDropdown(false);
    setMentionStart(null);
    setResults([]);

    // Restore cursor position after the inserted mention
    setTimeout(() => {
      const newPos = mentionStart + prefix.length + 1 + displayName.length + 1;
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (results[selectedIndex]) {
        e.preventDefault();
        insertMention(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          textareaRef.current && !textareaRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const personaLabel = (persona) => {
    if (persona === 'parent') return '👨‍👩‍👧 Parent';
    if (persona === 'alumni') return '🎓 Alumni';
    if (persona === 'gator') return '🐊 Gator';
    return '';
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
        style={{ fontSize: '16px' }}
      />

      {showDropdown && (searchQuery.length >= 2) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No users found for "{searchQuery}"
            </div>
          ) : (
            results.map((user, idx) => (
              <button
                key={user.id}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${
                  idx === selectedIndex ? 'bg-blue-50' : ''
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(user);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <UserAvatar user={user} className="h-8 w-8" showFallback />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {[user.current_position, user.current_company].filter(Boolean).join(' at ') || personaLabel(user.persona)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Extract mentioned user names from text (returns array of display names)
export function extractMentions(text) {
  if (!text) return [];
  const mentionRegex = /@([\w\s]+?)(?=\s@|\s[^@]|$)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1].trim();
    if (name.length >= 2) {
      mentions.push(name);
    }
  }
  return [...new Set(mentions)];
}
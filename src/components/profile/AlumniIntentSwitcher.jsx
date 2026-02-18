import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

const INTENT_OPTIONS = [
  {
    id: 'help_students',
    emoji: '🤝',
    title: 'Help students',
    description: 'Answer questions, make introductions, share your expertise. You\'ll see the helper dashboard.',
  },
  {
    id: 'seeking_help',
    emoji: '🔍',
    title: 'Find opportunities',
    description: 'Get matched with parents and alumni who can help with your career. You\'ll see the job seeker dashboard.',
  },
  {
    id: 'both',
    emoji: '🔄',
    title: 'Both',
    description: 'Help students AND get career help. You\'ll see the seeker dashboard with full helper actions enabled.',
  },
];

export default function AlumniIntentSwitcher({ user, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const currentIntent = user?.alumni_intent || 'help_students';

  const handleSwitch = async (newIntent) => {
    if (newIntent === currentIntent || saving) return;
    setSaving(true);
    await base44.auth.updateMe({ alumni_intent: newIntent });
    if (onUpdated) await onUpdated();
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 I'm here to...
        </CardTitle>
        <CardDescription>This controls which dashboard you see. You can switch anytime.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {INTENT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSwitch(option.id)}
            disabled={saving}
            className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl text-left transition-all duration-200 border-2 ${
              currentIntent === option.id
                ? 'bg-blue-50 border-[#0021A5] ring-1 ring-[#0021A5]/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <span className="text-2xl mt-0.5">{option.emoji}</span>
            <div className="flex-1">
              <span className={`font-bold block ${currentIntent === option.id ? 'text-[#0021A5]' : 'text-slate-800'}`}>
                {option.title}
              </span>
              <span className="text-sm text-slate-500 mt-0.5 block">{option.description}</span>
            </div>
            {currentIntent === option.id && (
              saving ? <Loader2 className="w-5 h-5 animate-spin text-[#0021A5] mt-1" /> : <span className="text-[#0021A5] font-bold text-lg mt-1">✓</span>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
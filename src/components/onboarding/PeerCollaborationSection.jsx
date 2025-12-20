import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Handshake } from 'lucide-react';

const COLLABORATION_OPTIONS = [
  { value: 'resume_review', label: 'Swapping resume feedback', icon: '📄' },
  { value: 'interview_prep', label: 'Sharing interview experiences', icon: '🎤' },
  { value: 'internship_search', label: 'Comparing internship search strategies', icon: '🔍' },
  { value: 'certifications', label: 'Studying for industry certifications together', icon: '📜' },
  { value: 'study_groups', label: 'Forming study groups', icon: '📚' },
  { value: 'career_development', label: 'Other career development topics', icon: '🚀' }
];

export default function PeerCollaborationSection({ formData, updateField, toggleMultiSelect }) {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl p-5 mt-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
          <Handshake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            🤝 Collaborate with Fellow Gators
          </h3>
          <p className="text-sm text-teal-700 mt-1">
            Connect with other students in your major and industry. Share experiences, swap resume tips, and build your network.
          </p>
        </div>
      </div>

      {/* Main toggle */}
      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-teal-300 cursor-pointer hover:bg-teal-50 transition-colors">
        <input
          type="checkbox"
          checked={formData.openToCollaboration || false}
          onChange={(e) => updateField('openToCollaboration', e.target.checked)}
          className="w-5 h-5 text-teal-600 rounded"
        />
        <div>
          <p className="font-medium text-slate-900">I'm open to collaborating with fellow Gators</p>
          <p className="text-xs text-slate-500">Other students can find and connect with you</p>
        </div>
      </label>

      {/* Additional fields when checked */}
      {formData.openToCollaboration && (
        <div className="mt-4 space-y-4">
          {/* Collaboration types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What are you open to collaborating on? (select all that apply)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {COLLABORATION_OPTIONS.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    (formData.canCollaborateOn || []).includes(option.value)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.canCollaborateOn || []).includes(option.value)}
                    onChange={() => toggleMultiSelect('canCollaborateOn', option.value)}
                    className="w-5 h-5 text-teal-600 rounded"
                  />
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* What I'm working on */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What are you working on? (optional)
            </label>
            <Textarea
              value={formData.whatImWorkingOn || ''}
              onChange={(e) => updateField('whatImWorkingOn', e.target.value.slice(0, 200))}
              placeholder="e.g., Applying for summer marketing internships, building my portfolio website"
              rows={2}
              className="text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {(formData.whatImWorkingOn || '').length}/200 characters • Share what you're currently focused on
            </p>
          </div>

          {/* What I can share */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What can you share? (optional)
            </label>
            <Textarea
              value={formData.whatICanShare || ''}
              onChange={(e) => updateField('whatICanShare', e.target.value.slice(0, 200))}
              placeholder="e.g., Resume template that got me 3 interviews, tips for networking on LinkedIn"
              rows={2}
              className="text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              {(formData.whatICanShare || '').length}/200 characters • What experiences or resources can you offer to peers?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
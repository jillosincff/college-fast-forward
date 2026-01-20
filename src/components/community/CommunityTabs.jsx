import React from 'react';
import { MessageSquare, DollarSign, Mic, Bot } from 'lucide-react';

const TABS = [
  { id: 'questions', label: 'Questions', icon: MessageSquare, emoji: '💬' },
  { id: 'salaries', label: 'Salaries', icon: DollarSign, emoji: '💰' },
  { id: 'interviews', label: 'Interviews', icon: Mic, emoji: '🎤' },
  { id: 'ai-advisor', label: 'AI Advisor', icon: Bot, emoji: '🤖' }
];

export default function CommunityTabs({ activeTab, onTabChange }) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex gap-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
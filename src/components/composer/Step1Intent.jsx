import React from 'react';

export default function Step1Intent({ options, onSelect }) {
  return (
    <div>
      <p className="text-gray-600 mb-6 text-sm">
        What are you hoping to get from this conversation?
      </p>
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="font-semibold text-gray-900">{option.label}</div>
            <div className="text-sm text-gray-600">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
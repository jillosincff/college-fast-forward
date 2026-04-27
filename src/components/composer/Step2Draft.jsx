import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function Step2Draft({ draft, onDraftChange, onRegenerate, generating, onNext, onBack }) {
  return (
    <div>
      <p className="text-gray-600 mb-4 text-sm">
        Here's your draft. Edit it however you like, then send it.
      </p>
      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
      />
      <div className="mt-4 flex gap-3">
        <button
          onClick={onRegenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Regenerate
        </button>
      </div>
      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
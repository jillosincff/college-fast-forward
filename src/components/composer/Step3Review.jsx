import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Step3Review({ recipient, draft, onSend, onSaveDraft, onBack, sending }) {
  return (
    <div>
      {/* Recipient preview */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Sending to</p>
        <div>
          <p className="font-semibold text-gray-900">{recipient.full_name}</p>
          {recipient.job_title && (
            <p className="text-sm text-gray-600">
              {recipient.job_title}
              {recipient.company && ` at ${recipient.company}`}
            </p>
          )}
        </div>
      </div>

      {/* Message preview */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Your message</p>
        <p className="text-gray-900 whitespace-pre-wrap text-sm leading-relaxed">{draft}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-between">
        <div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Back
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onSaveDraft}
            disabled={sending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            onClick={onSend}
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {sending && <Loader2 size={16} className="animate-spin" />}
            Send message
          </button>
        </div>
      </div>
    </div>
  );
}
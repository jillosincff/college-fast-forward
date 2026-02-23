import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * Mobile back-button header for detail / "pushed" screens.
 * Rendered only on screens < md. On desktop the normal header is enough.
 */
export default function MobileBackHeader({ title, onBack }) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 bg-white border-b border-slate-200 px-4 h-12 md:hidden">
      <button
        onClick={onBack}
        className="flex items-center justify-center w-8 h-8 -ml-1 rounded-full hover:bg-slate-100 transition"
        style={{ minHeight: 'auto', minWidth: 'auto' }}
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" />
      </button>
      {title && (
        <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
      )}
    </div>
  );
}
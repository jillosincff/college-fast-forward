import React from 'react';
import { Loader2 } from 'lucide-react';

export default function WaitingForMatches({ helpRequest }) {
  const questionPreview = helpRequest?.description?.substring(0, 100) || 
                         helpRequest?.role || 
                         'Your question';

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-100 overflow-hidden">
      <div className="p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-[#0021A5] animate-spin" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
          🔍 Finding professionals who can help...
        </h2>
        
        <p className="text-slate-600 mb-6 max-w-md mx-auto">
          Your question: "{questionPreview}..."
        </p>
        
        <p className="text-slate-500 text-sm mb-6">
          We're matching you with UF parents and alumni. Check back soon!
        </p>
        
        {/* Progress bar */}
        <div className="max-w-sm mx-auto">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0021A5] to-[#FA4616] animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">Matching in progress...</p>
        </div>
      </div>
    </div>
  );
}
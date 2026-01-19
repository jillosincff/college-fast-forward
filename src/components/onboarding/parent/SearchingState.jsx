import React from 'react';

export default function SearchingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-8">
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-[#0021A5] border-t-transparent animate-spin" />
      </div>
      
      <p className="text-xl text-slate-700 font-medium">
        Finding students who need you...
      </p>
    </div>
  );
}
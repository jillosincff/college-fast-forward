import React from 'react';
import ResponseCard from './ResponseCard';

const UF_ORANGE = '#FA4616';

export default function ResponsesSection({ responses = [], onReadResponse }) {
  if (responses.length === 0) return null;

  return (
    <section 
      className="rounded-3xl shadow-lg overflow-hidden border-2"
      style={{ 
        borderColor: `${UF_ORANGE}50`,
        background: `linear-gradient(135deg, #FFF5F2 0%, #FFFFFF 100%)`
      }}
    >
      {/* Header */}
      <div className="px-4 md:px-6 py-4 md:py-5">
        <h2 
          className="text-lg md:text-xl font-bold flex items-center gap-2"
          style={{ color: UF_ORANGE }}
        >
          💬 {responses.length} New Response{responses.length !== 1 ? 's' : ''}!
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Someone from the UF network wants to help you
        </p>
      </div>

      {/* Response Cards */}
      <div className="px-3 md:px-4 pb-4 space-y-3">
        {responses.slice(0, 5).map((response) => (
          <ResponseCard 
            key={response.id} 
            response={response} 
            onRead={onReadResponse}
          />
        ))}
      </div>
    </section>
  );
}
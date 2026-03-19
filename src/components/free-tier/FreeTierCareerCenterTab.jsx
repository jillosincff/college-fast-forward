import React from 'react';

export default function FreeTierCareerCenterTab({ user, onOpenUpgrade }) {
  const school = user?.school || user?.university || 'UF';

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        CAREER CENTER
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        What's happening at {school} Career Center.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 32 }}>
        Events, deadlines, and resources from your school.
      </p>

      {/* Empty State */}
      <div className="bg-white rounded-xl p-12 border border-[#E0E0E0] text-center">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 8 }}>
          Check back soon — we update this regularly.
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999' }}>
          Career center events will appear here as they're scheduled.
        </p>
      </div>
    </div>
  );
}
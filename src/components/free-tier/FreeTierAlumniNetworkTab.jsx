import React from 'react';

const SAMPLE_ALUMNI = [
  { company: 'Goldman Sachs', count: 12, roles: [{ title: 'Analyst', count: 3 }, { title: 'Associate', count: 2 }, { title: 'Manager', count: 1 }] },
  { company: 'Google', count: 18, roles: [{ title: 'Product Manager', count: 4 }, { title: 'Software Engineer', count: 8 }, { title: 'UX Designer', count: 2 }] },
  { company: 'Nike', count: 9, roles: [{ title: 'Brand Manager', count: 2 }, { title: 'Marketing Coordinator', count: 3 }] },
];

export default function FreeTierAlumniNetworkTab({ user, onOpenUpgrade }) {
  const savedGoals = user?.career_goals;
  const targetCompanies = savedGoals?.target_companies || user?.target_companies || [];
  const targetIndustries = savedGoals?.industries || user?.target_industries || [];
  const hasGoals = !!(targetIndustries.length || targetCompanies.length);
  const school = user?.school || user?.university || 'UF';

  // Show target companies first if set, then fill with sample
  const personalizedAlumni = targetCompanies.length > 0
    ? [
        ...targetCompanies.map(name => ({ company: name, count: Math.floor(Math.random() * 15) + 3, roles: [{ title: 'Analyst', count: 2 }, { title: 'Associate', count: 1 }, { title: 'Manager', count: 1 }] })),
        ...SAMPLE_ALUMNI.filter(a => !targetCompanies.some(t => a.company.toLowerCase().includes(t.toLowerCase()))),
      ]
    : SAMPLE_ALUMNI;
  const displayAlumni = hasGoals ? personalizedAlumni : SAMPLE_ALUMNI;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#E85D20', marginBottom: 12 }}>
        ALUMNI NETWORK
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
        Your school's alumni are already inside.
      </h1>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 32 }}>
        See where graduates from your school have landed — and who can open doors.
      </p>

      {!hasGoals ? (
        <div className="bg-white rounded-xl p-8 border border-[#E0E0E0] text-center">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#666', marginBottom: 16 }}>
            Add your career goals first so we can show you relevant alumni.
          </p>
          <button
            onClick={() => window.location.hash = '#FreeTierDashboard?tab=career_goals'}
            className="border border-[#E85D20] text-[#E85D20] px-6 py-3 rounded-full font-semibold hover:bg-[#E85D20]/10 transition-colors"
            style={{ minHeight: 'auto' }}
          >
            Go to Career Goals →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayAlumni.map(item => (
            <div key={item.company} className="bg-white rounded-xl p-6 border border-[#E0E0E0]">
              <h3 className="font-bold text-[#1A1A1A] text-lg mb-2">{item.company}</h3>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#666', marginBottom: 16 }}>
                {item.count} alumni from {school} work here
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#999', marginBottom: 16 }}>
                Including: {item.roles.map(r => `${r.title} (${r.count})`).join(' · ')}
              </p>

              {/* Blurred profiles */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="relative bg-[#F5F5F5] rounded-lg p-4 border border-[#E0E0E0]">
                    <div className="filter blur-sm">
                      <div className="w-10 h-10 bg-gray-300 rounded-full mb-2" />
                      <p className="font-bold text-gray-400 text-sm mb-1">Profile Hidden</p>
                      <p className="text-xs text-gray-400">{item.roles[i - 1]?.title || 'Analyst'}</p>
                      <p className="text-xs text-gray-400">Class of 2020</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={onOpenUpgrade}
                        className="bg-[#E85D20] text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-[#d44e14] transition-colors flex items-center gap-1"
                        style={{ minHeight: 'auto' }}
                      >
                        🔒 See who to contact →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Network scale */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#666', lineHeight: 1.5 }}>
              The more parents who join, the more possibilities you have.<br />
              <strong className="text-[#E85D20]">1,200+ families already inside.</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
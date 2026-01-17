import React from 'react';

export default function AlumniLeaderboardSection({ entries, currentUserId }) {
  return (
    <section 
      className="rounded-3xl p-6 text-white overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg, #0021A5 0%, #001052 50%, #0021A5 100%)' }}
    >
      {/* Decorations */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
        style={{ backgroundColor: 'rgba(250, 70, 22, 0.2)' }}
      />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2 text-white">
              <span className="text-2xl">🏆</span>
              Top UF Helpers This Week
            </h3>
            <p className="text-sm mt-1 text-white/60">
              Students + alumni helped
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div 
              key={entry.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition ${
                entry.isCurrentUser 
                  ? 'border-2 shadow-lg' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              style={entry.isCurrentUser ? { 
                backgroundColor: 'rgba(250, 70, 22, 0.2)',
                borderColor: 'rgba(250, 70, 22, 0.5)'
              } : {}}
            >
              {/* Rank Badge */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{
                  background: index === 0 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : index === 1 
                    ? 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)'
                    : index === 2 
                    ? 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'
                    : 'rgba(255,255,255,0.1)',
                  color: index < 3 ? (index === 0 ? '#92400E' : index === 1 ? '#374151' : '#FEF3C7') : 'white'
                }}
              >
                {entry.rank}
              </div>
              
              {/* Name + Level */}
              <div className="flex-1">
                <span className="font-medium">
                  {entry.displayName}
                  {entry.isCurrentUser && (
                    <span 
                      className="font-normal ml-1"
                      style={{ color: '#FFA07A' }}
                    >
                      (You)
                    </span>
                  )}
                </span>
                <span 
                  className="text-xs ml-2 px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  {entry.karmaLevel}
                </span>
              </div>
              
              {/* Score */}
              <div>
                <span className="font-bold text-lg">{entry.weeklyHelpCount}</span>
                <span className="text-sm ml-1 text-white/60">helped</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
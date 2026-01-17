import React from 'react';

function getActivityText(event) {
  switch (event.type) {
    case 'answered_student': return `helped ${event.detail}`;
    case 'answered_alumni': return `helped a fellow alumni`;
    case 'posted_job': return `posted a ${event.detail} role`;
    case 'best_answer': return 'earned Best Answer 🏆';
    case 'joined_network': return 'joined the network';
    default: return '';
  }
}

export default function AlumniLiveActivityBar({ events, weeklyStudentsHelped, weeklyAlumniHelped }) {
  return (
    <section className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-6 py-3">
        <div className="flex items-center gap-4">
          
          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: '#FA4616' }}
              />
              <span 
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: '#FA4616' }}
              />
            </span>
            <span className="text-sm font-semibold text-gray-600">Live</span>
          </div>

          {/* Activity ticker */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {events.slice(0, 3).map((event, index) => (
                <React.Fragment key={event.id}>
                  {index > 0 && <span className="text-gray-300">•</span>}
                  <span>
                    <strong className="text-gray-700">{event.alumniDisplayName}</strong>
                    {' '}{getActivityText(event)}
                  </span>
                </React.Fragment>
              ))}
              {events.length === 0 && (
                <span className="text-gray-400">Be the first to help today!</span>
              )}
            </div>
          </div>

          {/* Weekly stats */}
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
            <span>
              <strong style={{ color: '#0021A5' }}>{weeklyStudentsHelped}</strong> students
            </span>
            <span>•</span>
            <span>
              <strong style={{ color: '#0021A5' }}>{weeklyAlumniHelped}</strong> alumni helped this week
            </span>
          </div>
          
        </div>
      </div>
    </section>
  );
}
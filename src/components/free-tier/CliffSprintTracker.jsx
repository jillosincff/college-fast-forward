import React from 'react';

const dm = "'DM Sans', system-ui, sans-serif";

export default function CliffSprintTracker({ currentDay = 3, totalDays = 14 }) {
  const progressPercent = Math.round((currentDay / totalDays) * 100);

  const sprintTasks = [
    { day: 1, text: "Sync your university network & target career filters", completed: true },
    { day: 2, text: "Identify 3 core Target-Matched Discoveries in your sector", completed: true },
    { day: 3, text: "Deploy CLiFF to find an insider at your top target company", completed: false, active: true },
    { day: 4, text: "Send your first personalized, un-cringe CLiFF outreach draft", completed: false },
    { day: 5, text: "Map parent network advisors for secondary referral coverage", completed: false },
  ];

  const activeTask = sprintTasks.find(t => t.active) || sprintTasks[2];
  const upcomingTasks = sprintTasks.filter(t => !t.completed && !t.active).slice(0, 2);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* Header with Day Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #f9fafb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <h4 style={{ fontFamily: dm, fontSize: 12, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.01em' }}>Your 14-Day Sprint Plan</h4>
        </div>
        <span style={{ fontFamily: dm, fontSize: 10, fontWeight: 800, color: '#7c3aed', background: '#faf5ff', padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
          Day {currentDay} of {totalDays}
        </span>
      </div>

      {/* Gamified Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sprint Momentum</span>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#7c3aed' }}>{progressPercent}% Done</span>
        </div>
        <div style={{ width: '100%', background: '#f3f4f6', height: 10, borderRadius: 100, overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'linear-gradient(135deg, #3b82f6, #7c3aed)',
              borderRadius: 100,
              transition: 'width 0.5s ease'
            }} 
          />
        </div>
      </div>

      {/* Active Milestone Action Block */}
      <div style={{ background: 'rgba(250,245,255,0.6)', border: '1px solid rgba(237,233,254,0.8)', borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 12, animation: 'pulse 2s ease-in-out infinite' }}>🎯</span>
          <span style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#581c87', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Objective</span>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
        <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 700, color: '#1f2937', margin: 0, lineHeight: 1.5 }}>
          {activeTask.text}
        </p>
      </div>

      {/* Mini Roadmap Preview List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ fontFamily: dm, fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Upcoming Steps</p>
        {upcomingTasks.map(task => (
          <div key={task.day} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: 0.7 }}>
            <span style={{ fontSize: 11, color: '#d1d5db', marginTop: 2 }}>🔘</span>
            <p style={{ fontFamily: dm, fontSize: 10, fontWeight: 600, color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
              <span style={{ fontWeight: 800, color: '#4b5563' }}>Day {task.day}:</span> {task.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
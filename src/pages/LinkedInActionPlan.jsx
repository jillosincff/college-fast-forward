import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { navigate } from '@/components/utils/navigation';
import { Home, FileText, Search, Building2, MessageSquare, Check, Calendar, ArrowLeft } from 'lucide-react';

function SideNav() {
  const NAV = [
    { icon: Home, page: 'FreeTierDashboard' },
    { icon: FileText, page: 'ResumeTailoring' },
    { icon: Search, page: 'FreeTierDashboard?tab=alumni_search' },
    { icon: Building2, page: 'FreeTierDashboard?tab=company_intel' },
    { icon: MessageSquare, page: 'MyMessages' },
  ];
  return (
    <div style={{ width: 60, background: '#fff', borderRight: '1px solid #E5E5E5', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, position: 'sticky', top: 0, height: '100vh' }}>
      {NAV.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.page} onClick={() => navigate(item.page)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#666', minHeight: 'auto', minWidth: 'auto' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );
}

export default function LinkedInActionPlan() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState({});

  useEffect(() => {
    // Get analysis from session storage (passed from LinkedInReview)
    const analysisStr = sessionStorage.getItem('linkedin_analysis');
    if (analysisStr) {
      const analysis = JSON.parse(analysisStr);
      generateTasks(analysis);
    }
    
    // Load completed tasks from localStorage
    const savedCompleted = localStorage.getItem('linkedin_action_plan_completed');
    if (savedCompleted) {
      setCompleted(JSON.parse(savedCompleted));
    }
  }, []);

  const generateTasks = (analysis) => {
    const newTasks = [];
    const priorityMap = { headline: 1, about: 2, experience: 3, skills: 4, completeness: 5 };

    // Extract low-scoring sections (score < 80)
    Object.entries(analysis.sections || {}).forEach(([sectionKey, section]) => {
      if (section.score < 80) {
        const daysUntilDeadline = Math.ceil((80 - section.score) / 10) || 3;
        newTasks.push({
          id: sectionKey,
          section: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
          task: getTaskDescription(sectionKey, section),
          score: section.score,
          priority: priorityMap[sectionKey] || 6,
          deadline: new Date(Date.now() + daysUntilDeadline * 24 * 60 * 60 * 1000).toLocaleDateString(),
          hint: section.feedback,
          suggested: section.suggested,
        });
      }
    });

    // Sort by priority
    newTasks.sort((a, b) => a.priority - b.priority);
    setTasks(newTasks);
  };

  const getTaskDescription = (section, data) => {
    const descriptions = {
      headline: `Add a compelling headline: "${data.suggested || 'Your Target Role | Key Skills | Value Proposition'}"`,
      about: `Write your About section to tell your story and career goals`,
      experience: `Add or enhance your work experience with quantified achievements`,
      skills: `Add missing technical skills and endorsements`,
      completeness: `Complete missing profile sections like photo, location, education`,
    };
    return descriptions[section] || `Improve your ${section} section`;
  };

  const toggleTask = (taskId) => {
    const newCompleted = { ...completed, [taskId]: !completed[taskId] };
    setCompleted(newCompleted);
    localStorage.setItem('linkedin_action_plan_completed', JSON.stringify(newCompleted));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav />
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '40px 24px', width: '100%' }}>
        <button onClick={() => navigate('LinkedInReview')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#888', marginBottom: 24, padding: 0, minHeight: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={14} /> Back to Review
        </button>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E85D20', margin: '0 0 12px' }}>LINKEDIN IMPROVEMENT PLAN</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: '0 0 8px' }}>
            Your 30-Day Action Plan
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
            {tasks.length} improvements identified. Complete them to reach a 90+ score.
          </p>
        </div>

        {tasks.length > 0 && (
          <div style={{ background: '#FFF5F0', border: '1px solid rgba(232,93,32,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>Progress</p>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#E85D20' }}>{completedCount}/{tasks.length}</span>
            </div>
            <div style={{ height: 8, background: 'rgba(232,93,32,0.1)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#E85D20', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#888', margin: '12px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{progress}% Complete</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task, idx) => (
            <div key={task.id} style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 14, padding: '18px 20px', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={completed[task.id] || false}
                  onChange={() => toggleTask(task.id)}
                  style={{ width: 20, height: 20, cursor: 'pointer', marginTop: 2, flexShrink: 0, minHeight: 'auto' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: completed[task.id] ? '#CCCCCC' : '#1A1A1A', margin: 0, textDecoration: completed[task.id] ? 'line-through' : 'none' }}>
                      {idx + 1}. {task.section}
                    </h3>
                    <span style={{ background: task.score >= 60 ? '#FFF5F0' : '#FFE5E5', color: task.score >= 60 ? '#E85D20' : '#EF4444', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, flexShrink: 0 }}>
                      {task.score}/100
                    </span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: completed[task.id] ? '#CCCCCC' : '#555', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {task.task}
                  </p>
                  {task.suggested && (
                    <div style={{ background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#22C55E', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✨ Suggested</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#1A1A1A', margin: 0 }}>{task.suggested}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: '#AAAAAA' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> Due: {task.deadline}
                    </span>
                    {task.score < 60 && <span style={{ color: '#EF4444', fontWeight: 700 }}>⚡ HIGH PRIORITY</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#F5F5F5', borderRadius: 14 }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#888', margin: 0 }}>
              No analysis yet. Go back to LinkedIn Review to analyze your profile.
            </p>
          </div>
        )}

        {completedCount === tasks.length && tasks.length > 0 && (
          <div style={{ marginTop: 32, padding: '32px 24px', background: '#F0FFF4', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#22C55E', margin: '0 0 8px' }}>🎉 All Done!</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#1A1A1A', margin: 0 }}>
              You've completed all improvements. Re-review your profile to see the new score.
            </p>
            <button onClick={() => navigate('LinkedInReview')} style={{ background: '#22C55E', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 16, minHeight: 'auto' }}>
              Re-Review Profile →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
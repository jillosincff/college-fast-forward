import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { jobTrajectoryValue } from '@/lib/careerTrajectory/engine';

const dm = "'Satoshi', 'Inter', system-ui, sans-serif";

// "Why this matters for your future" — connects a specific job to the
// student's saved career trajectory. Renders nothing when neutral.
export default function TrajectoryFitCard({ job, user }) {
  const [traj, setTraj] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.StudentCareerTrajectory.filter({ user_email: user.email, status: 'active' })
      .then(rows => setTraj(rows?.[0] || null))
      .catch(() => {});
  }, [user?.email]);

  if (!traj) return null;
  const assess = jobTrajectoryValue(job.role || job.job_title || '', traj);
  if (!assess) return null;

  const path = (traj.long_term_path || []).join(' → ');

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '16px 20px', marginBottom: 16 }}>
      <p style={{ fontFamily: dm, fontSize: 11, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
        📍 Why this matters for your future
      </p>
      <p style={{ fontFamily: dm, fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.55 }}>{assess.message}</p>
      {path && (
        <p style={{ fontFamily: dm, fontSize: 12, color: '#9ca3af', margin: '8px 0 0', lineHeight: 1.5 }}>
          Your path: {path}
        </p>
      )}
    </div>
  );
}
import { base44 } from '@/api/base44Client';
import { applyUrlOf } from '@/lib/jobFreshness';

// Writes the CRM row for an Apply action so history can read back as
// "HubSpot · Marketing Coordinator · Applied · Aug 22".
export async function logJobApplied({ user, job, alumniName = '' }) {
  if (!user?.email || !job) return;
  const now = new Date().toISOString();
  try {
    await base44.entities.NetworkingPipeline.create({
      user_email: user.email,
      company: job.name || '',
      job_title: job.job_title || '',
      job_url: applyUrlOf(job) || '',
      job_description: job.hiring_description || '',
      location: job.location || '',
      alumni_name: alumniName,
      application_path: alumniName ? 'alumni_outreach' : 'cold_apply',
      status: 'applied',
      status_date: now,
      identified_date: now,
    });
  } catch (e) {}
}
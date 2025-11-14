// Utility functions for consistent formatting across the app

export function formatOpportunityType(type) {
  const typeMap = {
    student_gig: 'Student Gig',
    internship: 'Internship',
    job: 'Job',
    fulltime: 'Full time',
    full_time: 'Full time',
    parttime: 'Part time', 
    part_time: 'Part time',
    contract: 'Contract',
    shadowing: 'Shadowing',
    project: 'Project',
  };
  
  const key = type?.toLowerCase().replace(/\s+/g, '_');
  return typeMap[key] || type?.replace(/\btime\b/i, 'time'); // fallback with time fix
}

export function formatLocationDisplay(locationType, city, state) {
  if (locationType === 'remote') return 'Remote';
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return locationType === 'hybrid' ? 'Hybrid' : 'On-site';
}
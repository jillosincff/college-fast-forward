export const dmSans = "'DM Sans', system-ui, sans-serif";
export const playfair = "'Playfair Display', Georgia, serif";
export const BG = '#0A0A0A';
export const CARD_BG = '#1A1A1A';
export const MUTED = '#888888';
export const ORANGE = '#E85D20';
export const BORDER = '#2A2A2A';

export const ACTIVE_TABS = [
  { id: 'company-intel', label: 'Company Intel', icon: '🏢' },
  { id: 'career-path', label: 'Career Path Research', icon: '🗺️' },
  { id: 'career-center', label: 'Career Center', icon: '🎓' },
  { id: 'career-goals', label: 'Career Goals', icon: '🎯' },
  { id: 'alumni-network', label: 'Alumni Network', icon: '👥' },
];

export const LOCKED_TABS = [
  { id: 'alumni-contacts', label: 'Alumni Contacts', icon: '👤' },
  { id: 'resume-tailoring', label: 'Resume Tailoring', icon: '📄' },
  { id: 'linkedin-review', label: 'LinkedIn Review', icon: '💼' },
  { id: 'job-search-crm', label: 'Job Search CRM', icon: '📊' },
  { id: 'follow-up-alerts', label: 'Follow-up Alerts', icon: '🔔' },
];

export const INDUSTRIES = [
  'Accounting & Finance', 'Advertising & Marketing', 'Architecture & Design',
  'Education', 'Engineering & Technology', 'Entertainment & Media',
  'Fashion & Retail', 'Government & Public Policy', 'Healthcare & Life Sciences',
  'Hospitality & Tourism', 'Investment Banking & Private Equity', 'Law & Legal Services',
  'Manufacturing & Operations', 'Non-Profit & Social Impact', 'Real Estate',
  'Sales & Business Development', 'Sports & Athletics', 'Supply Chain & Logistics', 'Other',
];

export const LOCATIONS = [
  'Remote', 'New York', 'Los Angeles', 'Chicago', 'Boston', 'Miami', 'San Francisco', 'Other',
];

export function ensureFonts() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('student-dash-fonts')) return;
  const link = document.createElement('link');
  link.id = 'student-dash-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
  document.head.appendChild(link);
}
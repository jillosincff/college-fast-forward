
export const USERS = [
  {
    id: 1,
    name: "Jessica Rivera",
    year: 2021,
    role: "Alum",
    title: "Software Engineer @ Google",
    location: "NYC",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/99bf20d25_hannah-busing-ahrrLDtnuNU-unsplash1.jpg",
    canHelp: ["Breaking into tech", "Finding campus jobs"],
    badges: ["Super Connector", "Reply rate: 98%"],
    isOnline: true,
    matchReason: "Shared interest: Tech Industry"
  },
  {
    id: 2,
    name: "Alan Nguyen",
    year: 2025,
    role: "Student",
    title: "Senior, Finance",
    location: "Gainesville",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9528eb42c_linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg",
    canHelp: ["Interview prep", "Resume Review"],
    badges: ["First-generation", "New to Platform"],
    isOnline: true,
    matchReason: "Same hometown"
  },
  {
    id: 3,
    name: "Monica Patel",
    year: null,
    role: "Parent",
    title: "Parent: Sarah '24",
    location: "Orlando",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/542b0822d_alex-starnes-PK_t0Lrh7MM-unsplash.jpg",
    canHelp: ["Internship introductions", "Moving tips"],
    badges: ["Willing to Mentor"],
    isOnline: false,
    matchReason: "Has mentored 4 students this semester"
  },
  {
    id: 4,
    name: "David Chen",
    year: 2018,
    role: "Alum",
    title: "Product Manager @ Meta",
    location: "San Francisco",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/99bf20d25_hannah-busing-ahrrLDtnuNU-unsplash1.jpg",
    canHelp: ["Product Management", "Networking"],
    badges: ["Top Connector"],
    isOnline: true,
    matchReason: "People near you"
  },
  {
    id: 5,
    name: "Emily Rodriguez",
    year: 2024,
    role: "Student",
    title: "Junior, Pre-Med",
    location: "Gainesville",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/542b0822d_alex-starnes-PK_t0Lrh7MM-unsplash.jpg",
    canHelp: ["MCAT Study Group", "Volunteering Opps"],
    badges: [],
    isOnline: false,
    matchReason: "Same major"
  },
  {
    id: 6,
    name: "Michael Thompson",
    year: 2019,
    role: "Alum",
    title: "Investment Banker @ Goldman Sachs",
    location: "NYC",
    photo: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9528eb42c_linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg",
    canHelp: ["Finance careers", "Wall Street prep"],
    badges: ["Finance Expert"],
    isOnline: true,
    matchReason: "Alumni like you"
  }
];

export const SUCCESS_STORIES = [
  {
    id: 101,
    story: "Jin ('23) connected with Maria for a coffee chat — now interning at Google!",
  },
  {
    id: 102,
    story: "A parent intro helped Alex ('24) land a final round interview at P&G."
  },
  {
    id: 103,
    story: "The resume review from an alum helped Chloe ('22) get her first job offer."
  },
  {
    id: 104,
    story: "Emma found her study group through Gator connections — now acing organic chemistry!"
  }
];

export const ACTIVITY = [
  "92% of alumni respond in under a day!",
  "Gabi just connected with Michael ('20) in Marketing.",
  "15 new connections made in the last hour.",
  "3 parents offered internship help today.",
  "Sarah ('24) got a job offer through an alumni referral!",
  "New study group formed for Computer Science majors."
];

export const HELP_REQUESTS = [
  {
    id: 1,
    studentName: "Jessica Lee",
    studentMajor: "Computer Science",
    studentYear: 2024,
    studentPhoto: "https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/99bf20d25_hannah-busing-ahrrLDtnuNU-unsplash1.jpg",
    postedDate: "2d ago",
    postedTimestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    title: "Seeking entry-level Software Engineer roles in FinTech",
    description: "Recent UF grad with experience in Python and React. Passionate about building tools that improve financial literacy. Looking for introductions at companies like Stripe, Plaid, or established banks in New York City. Open to remote opportunities as well.",
    helpType: "Job/Internship",
    industry: "Technology",
    location: "Remote or NYC",
    connections: 8,
    responses: 3,
    urgency: "High",
    isBoost: true,
    persona: 'Student',
    successMeter: 75,
    mutuals: 3
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentMajor: "Marketing",
    studentYear: 2025,
    studentPhoto: "https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/542b0822d_alex-starnes-PK_t0Lrh7MM-unsplash.jpg",
    postedDate: "5d ago",
    postedTimestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    title: "Looking for a mentor in the sports marketing industry",
    description: "Aspiring sports marketer currently interning with the Gators team. I'd love to connect with an alum in the field for career advice and insights on breaking into the industry. Specifically interested in agencies or major league teams.",
    helpType: "Mentorship",
    industry: "Sports & Entertainment",
    location: "Any",
    connections: 12,
    responses: 5,
    urgency: "Medium",
    isBoost: false,
    persona: 'Student',
    successMeter: 40,
    mutuals: 0
  },
  {
    id: 3,
    studentName: "David Garcia",
    studentMajor: "Finance",
    studentYear: 2022,
    studentPhoto: "https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/9528eb42c_linkedin-sales-solutions-pAtA8xe_iVM-unsplash.jpg",
    postedDate: "1w ago",
    postedTimestamp: new Date(new Date().setDate(new Date().getDate() - 7)),
    title: "Career transition advice from finance to product management",
    description: "I have two years of experience in investment banking but I'm looking to transition into a product manager role. Seeking advice from alumni who have made a similar switch. I am particularly interested in understanding the key skills to develop.",
    helpType: "Career Transition",
    industry: "Consulting",
    location: "Remote",
    connections: 22,
    responses: 8,
    urgency: "Medium",
    isBoost: true,
    persona: 'Alumni',
    successMeter: 65,
    mutuals: 7
  },
  {
    id: 4,
    studentName: "Emily Rodriguez",
    studentMajor: "Pre-Med",
    studentYear: 2026,
    studentPhoto: "https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/a511850d5_jonas-kakaroto-mjRwhvqEC0U-unsplash.jpg",
    postedDate: "1d ago",
    postedTimestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    title: "Guidance on medical school applications and interviews",
    description: "Sophomore pre-med student seeking advice on how to build a strong application for medical school. Would love to hear about interview experiences or get feedback on my personal statement.",
    helpType: "Academic Guidance",
    industry: "Healthcare/Medicine",
    location: "Gainesville, FL",
    connections: 5,
    responses: 1,
    urgency: "High",
    isBoost: false,
    persona: 'Student',
    successMeter: 20,
    mutuals: 1
  },
  {
    id: 5,
    studentName: "Chris Taylor",
    studentMajor: "Journalism",
    studentYear: 2023,
    studentPhoto: "https://qtrypzzcjebvfciynt.supabase.co/storage/v1/object/public/base44-prod/public/f703e3519_julian-wan-WnoLnJo7tS8-unsplash.jpg",
    postedDate: "2w ago",
    postedTimestamp: new Date(new Date().setDate(new Date().getDate() - 14)),
    title: "Seeking opportunities in digital media and marketing",
    description: "I'm a recent journalism grad with a passion for storytelling and digital marketing. My experience includes writing for The Alligator and managing social media for local businesses. Open to any connections!",
    helpType: "Job/Internship",
    industry: "Media & Marketing",
    location: "Remote or Florida",
    connections: 18,
    responses: 6,
    urgency: "Low",
    isBoost: false,
    persona: 'Alumni',
    successMeter: 100,
    mutuals: 0
  }
];

export const ONLINE_NOW = [];

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const sampleParents = [
  {
    email: "sarah.chen.demo@ufparents.com",
    full_name: "Sarah Chen",
    persona: "parent",
    roles: ["parent"],
    onboarding_completed: true,
    job_title: "Senior Product Manager",
    company: "Google",
    industry: "Technology",
    years_of_experience: "11-15",
    expertise_areas: ["Product Management", "User Research", "Data Analytics", "Product Strategy", "Tech"],
    mentorship_topics: ["Career transitions into PM", "Interview preparation", "Product sense", "Stakeholder management"],
    companies_worked_at: ["Google", "Meta", "Microsoft"],
    ways_to_help: ["Resume Review", "Mock Interviews", "Career Advice", "Make Introductions"],
    can_provide_referrals: true,
    bio: "Product Manager at Google with 12+ years experience leading B2C products. I love helping students break into product management and have helped 15+ Gators land PM roles at top tech companies.",
    linkedin_url: "https://linkedin.com/in/sarahchen",
    location_city: "Mountain View",
    location_state: "CA",
    show_in_directory: true,
    profile_image: "https://i.pravatar.cc/150?img=47"
  },
  {
    email: "michael.rodriguez.demo@ufparents.com",
    full_name: "Michael Rodriguez",
    persona: "parent",
    roles: ["parent"],
    onboarding_completed: true,
    job_title: "Investment Banking Managing Director",
    company: "Goldman Sachs",
    industry: "Finance",
    years_of_experience: "16-20",
    expertise_areas: ["Investment Banking", "Finance", "M&A", "Financial Modeling", "Consulting"],
    mentorship_topics: ["Breaking into finance", "Investment banking interviews", "Networking strategies", "MBA recruiting"],
    companies_worked_at: ["Goldman Sachs", "JP Morgan", "McKinsey & Company"],
    ways_to_help: ["Career Advice", "Mock Interviews", "Resume Review", "Make Introductions"],
    can_provide_referrals: true,
    bio: "Managing Director in Tech M&A at Goldman Sachs. Former McKinsey consultant. I'm passionate about helping Gators navigate finance careers and have mentored 20+ students into top banking and consulting firms.",
    linkedin_url: "https://linkedin.com/in/mrodriguez",
    location_city: "New York",
    location_state: "NY",
    show_in_directory: true,
    profile_image: "https://i.pravatar.cc/150?img=12"
  },
  {
    email: "jennifer.williams.demo@ufparents.com",
    full_name: "Jennifer Williams",
    persona: "parent",
    roles: ["parent"],
    onboarding_completed: true,
    job_title: "Chief Marketing Officer",
    company: "Nike",
    industry: "Marketing",
    years_of_experience: "16-20",
    expertise_areas: ["Marketing", "Brand Strategy", "Digital Marketing", "Consumer Insights", "Leadership"],
    mentorship_topics: ["Marketing career paths", "Building a personal brand", "Leadership development", "Creative strategy"],
    companies_worked_at: ["Nike", "Coca-Cola", "Procter & Gamble"],
    ways_to_help: ["Career Advice", "Resume Review", "Make Introductions", "Industry Insights"],
    can_provide_referrals: true,
    bio: "CMO at Nike leading global brand strategy. 18 years in marketing across CPG and sportswear. Love connecting with ambitious Gators interested in marketing and brand management.",
    linkedin_url: "https://linkedin.com/in/jwilliams",
    location_city: "Portland",
    location_state: "OR",
    show_in_directory: true,
    profile_image: "https://i.pravatar.cc/150?img=20"
  },
  {
    email: "david.patel.demo@ufparents.com",
    full_name: "David Patel",
    persona: "parent",
    roles: ["parent"],
    onboarding_completed: true,
    job_title: "Principal Software Engineer",
    company: "Amazon Web Services",
    industry: "Technology",
    years_of_experience: "11-15",
    expertise_areas: ["Software Engineering", "Cloud Computing", "System Design", "Data Science", "Machine Learning"],
    mentorship_topics: ["Coding interviews", "System design", "Career growth in engineering", "Transitioning to tech"],
    companies_worked_at: ["Amazon Web Services", "Netflix", "Uber"],
    ways_to_help: ["Mock Interviews", "Resume Review", "Career Advice", "Make Introductions"],
    can_provide_referrals: true,
    bio: "Principal Engineer at AWS building large-scale distributed systems. I've been through 100+ technical interviews and love helping students ace their coding rounds. Open to referrals for strong candidates.",
    linkedin_url: "https://linkedin.com/in/dpatel",
    location_city: "Seattle",
    location_state: "WA",
    show_in_directory: true,
    profile_image: "https://i.pravatar.cc/150?img=33"
  },
  {
    email: "lisa.martinez.demo@ufparents.com",
    full_name: "Lisa Martinez",
    persona: "parent",
    roles: ["parent"],
    onboarding_completed: true,
    job_title: "Healthcare Administrator",
    company: "Mayo Clinic",
    industry: "Healthcare",
    years_of_experience: "11-15",
    expertise_areas: ["Healthcare Administration", "Public Health", "Healthcare Policy", "Operations Management"],
    mentorship_topics: ["Healthcare careers", "Pre-med guidance", "Healthcare MBA paths", "Public health opportunities"],
    companies_worked_at: ["Mayo Clinic", "Cleveland Clinic", "Johns Hopkins"],
    ways_to_help: ["Career Advice", "Resume Review", "Industry Insights"],
    can_provide_referrals: false,
    bio: "Healthcare Administrator at Mayo Clinic with expertise in operations and strategic planning. Happy to guide Gators interested in healthcare, public health, or medical careers.",
    linkedin_url: "https://linkedin.com/in/lmartinez",
    location_city: "Rochester",
    location_state: "MN",
    show_in_directory: true,
    profile_image: "https://i.pravatar.cc/150?img=45"
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !user.roles?.includes('admin')) {
      return Response.json({ 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }

    const created = [];
    const errors = [];

    for (const parentData of sampleParents) {
      try {
        const allUsers = await base44.asServiceRole.entities.User.list();
        const existingUser = allUsers.find(u => u.email === parentData.email);

        if (existingUser) {
          await base44.asServiceRole.entities.User.update(
            existingUser.id,
            parentData
          );
          created.push({ email: parentData.email, status: 'updated' });
        } else {
          const randomPassword = `Demo${Math.random().toString(36).slice(2, 10)}!`;
          
          const newUser = await base44.asServiceRole.auth.register({
            email: parentData.email,
            password: randomPassword,
            full_name: parentData.full_name
          });

          if (newUser?.id) {
            await base44.asServiceRole.entities.User.update(newUser.id, {
              ...parentData,
              email: parentData.email,
              full_name: parentData.full_name
            });
            created.push({ email: parentData.email, status: 'created', id: newUser.id });
          }
        }
      } catch (error) {
        console.error(`Error with ${parentData.email}:`, error);
        errors.push({ 
          email: parentData.email, 
          error: error.message 
        });
      }
    }

    return Response.json({
      success: true,
      created: created.length,
      errors: errors.length,
      details: { created, errors }
    });

  } catch (error) {
    console.error('Error creating sample parents:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
});
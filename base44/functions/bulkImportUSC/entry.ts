import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function tempPassword() {
  return 'CFF_' + Math.random().toString(36).slice(2, 10) + '_import!';
}

const USC_USERS = [
  { email: "simpkins02@yahoo.com", full_name: "simpkins02", onboarding: false },
  { email: "anne.gamble@comcast.net", full_name: "anne.gamble", onboarding: false },
  { email: "theobeth@gmail.com", full_name: "Elizabeth McCrea Theodore", onboarding: false },
  { email: "kallianesis4@gmail.com", full_name: "premonc", onboarding: false },
  { email: "andrea.eckert@gmail.com", full_name: "Andrea Eckert", onboarding: true, company: "Self Employed", position: "Community Engagement Consultant", industry: "nonprofit" },
  { email: "heidimellison@gmail.com", full_name: "Heidi Mellison", onboarding: false },
  { email: "8nzcd8hn55@privaterelay.appleid.com", full_name: "", onboarding: false },
  { email: "greene8600@gmail.com", full_name: "", onboarding: false },
  { email: "mstetz76@gmail.com", full_name: "Melanie Stetz", onboarding: false },
  { email: "knoxlatonya7@gmail.com", full_name: "LaTonya Charise", onboarding: false },
  { email: "p9sfbgnky7@privaterelay.appleid.com", full_name: "", onboarding: false },
  { email: "1runnergirl327@gmail.com", full_name: "Katherine Hoenig", onboarding: false },
  { email: "lizasklar@hotmail.com", full_name: "Lisa Sklar", onboarding: false },
  { email: "rmjann@gmail.com", full_name: "Renée Jannuzzi", onboarding: false },
  { email: "rdobb@dobb.me", full_name: "Ryan Dobb", onboarding: false },
  { email: "gosinoff@gmail.com", full_name: "Greg Osinoff", onboarding: false },
  { email: "brendanmattera@gmail.com", full_name: "Brendan Mattera", persona: "alumni", onboarding: false },
  { email: "marcymccabept@gmail.com", full_name: "Marcy McCabe", onboarding: false },
  { email: "kelli.dellinger@gmail.com", full_name: "Kelli Dellinger", onboarding: false },
  { email: "shaun754@gmail.com", full_name: "Shaun Washington", onboarding: false },
  { email: "kelly_email@yahoo.com", full_name: "Kelly", onboarding: false },
  { email: "mhawkins2830@gmail.com", full_name: "Michelle Hawkins", onboarding: false },
  { email: "scoyne443@gmail.com", full_name: "Scott Coyne", onboarding: false },
  { email: "macfarm100@gmail.com", full_name: "Angeli Macdonald", onboarding: false },
  { email: "rebeccagadomski@gmail.com", full_name: "Rebecca Gadomski", onboarding: true, company: "Lifestance Health", position: "Operations Director", industry: "healthcare" },
  { email: "catherinebarbieri01@gmail.com", full_name: "Catherine Barbieri", onboarding: true, company: "Central Bucks School District", position: "Education", industry: "education" },
  { email: "candrewdds@yahoo.com", full_name: "Andrew Snell", onboarding: false },
  { email: "apolek@nasd.k12.pa.us", full_name: "Alison Polek", onboarding: false },
  { email: "mackbrynn1313@gmail.com", full_name: "Teresa Badalamenti", onboarding: true, company: "Byram Township Schools", position: "Teacher", industry: "education" },
  { email: "rebecca.dawsonrn@gmail.com", full_name: "Rebecca Dawson", onboarding: false },
  { email: "agalm@verizon.net", full_name: "Amanda Galm", onboarding: false },
  { email: "janinelmclements@gmail.com", full_name: "Janine Clements", onboarding: true, company: "Freelance", position: "Writer & Editor", industry: "marketing" },
  { email: "jsniffen@gmail.com", full_name: "Jennifer Sniffen", onboarding: false },
  { email: "danagreci19@gmail.com", full_name: "Dana Greci", onboarding: false },
  { email: "theresam.elmer@gmail.com", full_name: "Theresa Elmer", onboarding: false },
  { email: "mlbelusic@yahoo.com", full_name: "Melisa Skific", onboarding: false },
  { email: "nancy.jackson@gmail.com", full_name: "Nancy Jackson", onboarding: false },
  { email: "heathermorris2579@gmail.com", full_name: "Heather Morris", persona: "alumni", onboarding: false },
  { email: "jenprince23@gmail.com", full_name: "Jennifer Prince", onboarding: true, company: "Accel Schools", position: "Director of Operations", industry: "education" },
  { email: "cmariepayne@gmail.com", full_name: "Christine Payne", onboarding: false },
  { email: "rachelsdf813@gmail.com", full_name: "Rachel Fortune", onboarding: false },
  { email: "krtship@gmail.com", full_name: "k topinka", onboarding: false },
  { email: "deniserphillips@gmail.com", full_name: "Denise Phillips", onboarding: false },
  { email: "sandcanelas@gmail.com", full_name: "Sandra Canelas", onboarding: false },
  { email: "pamelasher10@gmail.com", full_name: "Pam Sher", onboarding: false },
  { email: "catg355@gmail.com", full_name: "Catherine Anderson", onboarding: true, company: "Franklin Children's School", position: "Preschool Teacher", industry: "education" },
  { email: "hswslp@gmail.com", full_name: "Heather Williams", onboarding: false },
  { email: "drdave1827@gmail.com", full_name: "David Fields", onboarding: true, company: "Family Dentistry at Seven Hills", position: "Dentist", industry: "healthcare" },
  { email: "anunair12@gmail.com", full_name: "Anuradha Nair", onboarding: true, company: "South Carolina Office of Resilience", position: "Program Manager", industry: "government" },
  { email: "karen.denton@cherokee1.org", full_name: "Karen Denton", onboarding: true, company: "Gaffney High School", position: "Librarian", industry: "education" },
  { email: "tmattera99@gmail.com", full_name: "Tara Mattera", onboarding: false },
  { email: "ntbloom247@gmail.com", full_name: "Nina Bloomingburg", onboarding: false },
  { email: "ginamcguire5@gmail.com", full_name: "Gina McGuire", onboarding: false },
  { email: "dmrichmond72@gmail.com", full_name: "Dawn Richmond", onboarding: false },
  { email: "katjay320@gmail.com", full_name: "Kathleen Jeffcoat", onboarding: true, company: "Lake Washington School District", position: "Office Manager", industry: "education" },
  { email: "jennafaye11u@gmail.com", full_name: "Jenna Ursaner", persona: "alumni", onboarding: false },
  { email: "eurs16@gmail.com", full_name: "Evan Ursaner", persona: "alumni", onboarding: true, company: "Aetna, A CVS Health Company", position: "ULDP Underwriter", industry: "healthcare" },
  { email: "christineltate@gmail.com", full_name: "Christine Tate", onboarding: false },
  { email: "jodi@jodimurnick.com", full_name: "Jodi Murnick", onboarding: true, company: "Jodi Murnick Coaching", position: "Career Coach", industry: "consulting" },
  { email: "jillfields2@gmail.com", full_name: "Jill Fields", onboarding: false },
  { email: "allison.a.hallman@gmail.com", full_name: "Allison Hallman", onboarding: true, company: "DP Professionals", position: "Client Delivery Manager" },
  { email: "jbazzone@gmail.com", full_name: "Jill Bazzone", onboarding: true, company: "Cisco", position: "Senior Director, Communications", industry: "tech" },
  { email: "dj042103@gmail.com", full_name: "D Hollars", onboarding: true, company: "Grace Lane Properties LLC", position: "Owner", industry: "real_estate" },
  { email: "rachelawton@gmail.com", full_name: "Rochelle", onboarding: false },
  { email: "wscottmacdonald1@gmail.com", full_name: "W. Scott MacDonald", onboarding: true, company: "General Dynamics Information Technology", position: "Solutions Architect", industry: "tech" },
  { email: "smorris127@gmail.com", full_name: "Samantha Morris", onboarding: true, company: "Mondelez International", position: "Senior Counsel, Labor and Employment", industry: "law" },
  { email: "lauriebranum@gmail.com", full_name: "Laurie Branum", onboarding: true, company: "Deloitte", position: "Organizational Change Management Leader", industry: "consulting" },
  { email: "a.reardon@infantswim.com", full_name: "Amy Reardon", onboarding: false },
  { email: "vlangermatt@gmail.com", full_name: "Veronica Langer", onboarding: false },
  { email: "lisablinder26@gmail.com", full_name: "Lisa Rogers", onboarding: false },
  { email: "lisagold38@yahoo.com", full_name: "Lisa Gold", onboarding: false },
  { email: "janetlawson@optonline.net", full_name: "Janet Lawson", onboarding: false },
  { email: "nicoge63@gmail.com", full_name: "Alexandra Felsenhardt", onboarding: false },
  { email: "jennven@comcast.net", full_name: "Jen Venditti", onboarding: true, company: "Penn Medicine", position: "Practice Manager", industry: "healthcare" },
  { email: "cgbrown976@gmail.com", full_name: "Casey Brown", onboarding: false },
  { email: "jennagoldblatt@gmail.com", full_name: "Jenna Goldblatt", onboarding: false },
  { email: "lefkodeb2@gmail.com", full_name: "D Cohen", onboarding: false },
  { email: "bgilmore924@gmail.com", full_name: "Brandy Gilmore", onboarding: false },
  { email: "urotmt@gmail.com", full_name: "Tricia Thaker", onboarding: true, position: "Pediatric Nurse Practitioner", industry: "healthcare" },
  { email: "tejones404@gmail.com", full_name: "Thomas Jones", persona: "alumni", onboarding: true, industry: "healthcare" },
  { email: "courtlandmthomas@gmail.com", full_name: "Courtland Thomas", persona: "alumni", onboarding: true, company: "Chartwells Higher Education", position: "District Marketing Director", industry: "marketing" },
  { email: "sisireia@gmail.com", full_name: "Sisireia Simmons", persona: "alumni", onboarding: true, company: "Clemson University", position: "Academic Advisor", industry: "education" },
  { email: "taniahgerman@gmail.com", full_name: "Taniah German", persona: "alumni", onboarding: true, company: "Wells Fargo", position: "Auditor", industry: "finance" },
  { email: "sydneymgriffith@gmail.com", full_name: "Sydney Griffith", persona: "alumni", onboarding: true, position: "CTICU RN", industry: "healthcare" },
  { email: "chloeloftis123@gmail.com", full_name: "Chloe Loftis", persona: "alumni", onboarding: true },
  { email: "thenley03@icloud.com", full_name: "Taylor Henley", persona: "alumni", onboarding: true },
  { email: "dana.delavan@sumterschools.net", full_name: "Dana DeLavan", persona: "alumni", onboarding: false },
  { email: "adam@submersivemedia.com", full_name: "Adam Spielberger", onboarding: true, company: "Submersive Media", position: "Co-CEO", industry: "marketing" },
  { email: "risa.mcgrew@gmail.com", full_name: "Risa McGrew", onboarding: true, company: "Kerry", position: "Sr HR Business Partner", industry: "media" },
  { email: "gillchiro9@gmail.com", full_name: "Lauren G", onboarding: false },
  { email: "dpatten1524@gmail.com", full_name: "Donna Patten", onboarding: false },
  { email: "lasgesq@yahoo.com", full_name: "USC Member", onboarding: false },
  { email: "karenmmurphy17@gmail.com", full_name: "Karen Murphy", onboarding: true, company: "WMC Health", position: "Administrator", industry: "healthcare" },
  { email: "jolenekorzeniewski@gmail.com", full_name: "Jolene Korzeniewski", onboarding: false },
  { email: "sabotage1920@gmail.com", full_name: "Crystal Goodwin", onboarding: true, company: "United States Courts", position: "Senior United States Probation Officer", industry: "government" },
  { email: "miknshan@me.com", full_name: "Shannon Mourar", onboarding: true, company: "Insight PA Cyber Charter School", position: "Human Resources", industry: "education" },
  { email: "lawbarwick8@gmail.com", full_name: "Lori B", onboarding: false },
  { email: "taralimoco@gmail.com", full_name: "Tara Limoco", onboarding: true, company: "Blue Tent Online", position: "Teacher", industry: "education" },
  { email: "kristin@davisaudiology.com", full_name: "Kristin Davis", onboarding: true, company: "Davis Audiology", position: "Owner", industry: "healthcare" },
  { email: "pageamyd@gmail.com", full_name: "Amy Page", onboarding: true, company: "Coastal Community Foundation", position: "Program Officer", industry: "nonprofit" },
  { email: "jennifer.r.mosser@gmail.com", full_name: "Jennifer Mosser", onboarding: true, company: "LCPS", position: "Teacher", industry: "education" },
  { email: "mhelf12@gmail.com", full_name: "Mitch Helfman", onboarding: true, company: "MRH Real Estate Services, Inc.", position: "VP - Industrial Real Estate", industry: "real_estate" },
  { email: "adahlhauser4@gmail.com", full_name: "April Dahlhauser", onboarding: false },
  { email: "randisiegel08@gmail.com", full_name: "Randi Siegel", onboarding: false },
  { email: "mrbrianmlevine@gmail.com", full_name: "Brian Levine", onboarding: true, company: "Cresient", position: "CEO", industry: "tech" },
  { email: "sylvianola1970@gmail.com", full_name: "Sylvia Brown", onboarding: false },
  { email: "marisahhi@gmail.com", full_name: "Marisa Wagner", onboarding: false },
  { email: "kuulei0924@gmail.com", full_name: "Wendy Early", onboarding: false },
  { email: "artishort@gmail.com", full_name: "Arti Short", onboarding: false },
  { email: "logsfb@verizon.net", full_name: "JB", onboarding: false },
  { email: "nickolai_30342@yahoo.com", full_name: "Nicole Scarborough", onboarding: true, position: "Registered Nurse", industry: "healthcare" },
  { email: "danielle.rubenstein@gmail.com", full_name: "Danielle Rubenstein", onboarding: false },
  { email: "grdnjul@gmail.com", full_name: "Julie Houston", onboarding: true, company: "CHI", position: "COO", industry: "nonprofit" },
  { email: "ddsloane@gmail.com", full_name: "D Ryan", onboarding: false },
  { email: "jill@uffastforward.com", full_name: "Jill Osinoff", onboarding: true, company: "CFF", position: "Director", industry: "tech" },
  { email: "josinoff@gmail.com", full_name: "Jill Osinoff", onboarding: true, company: "CFF", position: "Founder", industry: "tech" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase().trim()).filter(Boolean));

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const row of USC_USERS) {
      const email = row.email?.toLowerCase().trim();

      // Skip private relay and already existing
      if (!email || email.includes('privaterelay.appleid.com')) { skipped++; continue; }
      if (existingEmails.has(email)) { skipped++; continue; }

      const persona = row.persona || 'parent';
      let fullName = row.full_name?.trim();
      if (!fullName) {
        const prefix = email.split('@')[0];
        fullName = prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }

      try {
        const registered = await base44.auth.register({
          email,
          password: tempPassword(),
          full_name: fullName,
        });

        if (registered?.id) {
          await base44.asServiceRole.entities.User.update(registered.id, {
            full_name: fullName,
            persona,
            roles: [persona],
            school_code: 'usc',
            school_name: 'University of South Carolina',
            school: 'University of South Carolina',
            onboarding_completed: row.onboarding === true,
            current_company: row.company || '',
            current_position: row.position || '',
            industry: row.industry || '',
            is_founding_member: true,
            visible_in_directory: true,
            source: 'csv_import_2026_04_25',
            alumni_intent: persona === 'alumni' ? 'seeking_help' : 'help_students',
          });
          created++;
          existingEmails.add(email);
          console.log(`Created: ${email}`);
        }

        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({ success: true, created, skipped, errors: errors.slice(0, 20) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
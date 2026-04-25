import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Just the ~25 users that kept failing due to rate limits
const STRAGGLERS = [
  {"full_name":"Kerry Dew","email":"dewgrassmusic@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Caroline Burgess","email":"caroline.burgess.cabrone@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Heather Werb","email":"werbie28@verizon.net","school":"ucf","persona":"parent","onboarding_completed":true,"company":"Hillsborough County Schools","job_title":"Middle school teacher","industry":"Education","linkedin_url":"www.linkedin.com/in/heather-werb-45837586","bio":"I have been in public education for over 30 years."},
  {"full_name":"Lauren Pike","email":"lauren.pike2018@gmail.com","school":"uga","persona":"alumni","onboarding_completed":true,"company":"Univ. of Georgia","job_title":"Assistant Director of Employer Relations","industry":"Education","linkedin_url":"https://linkedin.com/in/laurenpike22","bio":""},
  {"full_name":"Julie Garrett","email":"juligarrett@gmail.com","school":"uga","persona":"parent","onboarding_completed":true,"company":"Accenture","job_title":"Advanced App/Cloud Support & Engineering Associate Manager","industry":"Technology & Software","linkedin_url":"https://www.linkedin.com/in/julie-garrett/","bio":""},
  {"full_name":"Alice and Gwyn","email":"aligwyn@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"jodibossak@yahoo.com","school":"uga","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"tiffanygleason@me.com","school":"fau","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Carla Backitis","email":"cbackitis@gmail.com","school":"ucf","persona":"parent","onboarding_completed":true,"company":"Genpact","job_title":"Senior Process Associate","industry":"Technology & Software","linkedin_url":"","bio":"I have a lifetime of Customer Service experience."},
  {"full_name":"","email":"carin0112@icloud.com","school":"ucf","persona":"parent","onboarding_completed":true,"company":"Disney","job_title":"Administrative Assistant","industry":"Other","linkedin_url":"","bio":"30+ yrs in the administrative / sales arena with Disney."},
  {"full_name":"Amanda Espana-Tait","email":"aespanatait@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Bridget Duda","email":"bridgetmduda@gmail.com","school":"udel","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Kim Edelberg","email":"kim.edelberg@outlook.com","school":"fau","persona":"parent","onboarding_completed":true,"company":"Promowearhouse","job_title":"Former Volunteer Department Director, Social Worker, Life Coach, Educator","industry":"Consulting","linkedin_url":"https://www.linkedin.com/in/kim-edelberg-msw-mpa-1884a015b/","bio":"Professional with strong skills in interviewing, communication, and counseling various populations."},
  {"full_name":"Nicole Joice","email":"njoice@trschools.com","school":"fau","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Elissa Gruenberg","email":"elissa.gruenberg@gmail.com","school":"udel","persona":"parent","onboarding_completed":true,"company":"Frazier & Deeter Advisory, LLC","job_title":"Office Manager","industry":"Consulting","linkedin_url":"https://www.linkedin.com/in/elissa-gruenberg-8191472","bio":"I have spent 25+ years in recruiting, event planning, marketing, business development."},
  {"full_name":"Julianna Walker (Jay)","email":"juliannawalker15@gmail.com","school":"ucf","persona":"alumni","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Heather Barca","email":"heatherbarca@gmail.com","school":"udel","persona":"parent","onboarding_completed":true,"company":"Citi","job_title":"Director - Head of Internal Creative Agency Skyline","industry":"Marketing","linkedin_url":"https://www.linkedin.com/me","bio":"Over 20 years of creative agency management experience."},
  {"full_name":"Stacey garb","email":"staceyjgarb@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Diane Kemper","email":"wenaid815@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Cynthia Baldino","email":"cynthabaldino@gmail.com","school":"udel","persona":"parent","onboarding_completed":true,"company":"Canine Dimensions Dog Training","job_title":"Director of Operations","industry":"Other","linkedin_url":"","bio":""},
  {"full_name":"Esther Grillo","email":"grillokidscollege@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"lightmanpa@yahoo.com","school":"osu","persona":"parent","onboarding_completed":true,"company":"MayoSeitz Media","job_title":"SVP, Director Media Investment","industry":"Marketing","linkedin_url":"","bio":""},
  {"full_name":"Debbie Kravitz","email":"debbie@nykravitz.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"greene8600@gmail.com","school":"usc","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"brittyw@me.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Jennifer Rubin","email":"jlinnrubin@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Audr Peskin","email":"apeskin1217@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Matt Jacovsky","email":"mjacovsky22@gmail.com","school":"osu","persona":"alumni","onboarding_completed":true,"company":"Burns & McDonnell","job_title":"Mechanical Engineer","industry":"Engineering","linkedin_url":"https://linkedin.com/in/matthew-jacovsky","bio":""},
  {"full_name":"Kristin Yost","email":"kyost2775@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Robyn Walcoff","email":"robyn.walcoff@gmail.com","school":"psu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"allisonkgrossman4@icloud.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"","email":"goldeezgirl@me.com","school":"osu","persona":"parent","onboarding_completed":true,"company":"Family Bronze Corporation","job_title":"Owner, President","industry":"Other","linkedin_url":"","bio":""},
  {"full_name":"Nicole McCabe","email":"nikkimccabe79@gmail.com","school":"uga","persona":"parent","onboarding_completed":true,"company":"SAP","job_title":"Global GTM lead for Snowflake","industry":"Technology & Software","linkedin_url":"https:/www.linkedin.com/in/mccabenicole","bio":"I have been in the tech industry for over 25 years."},
  {"full_name":"lynn sunset","email":"lynnsunset73@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Dena Astrin","email":"beautycounterbydena@gmail.com","school":"osu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Kristin Cardoso","email":"okcardoso@gmail.com","school":"ucf","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Jason Torres","email":"neddtorres@gmail.com","school":"ucf","persona":"parent","onboarding_completed":true,"company":"Dept of the Air Force","job_title":"Chief Engineer","industry":"Engineering","linkedin_url":"","bio":""},
  {"full_name":"Selena Van Klompenberg","email":"selenamarievk@gmail.com","school":"umich","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Jen Olarsch","email":"jenolarsch@gmail.com","school":"umich","persona":"alumni","onboarding_completed":true,"company":"PT-concierge.com","job_title":"Physical Therapist","industry":"Healthcare & Life Sciences","linkedin_url":"","bio":""},
  {"full_name":"zachary.zimmerman","email":"zachary.zimmerman@cantor.com","school":"umich","persona":"alumni","onboarding_completed":true,"company":"Cantor Fitzgerald","job_title":"Equity Sales Trader","industry":"Finance & Banking","linkedin_url":"https://linkedin.com/in/zachary-zimmerman-ab8b18214","bio":""},
  {"full_name":"barrifruitbine","email":"barrifruitbine@gmail.com","school":"utexas","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"tfhertwig","email":"tfhertwig@msn.com","school":"psu","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Tracy Smith","email":"tkollinsmith@gmail.com","school":"umich","persona":"alumni","onboarding_completed":true,"company":"Carriage Hill, Inc","job_title":"VP Research","industry":"Finance & Banking","linkedin_url":"","bio":""},
  {"full_name":"charnasfamily5","email":"charnasfamily5@gmail.com","school":"umich","persona":"alumni","onboarding_completed":true,"company":"","job_title":"","industry":"Healthcare & Life Sciences","linkedin_url":"","bio":""},
  {"full_name":"hopespiller","email":"hopespiller@gmail.com","school":"umich","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
];

const SCHOOL_MAP = {
  'usc': { code: 'usc', name: 'University of Southern California' },
  'osu': { code: 'osu', name: 'Ohio State University' },
  'umich': { code: 'umich', name: 'University of Michigan' },
  'ucf': { code: 'ucf', name: 'University of Central Florida' },
  'udel': { code: 'udel', name: 'University of Delaware' },
  'uga': { code: 'uga', name: 'University of Georgia' },
  'psu': { code: 'psu', name: 'Penn State University' },
  'umd': { code: 'umd', name: 'University of Maryland' },
  'tulane': { code: 'tulane', name: 'Tulane University' },
  'fau': { code: 'fau', name: 'Florida Atlantic University' },
  'fsu': { code: 'fsu', name: 'Florida State University' },
  'uky': { code: 'uky', name: 'University of Kentucky' },
  'jmu': { code: 'jmu', name: 'James Madison University' },
  'miami': { code: 'miami', name: 'University of Miami' },
  'utexas': { code: 'utexas', name: 'University of Texas at Austin' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Fetch existing emails
    const existingUsers = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase().trim()).filter(Boolean));

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const row of STRAGGLERS) {
      const email = row.email?.toLowerCase().trim();
      if (!email || existingEmails.has(email)) { skipped++; continue; }

      const schoolCode = row.school?.toLowerCase().trim();
      const school = SCHOOL_MAP[schoolCode];
      if (!school) { skipped++; continue; }

      let fullName = row.full_name?.trim();
      if (!fullName || fullName.includes('@')) {
        const prefix = email.split('@')[0];
        fullName = prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }

      try {
        await base44.asServiceRole.entities.User.create({
          full_name: fullName,
          email,
          persona: row.persona,
          roles: [row.persona],
          onboarding_completed: row.onboarding_completed === true,
          school_code: school.code,
          school_name: school.name,
          school: school.name,
          company: row.company || '',
          current_company: row.company || '',
          job_title: row.job_title || '',
          current_position: row.job_title || '',
          industry: row.industry || '',
          linkedin_url: row.linkedin_url || '',
          bio: row.bio || '',
          visible_in_directory: true,
          intro_willingness: 'yes',
          is_founding_member: true,
          source: 'csv_import_2026_04',
          alumni_intent: row.persona === 'alumni' ? 'giving_help' : 'help_students',
        });
        created++;
        existingEmails.add(email); // prevent re-insert within same run
        await new Promise(r => setTimeout(r, 500)); // generous delay
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({ success: true, created, skipped, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
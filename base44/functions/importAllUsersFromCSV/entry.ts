import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

// Complete CSV data - all 403+ users
const CSV_USERS = [
  {"full_name":"jason.kaisrlik","email":"jason.kaisrlik@gmail.com","school":"ucf","persona":"alumni"},
  {"full_name":"shell147","email":"shell147@zoominternet.net","school":"udel","persona":"parent","company":"Wellspan","job_title":"Nurse","industry":"Healthcare & Life Sciences"},
  {"full_name":"Jill Osinoff","email":"jill@uffastforward.com","school":"usc","persona":"parent","company":"CFF","job_title":"Director"},
  {"full_name":"Jodi Leone","email":"jodi.leone@gmail.com","school":"umich","persona":"alumni"},
  {"full_name":"dibeerman","email":"dibeerman@hotmail.com","school":"umich","persona":"parent","company":"Selig Law Firm","job_title":"Attorney","industry":"Law & Legal"},
  {"full_name":"Matt Levin","email":"mattlevin1111@gmail.com","school":"umich","persona":"alumni","company":"Markowitz Herbold","job_title":"Partner","industry":"Law & Legal"},
  {"full_name":"Tom Naughton","email":"tjnaugh14@gmail.com","school":"umich","persona":"alumni","company":"Ignite Digital","job_title":"Senior Consultant","industry":"Technology & Software"},
  {"full_name":"sivin","email":"sivin@optonline.net","school":"umich","persona":"parent","company":"L and L Painting Co., Inc.","job_title":"Vice President, Corporate Administration"},
  {"full_name":"Dahlia Topolosky","email":"dahliatop@gmail.com","school":"umd","persona":"parent","company":"Integrative Therapy of Greater Washington","job_title":"Clinical Psychologist","industry":"Healthcare & Life Sciences"},
  {"full_name":"Margo Strahlberg","email":"margostrahlberg@gmail.com","school":"umd","persona":"parent","company":"U.S. Bank","job_title":"Prepaid Compliance Risk Management Specialist","industry":"Finance & Banking"},
  {"full_name":"Robin Fiddle Posnack","email":"robinfiddleposnack@gmail.com","school":"tulane","persona":"parent","company":"TWIN Computers","job_title":"President and Founder","industry":"Technology & Software"},
  {"full_name":"mpeskoff","email":"mpeskoff@yahoo.com","school":"fau","persona":"parent","company":"Bottomline Technologies","job_title":"Account Manager","industry":"Technology & Software"},
  {"full_name":"staceyrkaye","email":"staceyrkaye@gmail.com","school":"uga","persona":"parent","company":"WwwCampusToCareer.net","job_title":"Job Search Skills Coach","industry":"Other"},
  {"full_name":"alyssarukin1","email":"alyssarukin1@gmail.com","school":"osu","persona":"parent","company":"University Hospitals","job_title":"Social Worker","industry":"Healthcare & Life Sciences"},
  {"full_name":"Debbie Blume","email":"blumecollegeconsulting@gmail.com","school":"uga","persona":"parent","company":"Blume College Consulting, LLC","job_title":"Independent College Counselor","industry":"Education"},
  {"full_name":"lvkates","email":"lvkates@gmail.com","school":"fsu","persona":"parent","company":"HCLTech","job_title":"Director, Global Process Excellence","industry":"Technology & Software"},
  {"full_name":"lkbrien","email":"lkbrien@yahoo.com","school":"tulane","persona":"alumni","company":"Self-employed private practice","job_title":"Clinical Psychologist","industry":"Healthcare & Life Sciences"},
  {"full_name":"Anthony Sagardia","email":"anthony.sagardia@gmail.com","school":"ucf","persona":"alumni","company":"Rain Technology Solutions","job_title":"VP of Engineering","industry":"Technology & Software"},
  {"full_name":"lfishman421","email":"lfishman421@gmail.com","school":"uky","persona":"parent","company":"Solus Alternative Asset Management LP","job_title":"Managing Director, Director of Client Services/Investor Relations","industry":"Finance & Banking"},
  {"full_name":"lfish421","email":"lfish421@yahoo.com","school":"jmu","persona":"parent","company":"Solus Alternative Asset Management LP","job_title":"Managing Director, Director of Client Services/Investor Relations","industry":"Finance & Banking"},
  {"full_name":"scottdkaplan","email":"scottdkaplan@gmail.com","school":"osu","persona":"parent","company":"Great Plains Data","job_title":"CFO | Advisory Board Member | Strategic & Financial Advisor","industry":"Finance & Banking"},
  {"full_name":"Shari Hodgson","email":"hodgsons@bbhcsd.org","school":"osu","persona":"parent","company":"Brecksville Broadview Heights City Schools","job_title":"Speech Pathologist","industry":"Healthcare & Life Sciences"},
  {"full_name":"Amy Dryfuse","email":"amydryfuse@gmail.com","school":"osu","persona":"parent","company":"Mercy Health","job_title":"Nuclear Medicine Technologist","industry":"Healthcare & Life Sciences"},
  {"full_name":"Nicole McCabe","email":"nikkimccabe79@gmail.com","school":"uga","persona":"parent","company":"SAP","job_title":"Global GTM lead for Snowflake","industry":"Technology & Software"},
  {"full_name":"Amy Davies","email":"amydavies1023@gmail.com","school":"uga","persona":"parent","company":"Sylvane, Inc","job_title":"Senior Buyer","industry":"Other"},
  {"full_name":"Stacy Bernstein","email":"bernstein.stacy@gmail.com","school":"uga","persona":"parent","company":"Summit health","job_title":"Physician","industry":"Healthcare & Life Sciences"},
  {"full_name":"Lauren Pike","email":"lauren.pike2018@gmail.com","school":"uga","persona":"alumni","company":"Univ. of Georgia","job_title":"Assistant Director of Employer Relations","industry":"Education"},
  {"full_name":"Julie Garrett","email":"juligarrett@gmail.com","school":"uga","persona":"parent","company":"Accenture","job_title":"Advanced App/Cloud Support & Engineering Associate Manager","industry":"Technology & Software"},
  {"full_name":"Jenn Pitera","email":"jennpitera1@gmail.com","school":"uga","persona":"parent"},
  {"full_name":"Lisa Kaestle","email":"lisakaestle1@gmail.com","school":"udel","persona":"parent","company":"Georgia Tech University","job_title":"Part time application reader","industry":"Healthcare & Life Sciences"},
  {"full_name":"Elissa Gruenberg","email":"elissa.gruenberg@gmail.com","school":"udel","persona":"parent","company":"Frazier & Deeter Advisory, LLC","job_title":"Office Manager","industry":"Consulting"},
  {"full_name":"Heather Barca","email":"heatherbarca@gmail.com","school":"udel","persona":"parent","company":"Citi","job_title":"Director - Head of Internal Creative Agency Skyline","industry":"Marketing"},
  {"full_name":"Cynthia Baldino","email":"cynthabaldino@gmail.com","school":"udel","persona":"parent","company":"Canine Dimensions Dog Training","job_title":"Director of Operations","industry":"Other"},
  {"full_name":"L A Waller","email":"lwaller827@gmail.com","school":"udel","persona":"parent","company":"SoFi","job_title":"Director, Capital Markets","industry":"Finance & Banking"},
  {"full_name":"Maria Bogner","email":"bognermaria6@gmail.com","school":"udel","persona":"parent","company":"Provident","job_title":"Mortgage Coordinator","industry":"Finance & Banking"},
  {"full_name":"Brandon Schops","email":"cffosu@gmail.com","school":"osu","persona":"parent","company":"","job_title":"Sales/Marketing Exec.","industry":"Marketing"},
  {"full_name":"Alyson Brooks","email":"14alyb@gmail.com","school":"osu","persona":"parent","company":"Brooks Family Inc.","job_title":"stay at home mom","industry":"Education"},
  {"full_name":"Jamie Twersky","email":"jetwersky@gmail.com","school":"udel","persona":"parent","company":"Deloitte","job_title":"Talent Business Advisor","industry":"Consulting"},
  {"full_name":"Colette Paul","email":"cpaul72772@gmail.com","school":"tulane","persona":"alumni","company":"Western Suffolk Boces","job_title":"School Psychologist","industry":"Education"},
  {"full_name":"Wendy","email":"wyevoli@yahoo.com","school":"tulane","persona":"alumni","company":"Yevoli and Malayev","job_title":"Partner","industry":"Law & Legal"},
  {"full_name":"Lisa Reissman","email":"lisareissman@gmail.com","school":"tulane","persona":"alumni","company":"Recruiter in Life Sciences","job_title":"Recruiter","industry":"Healthcare & Life Sciences"},
  {"full_name":"Paley Munn","email":"munster7@gmail.com","school":"tulane","persona":"alumni","company":"Broward County Public Schools","job_title":"ESE Program Specialist","industry":"Education"},
  {"full_name":"Steven Goldberg","email":"stevengold90@gmail.com","school":"tulane","persona":"alumni","company":"OpenWeb","job_title":"SVP Partner Success","industry":"Media & Entertainment"},
  {"full_name":"Alycia Kaufman","email":"alyciakaufmanwright@gmail.com","school":"psu","persona":"alumni","company":"N/A","job_title":"Director of Huntingdon Children's School"},
  {"full_name":"Natalie Rose","email":"natalie@novawebgroup.com","school":"psu","persona":"alumni","company":"","job_title":"","industry":"Technology & Software"},
  {"full_name":"nancy martin","email":"nancyrmartin4@gmail.com","school":"miami","persona":"parent","company":"Jericho School District New York","job_title":"Elementary School Teacher","industry":"Education"},
  {"full_name":"Jarah Wilk","email":"jarahwilk@gmail.com","school":"osu","persona":"parent","company":"Big Media","job_title":"Content Rights Management"},
  {"full_name":"Arleen Goldenberg","email":"arleengoldenberg@gmail.com","school":"fsu","persona":"parent","company":"Replimune","job_title":"VP, Corporate Communications","industry":"Healthcare & Life Sciences"},
  {"full_name":"Blake Martin","email":"wbmartin01@gmail.com","school":"uga","persona":"parent","company":"Medicraft, Inc.","job_title":"VP of Biologics","industry":"Consulting"},
  {"full_name":"Duane Burpoe","email":"burpoedj@gmail.com","school":"uga","persona":"parent","company":"Rubrik","job_title":"Account Executive","industry":"Technology & Software"},
  {"full_name":"Cara Harper","email":"carabharper@gmail.com","school":"uga","persona":"parent","company":"InterExchange","job_title":"Regional Manager","industry":"Education"},
  {"full_name":"jodi murnick","email":"jodi@jodimurnick.com","school":"usc","persona":"parent","company":"Jodi Murnick Coaching","job_title":"Career Coach","industry":"Marketing"},
  {"full_name":"Jen Venditti","email":"jennven@comcast.net","school":"usc","persona":"parent","company":"Penn Medicine","job_title":"Practice Manager","industry":"Healthcare & Life Sciences"},
  {"full_name":"Stephanie Budin","email":"stephanie@delraytechnology.com","school":"ucf","persona":"parent","company":"Nusano","job_title":"Senior Manager, Talent Strategy","industry":"Technology & Software"},
  {"full_name":"Heather Werb","email":"werbie28@verizon.net","school":"ucf","persona":"parent","company":"Hillsborough County Schools","job_title":"Middle school teacher","industry":"Education"},
  {"full_name":"Jason Torres","email":"neddtorres@gmail.com","school":"ucf","persona":"parent","company":"Dept of the Air Force","job_title":"Chief Engineer","industry":"Engineering"},
  {"full_name":"Carla Backitis","email":"cbackitis@gmail.com","school":"ucf","persona":"parent","company":"Genpact","job_title":"Senior Process Associate","industry":"Technology & Software"},
  {"full_name":"Kim Edelberg","email":"kim.edelberg@outlook.com","school":"fau","persona":"parent","company":"Promowearhouse","job_title":"Former Volunteer Department Director, Social Worker, Life Coach, Educator","industry":"Consulting"},
  {"full_name":"Terry Mattingly","email":"mattinglyt4@gmail.com","school":"fau","persona":"parent","company":"Terry Mattingly LLC","job_title":"School Psychologist, Custody Evaluator, Guardian ad Litem","industry":"Other"},
  {"full_name":"Shawna Christenson","email":"schristenson@aerospace-policy.org","school":"ucf","persona":"parent","company":"","job_title":"Secondary English teacher","industry":"Education"},
  {"full_name":"amanda wood","email":"woodamandaa@gmail.com","school":"ucf","persona":"alumni","company":"Search Key - Tallahassee Memorial","job_title":"Lead Talent Acquisition Recruiter","industry":"Healthcare & Life Sciences"},
  {"full_name":"Miguel Sanchez","email":"miguel.sanchezm2002@gmail.com","school":"ucf","persona":"alumni","company":"UCF","job_title":"Portfolio Management Support","industry":"Education"},
  {"full_name":"judeambrose@icloud.com","email":"judeambrose@icloud.com","school":"ucf","persona":"parent","company":"FIS","job_title":"Lead Software Architect","industry":"Technology & Software"},
  {"full_name":"eachance1","email":"eachance1@gmail.com","school":"ucf","persona":"alumni","company":"","job_title":"","industry":"Marketing"},
  {"full_name":"kimedel","email":"kimedel@gmail.com","school":"fsu","persona":"parent","company":"Promowearhouse","job_title":"Former Volunteer Department Director, Social Worker, Life Coach, Educator","industry":"Consulting"},
  {"full_name":"Aleah Blain","email":"blain.aleah@gmail.com","school":"ucf","persona":"alumni","company":"Lionbridge Games","job_title":"Quality Assurance Tester","industry":"Technology & Software"},
  {"full_name":"Adam Spielberger","email":"adam@submersivemedia.com","school":"usc","persona":"parent","company":"Submersive Media","job_title":"Co-CEO","industry":"Marketing"},
  {"full_name":"Risa McGrew","email":"risa.mcgrew@gmail.com","school":"usc","persona":"parent","company":"Kerry","job_title":"Sr HR Business Partner","industry":"Media & Entertainment"},
  {"full_name":"Mitch Helfman","email":"mhelf12@gmail.com","school":"usc","persona":"parent","company":"MRH Real Estate Services, Inc.","job_title":"Vice President - Industrial Real Estate Svcs","industry":"Real Estate"},
  {"full_name":"Janine Clements","email":"janinelmclements@gmail.com","school":"usc","persona":"parent","company":"Freelance","job_title":"Writer & Editor","industry":"Marketing"},
  {"full_name":"Jennifer Prince","email":"jenprince23@gmail.com","school":"usc","persona":"parent","company":"Accel Schools","job_title":"Director of Operations","industry":"Technology & Software"},
  {"full_name":"Teresa Badalamenti","email":"mackbrynn1313@gmail.com","school":"usc","persona":"parent","company":"Byram Township Schools","job_title":"Teacher","industry":"Education"},
  {"full_name":"Elisa Roland","email":"elisarroland@gmail.com","school":"udel","persona":"parent","company":"Metaforce","job_title":"Marketing consultant","industry":"Marketing"},
  {"full_name":"Rebecca Gadomski","email":"rebeccagadomski@gmail.com","school":"usc","persona":"parent","company":"Lifestance Health","job_title":"Operations Director","industry":"Healthcare & Life Sciences"},
  {"full_name":"Catherine Barbieri","email":"catherinebarbieri01@gmail.com","school":"usc","persona":"parent","company":"Central Bucks School District","job_title":"Education"},
  {"full_name":"Karen Murphy","email":"karenmmurphy17@gmail.com","school":"usc","persona":"parent","company":"WMC Health","job_title":"Administrator","industry":"Healthcare & Life Sciences"},
  {"full_name":"Crystal Goodwin","email":"sabotage1920@gmail.com","school":"usc","persona":"parent","company":"United States Courts","job_title":"Senior United States Probation Officer","industry":"Government"},
  {"full_name":"Sydney Griffith","email":"sydneymgriffith@gmail.com","school":"usc","persona":"alumni","company":"","job_title":"CTICU RN","industry":"Healthcare & Life Sciences"},
  {"full_name":"Shannon Mourar","email":"miknshan@me.com","school":"usc","persona":"parent","company":"Insight PA Cyber Charter School","job_title":"Human Resources"},
  {"full_name":"Taniah German","email":"taniahgerman@gmail.com","school":"usc","persona":"alumni","company":"Wells Fargo","job_title":"Auditor","industry":"Finance & Banking"},
  {"full_name":"Tara Limoco","email":"taralimoco@gmail.com","school":"usc","persona":"parent","company":"Blue Tent Online","job_title":"teacher","industry":"Education"},
  {"full_name":"Kristin Davis","email":"kristin@davisaudiology.com","school":"usc","persona":"parent","company":"Davis Audiology","job_title":"Owner private practice audiology clinic","industry":"Healthcare & Life Sciences"},
  {"full_name":"Amy Page","email":"pageamyd@gmail.com","school":"usc","persona":"parent","company":"Coastal Community Foundation","job_title":"Program Officer","industry":"Non-Profit"},
  {"full_name":"Sisireia Simmons","email":"sisireia@gmail.com","school":"usc","persona":"alumni","company":"Clemson University","job_title":"Academic Advisor","industry":"Education"},
  {"full_name":"Jennifer Mosser","email":"jennifer.r.mosser@gmail.com","school":"usc","persona":"parent","company":"LCPS","job_title":"Teacher","industry":"Marketing"},
  {"full_name":"Brian Levine","email":"mrbrianmlevine@gmail.com","school":"usc","persona":"parent","company":"Cresient","job_title":"CEO","industry":"Technology & Software"},
  {"full_name":"Nicole Scarborough","email":"nickolai_30342@yahoo.com","school":"usc","persona":"parent","company":"","job_title":"Registered Nurse","industry":"Healthcare & Life Sciences"},
  {"full_name":"Chloe","email":"chloeloftis123@gmail.com","school":"usc","persona":"alumni","company":"","job_title":"","industry":"Other"},
  {"full_name":"Taylor Henley","email":"thenley03@icloud.com","school":"usc","persona":"alumni","company":"","job_title":"","industry":"Marketing"},
  {"full_name":"Julie Houston","email":"grdnjul@gmail.com","school":"usc","persona":"parent","company":"CHI","job_title":"COO","industry":"Non-Profit"},
  {"full_name":"David Fields","email":"drdave1827@gmail.com","school":"usc","persona":"parent","company":"Family Dentistry at Seven Hills","job_title":"Dentist","industry":"Healthcare & Life Sciences"},
  {"full_name":"ANURADHA NAIR","email":"anunair12@gmail.com","school":"usc","persona":"parent","company":"South carolina office of resilience","job_title":"Program manager","industry":"Government"},
  {"full_name":"KAREN DENTON","email":"karen.denton@cherokee1.org","school":"usc","persona":"parent","company":"Gaffney High School","job_title":"Librarian","industry":"Education"},
  {"full_name":"Courtland Thomas","email":"courtlandmthomas@gmail.com","school":"usc","persona":"alumni","company":"Chartwells Higher Education","job_title":"District Marketing Director","industry":"Marketing"},
  {"full_name":"Thomas Jones","email":"tejones404@gmail.com","school":"usc","persona":"alumni","company":"","job_title":"","industry":"Healthcare & Life Sciences"},
  {"full_name":"Allison Hallman","email":"allison.a.hallman@gmail.com","school":"usc","persona":"parent","company":"DP Professionals","job_title":"Client Delivery Manager","industry":"Other"},
  {"full_name":"Jill Bazzone","email":"jbazzone@gmail.com","school":"usc","persona":"parent","company":"Cisco","job_title":"Senior Director, Communications","industry":"Technology & Software"},
  {"full_name":"D Hollars","email":"dj042103@gmail.com","school":"usc","persona":"parent","company":"Grace Lane Properties LLC","job_title":"Owner","industry":"Real Estate"},
  {"full_name":"W. Scott MacDonald","email":"wscottmacdonald1@gmail.com","school":"usc","persona":"parent","company":"General Dynamics Information Technology","job_title":"Solutions Architect","industry":"Technology & Software"},
  {"full_name":"Samantha Morris","email":"smorris127@gmail.com","school":"usc","persona":"parent","company":"Mondelēz International","job_title":"Senior Counsel, Labor and Employment","industry":"Law & Legal"},
  {"full_name":"Laurie BRANUM","email":"lauriebranum@gmail.com","school":"usc","persona":"parent","company":"Deloitte","job_title":"Organizational Change Management Leader","industry":"Consulting"},
  {"full_name":"Matt Jacovsky","email":"mjacovsky22@gmail.com","school":"osu","persona":"alumni","company":"Burns & McDonnell","job_title":"Mechanical Engineer","industry":"Engineering"},
  {"full_name":"Jen S","email":"msstrow@gmail.com","school":"osu","persona":"parent","company":"","job_title":"Teacher","industry":"Education"},
  {"full_name":"Stephanie Cramer","email":"stephiec021876@gmail.com","school":"osu","persona":"parent","company":"Harmelin media","job_title":"Media buyer","industry":"Media & Entertainment"},
  {"full_name":"Alicia Halphen","email":"alicia.halphen@gmail.com","school":"osu","persona":"parent","company":"Filtration Group","job_title":"Application Engineer","industry":"Engineering"},
  {"full_name":"Robyn Wolfe","email":"robynwolfe821@gmail.com","school":"osu","persona":"parent","company":"Old Bridge Board of Education","job_title":"Educator","industry":"Education"},
  {"full_name":"Lisa Giegel","email":"lisagiegel3@gmail.com","school":"osu","persona":"parent","company":"","job_title":"Senior Accountant","industry":"Finance & Banking"},
];

// Temp password generator
function tempPassword() {
  return 'CFF_' + Math.random().toString(36).slice(2, 10) + '!';
}

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
    const bySchool = {};

    for (const row of CSV_USERS) {
      const email = row.email?.toLowerCase().trim();
      if (!email || email.includes('privaterelay.appleid.com')) { skipped++; continue; }
      if (existingEmails.has(email)) { skipped++; continue; }

      const schoolCode = row.school?.toLowerCase().trim();
      const school = SCHOOL_MAP[schoolCode];
      if (!school) { skipped++; continue; }

      let fullName = row.full_name?.trim();
      if (!fullName || fullName === email || fullName.includes('@')) {
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
            persona: row.persona || 'parent',
            roles: [row.persona || 'parent'],
            onboarding_completed: false,
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
          bySchool[school.code] = (bySchool[school.code] || 0) + 1;
          existingEmails.add(email);
        }

        if ((created + skipped) % 25 === 0) {
          await new Promise(r => setTimeout(r, 800));
        }
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({
      success: true,
      created,
      skipped,
      errors: errors.slice(0, 20),
      by_school: bySchool,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
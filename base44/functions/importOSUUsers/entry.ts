import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const OSU_USERS = [
  {"full_name":"debsimp","email":"debsimp@optonline.net","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Bryan Goldman","email":"goldy3b24@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Alyssa Rukin","email":"alyssarukin1@gmail.com","persona":"parent","onboarding_completed":true,"company":"University Hospitals","job_title":"Social Worker","industry":"Healthcare & Life Sciences","linkedin_url":"https://www.linkedin.com/in/alyssarukin","bio":"Pediatric social worker, UH Rainbow Babies & Children's Hospital"},
  {"full_name":"sweisleder","email":"sweisleder@yahoo.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"theirvings","email":"theirvings@optonline.net","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Aimee Muth","email":"aimeemuth@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Scott Eisenberg","email":"swapthebiz@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Sabina Fishkin","email":"sabinanyc7@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Brenda Miklasz","email":"bmmiklasz@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Iris H","email":"ilenehanin@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Matthew Garth","email":"matthewgarth@hotmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Scott Kaplan","email":"scottdkaplan@gmail.com","persona":"parent","onboarding_completed":true,"company":"Great Plains Data","job_title":"CFO","industry":"Finance & Banking","linkedin_url":"https://www.linkedin.com/in/scottkaplan77/","bio":"Strategic financial executive with 30+ years of experience."},
  {"full_name":"Scott Eisenberg","email":"scott@swapthebiz.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"sfaktor","email":"sfaktor@aol.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"breezylear","email":"breezylear@hotmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Teresa Stanco","email":"tstanco@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Shari Hodgson","email":"hodgsons@bbhcsd.org","persona":"parent","onboarding_completed":true,"company":"Brecksville Broadview Heights City Schools","job_title":"Speech Pathologist","industry":"Healthcare & Life Sciences","linkedin_url":"","bio":"I have been a school based speech pathologist for 26 years."},
  {"full_name":"Barbara Ottman","email":"baottman@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Amy Dryfuse","email":"amydryfuse@gmail.com","persona":"parent","onboarding_completed":true,"company":"Mercy Health","job_title":"Nuclear Medicine Technologist","industry":"Healthcare & Life Sciences","linkedin_url":"","bio":""},
  {"full_name":"Janelle Dymond","email":"janelle.dymond@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Renee Kalmbach","email":"rembach8@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Kristin Yost","email":"kyost2775@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Christina Kerekes","email":"echakere@hotmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Allison Grossman","email":"allisonkgrossman4@icloud.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Goldeez Girl","email":"goldeezgirl@me.com","persona":"parent","onboarding_completed":true,"company":"Family Bronze Corporation","job_title":"Owner, President","industry":"Other","linkedin_url":"","bio":""},
  {"full_name":"Lynn Sunset","email":"lynnsunset73@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Dena Astrin","email":"beautycounterbydena@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Kristen Snow","email":"kristenjsnow@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Maeve Mooney","email":"maevemooney21@gmail.com","persona":"alumni","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"A Glickman","email":"aglickman@corpspecla.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Natalie Henrich","email":"henrich.nat@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Rachael Silverman","email":"rachsilverman@aol.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Judy Good","email":"jdthgd@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Lisa Giegel","email":"lisagiegel3@gmail.com","persona":"parent","onboarding_completed":true,"company":"","job_title":"Senior Accountant","industry":"Finance & Banking","linkedin_url":"","bio":""},
  {"full_name":"Allison Malmad","email":"alimalmad@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Matt Jacovsky","email":"mjacovsky22@gmail.com","persona":"alumni","onboarding_completed":true,"company":"Burns & McDonnell","job_title":"Mechanical Engineer","industry":"Engineering","linkedin_url":"https://linkedin.com/in/matthew-jacovsky","bio":""},
  {"full_name":"Robyn Rosen","email":"robynrosen70@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Jen S","email":"msstrow@gmail.com","persona":"parent","onboarding_completed":true,"company":"","job_title":"Teacher","industry":"Education","linkedin_url":"","bio":""},
  {"full_name":"K Sorgen","email":"ksorgen@aol.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Michelle Chozahinoff","email":"mich.choz@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Caroline Burgess","email":"caroline.burgess.cabrone@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Stacey Garb","email":"staceyjgarb@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Erin Sroka","email":"esroka@bwschools.net","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Dina Shulman","email":"dina.shulman225@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Patricia Feehan","email":"pfeehan316@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Prachi Nagpal","email":"pmaini@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Sonia Sanjeev","email":"soniasanjeev@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Robyn Wolfe","email":"robynwolfe821@gmail.com","persona":"parent","onboarding_completed":true,"company":"Old Bridge Board of Education","job_title":"Educator","industry":"Education","linkedin_url":"","bio":""},
  {"full_name":"Brandon Schops","email":"cffosu@gmail.com","persona":"parent","onboarding_completed":true,"company":"","job_title":"Sales/Marketing Exec.","industry":"Marketing","linkedin_url":"","bio":"I am a seasoned professional within the food service industry."},
  {"full_name":"Alyson Brooks","email":"14alyb@gmail.com","persona":"parent","onboarding_completed":true,"company":"Brooks Family Inc.","job_title":"stay at home mom","industry":"Education","linkedin_url":"","bio":"I am a former teacher looking to help students at OSU find meaningful connections."},
  {"full_name":"Alicia Halphen","email":"alicia.halphen@gmail.com","persona":"parent","onboarding_completed":true,"company":"Filtration Group","job_title":"Application Engineer","industry":"Engineering","linkedin_url":"","bio":"20+ years experience with designing filtration equipment for oil and gas industry."},
  {"full_name":"Debbie Kravitz","email":"debbie@nykravitz.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Brittyw","email":"brittyw@me.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Jennifer Rubin","email":"jlinnrubin@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Audr Peskin","email":"apeskin1217@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Sharon Stummer","email":"sharon.stummer@northport.k12.ny.us","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
  {"full_name":"Stephanie Cramer","email":"stephiec021876@gmail.com","persona":"parent","onboarding_completed":true,"company":"Harmelin media","job_title":"Media buyer","industry":"Media & Entertainment","linkedin_url":"","bio":""},
  {"full_name":"lightmanpa","email":"lightmanpa@yahoo.com","persona":"parent","onboarding_completed":true,"company":"MayoSeitz Media","job_title":"SVP, Director Media Investment","industry":"Marketing","linkedin_url":"","bio":""},
  {"full_name":"Lori Dubin","email":"loridubin2@gmail.com","persona":"parent","onboarding_completed":false,"company":"","job_title":"","industry":"","linkedin_url":"","bio":""},
];

// Generate a random temp password
function tempPassword() {
  return 'CFF_' + Math.random().toString(36).slice(2, 10) + '_osu!';
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

    for (const row of OSU_USERS) {
      const email = row.email?.toLowerCase().trim();
      // Skip Apple private relay and already existing users
      if (!email || email.includes('privaterelay.appleid.com')) { skipped++; continue; }
      if (existingEmails.has(email)) { skipped++; continue; }

      let fullName = row.full_name?.trim();
      if (!fullName || fullName === email || fullName.includes('@')) {
        const prefix = email.split('@')[0];
        fullName = prefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
      }

      try {
        // Register with temp password — does NOT send email
        const registered = await base44.auth.register({
          email,
          password: tempPassword(),
          full_name: fullName,
        });

        if (registered?.id) {
          // Update profile data
          await base44.asServiceRole.entities.User.update(registered.id, {
            full_name: fullName,
            persona: row.persona,
            roles: [row.persona],
            onboarding_completed: row.onboarding_completed === true,
            school_code: 'osu',
            school_name: 'Ohio State University',
            school: 'Ohio State University',
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
          console.log(`Created: ${email} -> id: ${registered.id}`);
          created++;
          existingEmails.add(email);
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    return Response.json({ success: true, created, skipped, errors: errors.slice(0, 20) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
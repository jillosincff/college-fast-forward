import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHOOL_NAMES = {
  usc: 'University of South Carolina',
  osu: 'Ohio State',
  ucf: 'University of Central Florida',
  umich: 'University of Michigan',
  udel: 'University of Delaware',
  uga: 'University of Georgia',
  psu: 'Pennsylvania State',
  tulane: 'Tulane',
  umd: 'University of Maryland',
  fau: 'Florida Atlantic',
  fsu: 'Florida State',
  jmu: 'James Madison',
  miami: 'University of Miami',
  utexas: 'University of Texas',
  uky: 'University of Kentucky',
};

// All 352 parents from CSV — Apple relay emails excluded at send time
// Rows with empty school or clearly non-parent accounts (students signed up as parents) also filtered
const PARENT_CSV = [
  { email: 'shell147@zoominternet.net', full_name: 'shell147', school: 'udel' },
  { email: 'lisaromanlucci@gmail.com', full_name: 'Lisa Lucci', school: 'udel' },
  { email: 'franbloom13@gmail.com', full_name: 'Francine Bloom', school: 'umd' },
  { email: 'ljgarten@gmail.com', full_name: 'Lisa Garten', school: 'umich' },
  { email: 'amykates@optonline.net', full_name: 'amykates', school: 'umich' },
  { email: 'carlymaass@gmail.com', full_name: 'carly maass', school: 'psu' },
  { email: 'larchbol@yahoo.com', full_name: 'larchbol', school: 'umich' },
  { email: 'kapplauren@gmail.com', full_name: 'Lauren Kapp', school: 'psu' },
  { email: 'heidihdross@gmail.com', full_name: 'Dross Heidi', school: 'umd' },
  { email: 'tovi.taylor@gmail.com', full_name: 'Tovi Taylor', school: 'udel' },
  { email: 'mweyl25@gmail.com', full_name: 'mweyl25', school: 'udel' },
  { email: 'ndtabs@verizon.net', full_name: 'nancy tabs', school: 'umich' },
  { email: 'barrifruitbine@gmail.com', full_name: 'barrifruitbine', school: 'utexas' },
  { email: 'tfhertwig@msn.com', full_name: 'tfhertwig', school: 'psu' },
  { email: 'hopespiller@gmail.com', full_name: 'hopespiller', school: 'umich' },
  { email: 'selenamarievk@gmail.com', full_name: 'Selena Van Klompenberg', school: 'umich' },
  { email: 'jilevine@optonline.net', full_name: 'jilevine', school: 'umich' },
  { email: 'mayolfamily@bellsouth.net', full_name: 'mayolfamily', school: 'umich' },
  { email: 'nuglou@gmail.com', full_name: 'K L', school: 'umich' },
  { email: 'lsimkuspaskola@gmail.com', full_name: 'Lukas', school: 'umich' },
  { email: 'hillary523@icloud.com', full_name: 'hillary523', school: 'umich' },
  { email: 'alyssa@allaboutadmissions.com', full_name: 'Alyssa Endelman', school: 'umich' },
  { email: 'stalburg@gmail.com', full_name: 'Barbi Stalburg Kasoff', school: 'umich' },
  { email: 'ericayaker@binghamcounseling.com', full_name: 'there', school: 'umich' },
  { email: 'tarynschaffer@gmail.com', full_name: 'Taryn Schaffer', school: 'umich' },
  { email: 'lorijrosen@gmail.com', full_name: 'lorijrosen', school: 'umich' },
  { email: 'goldy3b24@gmail.com', full_name: 'Bryan Goldman', school: 'osu' },
  { email: 'dibeerman@hotmail.com', full_name: 'dibeerman', school: 'umich' },
  { email: 'jdheimowitz@bellsouth.net', full_name: 'jdheimowitz', school: 'umich' },
  { email: 'sallygainesmoorhead@gmail.com', full_name: 'sallygainesmoorhead', school: 'umich' },
  { email: 'ppardes1026@gmail.com', full_name: 'Pamela Pardes', school: 'umich' },
  { email: 'carynfitzgerald8@gmail.com', full_name: 'Caryn Fitzgerald', school: 'umich' },
  { email: 'rachelstahler@gmail.com', full_name: 'rachelstahler', school: 'umich' },
  { email: 'sivin@optonline.net', full_name: 'sivin', school: 'umich' },
  { email: 'simpkins02@yahoo.com', full_name: 'simpkins02', school: 'usc' },
  { email: 'dahliatop@gmail.com', full_name: 'Dahlia Topolosky', school: 'umd' },
  { email: 'kimedel@gmail.com', full_name: 'kimedel', school: 'fsu' },
  { email: 'michellerbrady@hotmail.com', full_name: 'michellerbrady', school: 'ucf' },
  { email: 'schristenson@aerospace-policy.org', full_name: 'Shawna Christenson', school: 'ucf' },
  { email: 'mcampbell1@bellsouth.net', full_name: 'Monica', school: 'ucf' },
  { email: 'judeambrose@icloud.com', full_name: 'there', school: 'ucf' },
  { email: 'anne.gamble@comcast.net', full_name: 'anne.gamble', school: 'usc' },
  { email: 'leer3714@gmail.com', full_name: 'Adrienne Bransky', school: 'umd' },
  { email: '2twins@swbell.net', full_name: '2twins', school: 'tulane' },
  { email: 'mgwerger@gmail.com', full_name: 'mgwerger', school: 'psu' },
  { email: 'robinfiddleposnack@gmail.com', full_name: 'Robin Fiddle Posnack', school: 'tulane' },
  { email: 'mpeskoff@yahoo.com', full_name: 'mpeskoff', school: 'fau' },
  { email: 'staceyrkaye@gmail.com', full_name: 'Stacey Kaye', school: 'uga' },
  { email: 'alyssarukin1@gmail.com', full_name: 'alyssarukin1', school: 'osu' },
  { email: 'margostrahlberg@gmail.com', full_name: 'Margo Strahlberg', school: 'umd' },
  { email: 'fierceandsavvy@gmail.com', full_name: 'Jill Sharon', school: 'udel' },
  { email: 'jar8@cornell.edu', full_name: 'jar8', school: 'umd' },
  { email: 'blumecollegeconsulting@gmail.com', full_name: 'Debbie Blume', school: 'uga' },
  { email: 'aryn.lechtman@gmail.com', full_name: 'Aryn Lechtman', school: 'uga' },
  { email: 'lvkates@gmail.com', full_name: 'lvkates', school: 'fsu' },
  { email: 'jodibenson27@gmail.com', full_name: 'jodi benson', school: 'jmu' },
  { email: 'gailswitsky@yahoo.com', full_name: 'gailswitsky', school: 'tulane' },
  { email: 'padhi.usharani@gmail.com', full_name: 'Usha Padhi', school: 'psu' },
  { email: 'sweisleder@yahoo.com', full_name: 'sweisleder', school: 'osu' },
  { email: 'dinag374@icloud.com', full_name: 'Dina G', school: 'fau' },
  { email: 'theirvings@optonline.net', full_name: 'theirvings', school: 'osu' },
  { email: 'dena.duncan@verizon.net', full_name: 'Dena Duncan', school: 'udel' },
  { email: 'lfishman421@gmail.com', full_name: 'lfishman421', school: 'uky' },
  { email: 'kristen.arpaia@verizon.net', full_name: 'kristen.arpaia', school: 'udel' },
  { email: 'lfish421@yahoo.com', full_name: 'lfish421', school: 'jmu' },
  { email: 'suzannebakaletz@yahoo.com', full_name: 'suzannebakaletz', school: 'psu' },
  { email: 'aimeemuth@gmail.com', full_name: 'aimee muth', school: 'osu' },
  { email: 'swapthebiz@gmail.com', full_name: 'Scott Eisenberg', school: 'osu' },
  { email: 'sabinanyc7@gmail.com', full_name: 'Sabina Fishkin', school: 'osu' },
  { email: 'bmmiklasz@gmail.com', full_name: 'Brenda Miklasz', school: 'osu' },
  { email: 'ilenehanin@gmail.com', full_name: 'iris h', school: 'umd' },
  { email: 'lounsberryn@slsd.org', full_name: 'Nicole Lounsberry', school: 'psu' },
  { email: 'lynnabean@gmail.com', full_name: 'lynnabean@gmail.com', school: 'psu' },
  { email: 'matthewgarth@hotmail.com', full_name: 'matthewgarth', school: 'osu' },
  { email: 'scottdkaplan@gmail.com', full_name: 'scottdkaplan', school: 'osu' },
  { email: 'scott@swapthebiz.com', full_name: 'Scott Eisenberg', school: 'osu' },
  { email: 'sfaktor@aol.com', full_name: 'sfaktor', school: 'osu' },
  { email: 'breezylear@hotmail.com', full_name: 'breezylear', school: 'osu' },
  { email: 'tstanco@gmail.com', full_name: 'Teresa Stanco', school: 'osu' },
  { email: 'hodgsons@bbhcsd.org', full_name: 'Shari Hodgson', school: 'osu' },
  { email: 'shamila.imani@gmail.com', full_name: 'Shamila Imani', school: 'psu' },
  { email: 'jillhines40@gmail.com', full_name: 'Jill Hines', school: 'ucf' },
  { email: 'jenkemp67@gmail.com', full_name: 'Jenny Kemp', school: 'uga' },
  { email: 'mirasowens@gmail.com', full_name: 'Mira Owens', school: 'uga' },
  { email: 'baottman@gmail.com', full_name: 'Barbara Ottman', school: 'osu' },
  { email: 'amydavies1023@gmail.com', full_name: 'Amy Davies', school: 'uga' },
  { email: 'theobeth@gmail.com', full_name: 'Elizabeth McCrea Theodore', school: 'usc' },
  { email: 'amydryfuse@gmail.com', full_name: 'Amy Dryfuse', school: 'osu' },
  { email: 'janelle.dymond@gmail.com', full_name: 'there', school: 'osu' },
  { email: 'rembach8@gmail.com', full_name: 'Renee Kalmbach', school: 'osu' },
  { email: 'bernstein.stacy@gmail.com', full_name: 'Stacy Bernstein', school: 'uga' },
  { email: 'kyost2775@gmail.com', full_name: 'Kristin Yost', school: 'osu' },
  { email: 'robyn.walcoff@gmail.com', full_name: 'Robyn Walcoff', school: 'psu' },
  { email: 'echakere@hotmail.com', full_name: 'Christina Kerekes', school: 'osu' },
  { email: 'allisonkgrossman4@icloud.com', full_name: 'there', school: 'osu' },
  { email: 'goldeezgirl@me.com', full_name: 'there', school: 'osu' },
  { email: 'nikkimccabe79@gmail.com', full_name: 'Nicole McCabe', school: 'uga' },
  { email: 'lynnsunset73@gmail.com', full_name: 'lynn sunset', school: 'osu' },
  { email: 'beautycounterbydena@gmail.com', full_name: 'Dena Astrin', school: 'osu' },
  { email: 'okcardoso@gmail.com', full_name: 'Kristin Cardoso', school: 'ucf' },
  { email: 'kristenjsnow@gmail.com', full_name: 'Kristen Snow', school: 'osu' },
  { email: 'aglickman@corpspecla.com', full_name: 'there', school: 'osu' },
  { email: 'henrich.nat@gmail.com', full_name: 'Natalie Henrich', school: 'osu' },
  { email: 'rachsilverman@aol.com', full_name: 'Rachael Silverman', school: 'osu' },
  { email: 'jdthgd@gmail.com', full_name: 'Judy Good', school: 'osu' },
  { email: 'lisagiegel3@gmail.com', full_name: 'Lisa Giegel', school: 'osu' },
  { email: 'flyboats@gmail.com', full_name: 'Tyler & Lynn Blake', school: 'ucf' },
  { email: 'alimalmad@gmail.com', full_name: 'Allison Bohm Malmad', school: 'osu' },
  { email: 'erika.miller08@gmail.com', full_name: 'Erika Miller', school: 'ucf' },
  { email: 'cinchg1@gmail.com', full_name: 'Cindy Chong', school: 'ucf' },
  { email: 'andrea.eckert@gmail.com', full_name: 'Andrea Eckert', school: 'usc' },
  { email: 'kallianesis4@gmail.com', full_name: 'premonc', school: 'usc' },
  { email: 'skoolmasterz@gmail.com', full_name: 'there', school: 'ucf' },
  { email: 'jenwalton1@gmail.com', full_name: 'Jen W', school: 'ucf' },
  { email: 'niccor23@hotmail.com', full_name: 'N Junek', school: 'ucf' },
  { email: 'lisakaestle1@gmail.com', full_name: 'Lisa Kaestle', school: 'udel' },
  { email: 'jennpitera1@gmail.com', full_name: 'Jenn Pitera', school: 'uga' },
  { email: 'ittap1@hotmail.com', full_name: 'patti daniel', school: 'uga' },
  { email: 'neddtorres@gmail.com', full_name: 'Jason Torres', school: 'ucf' },
  { email: 'dewgrassmusic@gmail.com', full_name: 'Kerry Dew', school: 'ucf' },
  { email: 'caroline.burgess.cabrone@gmail.com', full_name: 'Caroline Burgess', school: 'osu' },
  { email: 'werbie28@verizon.net', full_name: 'Heather Werb', school: 'ucf' },
  { email: 'juligarrett@gmail.com', full_name: 'Julie Garrett', school: 'uga' },
  { email: 'aligwyn@gmail.com', full_name: 'Alice and Gwyn', school: 'ucf' },
  { email: 'jodibossak@yahoo.com', full_name: 'there', school: 'uga' },
  { email: 'tiffanygleason@me.com', full_name: 'tiffanygleason', school: 'fau' },
  { email: 'cbackitis@gmail.com', full_name: 'Carla Backitis', school: 'ucf' },
  { email: 'carin0112@icloud.com', full_name: 'there', school: 'ucf' },
  { email: 'aespanatait@gmail.com', full_name: 'Amanda Espana-Tait', school: 'ucf' },
  { email: 'bridgetmduda@gmail.com', full_name: 'Bridget Duda', school: 'udel' },
  { email: 'kim.edelberg@outlook.com', full_name: 'Kim Edelberg', school: 'fau' },
  { email: 'njoice@trschools.com', full_name: 'Nicole Joice', school: 'fau' },
  { email: 'mattinglyt4@gmail.com', full_name: 'Terry Mattingly', school: 'fau' },
  { email: 'elissa.gruenberg@gmail.com', full_name: 'Elissa Gruenberg', school: 'udel' },
  { email: 'heatherbarca@gmail.com', full_name: 'Heather Barca', school: 'udel' },
  { email: 'staceyjgarb@gmail.com', full_name: 'Stacey garb', school: 'osu' },
  { email: 'wenaid815@gmail.com', full_name: 'Diane Kemper', school: 'ucf' },
  { email: 'cynthabaldino@gmail.com', full_name: 'Cynthia Baldino', school: 'udel' },
  { email: 'grillokidscollege@gmail.com', full_name: 'Esther Grillo', school: 'ucf' },
  { email: 'maggieordona74@gmail.com', full_name: 'Maggie Ordona', school: 'ucf' },
  { email: 'eweiwaters@gmail.com', full_name: 'Waters', school: 'ucf' },
  { email: 'sherrytramazzo@gmail.com', full_name: 'Sherry Tramazzo', school: 'ucf' },
  { email: 'lightmanpa@yahoo.com', full_name: 'there', school: 'osu' },
  { email: 'goldenfamily416@gmail.com', full_name: 'christy golden', school: 'ucf' },
  { email: 'sharon.stummer@northport.k12.ny.us', full_name: 'Sharon Stummer', school: 'osu' },
  { email: 'kimberleewewing@gmail.com', full_name: 'Kimberlee Ewing', school: 'ucf' },
  { email: 'kampjmz@gmail.com', full_name: 'JMZ Kamphuis', school: 'ucf' },
  { email: 'gonzallaghers@verizon.net', full_name: 'Lyngo Nzalez', school: 'ucf' },
  { email: 'sara.deborah.collins@gmail.com', full_name: 'Sara Collins', school: 'udel' },
  { email: 'lwaller827@gmail.com', full_name: 'L A Waller', school: 'udel' },
  { email: 'debbie@nykravitz.com', full_name: 'Debbie Kravitz', school: 'osu' },
  { email: 'greene8600@gmail.com', full_name: 'there', school: 'usc' },
  { email: 'brittyw@me.com', full_name: 'there', school: 'osu' },
  { email: 'jlinnrubin@gmail.com', full_name: 'Jennifer Rubin', school: 'osu' },
  { email: 'apeskin1217@gmail.com', full_name: 'Audr Peskin', school: 'osu' },
  { email: 'robynrosen70@gmail.com', full_name: 'Robyn Rosen', school: 'osu' },
  { email: 'msstrow@gmail.com', full_name: 'Jen S', school: 'osu' },
  { email: 'ksorgen@aol.com', full_name: 'there', school: 'osu' },
  { email: 'heidimellison@gmail.com', full_name: 'Heidi Mellison', school: 'usc' },
  { email: 'elisetedeschi@gmail.com', full_name: 'Elise Tedeschi', school: 'uga' },
  { email: 'mich.choz@gmail.com', full_name: 'Michelle Chozahinoff', school: 'osu' },
  { email: 'amysminchin@gmail.com', full_name: 'Amy Minchin', school: 'usc' },
  { email: 'mstetz76@gmail.com', full_name: 'Melanie Stetz', school: 'usc' },
  { email: 'knoxlatonya7@gmail.com', full_name: 'LaTonya Charise', school: 'usc' },
  { email: '1runnergirl327@gmail.com', full_name: 'Katherine Hoenig', school: 'usc' },
  { email: 'wbmartin01@gmail.com', full_name: 'Blake Martin', school: 'uga' },
  { email: 'lizasklar@hotmail.com', full_name: 'LIZASKLAR', school: 'usc' },
  { email: 'rmjann@gmail.com', full_name: 'Renée Jannuzzi', school: 'usc' },
  { email: 'rdobb@dobb.me', full_name: 'Ryan Dobb', school: 'usc' },
  { email: 'gosinoff@gmail.com', full_name: 'Greg Osinoff', school: 'usc' },
  { email: 'marcymccabept@gmail.com', full_name: 'Marcy McCabe', school: 'usc' },
  { email: 'kelli.dellinger@gmail.com', full_name: 'Kelli Dellinger', school: 'usc' },
  { email: 'shaun754@gmail.com', full_name: 'Shaun Washington', school: 'usc' },
  { email: 'kelly_email@yahoo.com', full_name: 'kelly_email', school: 'usc' },
  { email: 'mhawkins2830@gmail.com', full_name: 'Michelle Hawkins', school: 'usc' },
  { email: 'scoyne443@gmail.com', full_name: 'Scott Coyne', school: 'usc' },
  { email: 'macfarm100@gmail.com', full_name: 'Angeli Macdonald', school: 'usc' },
  { email: 'rebeccagadomski@gmail.com', full_name: 'Rebecca Gadomski', school: 'usc' },
  { email: 'catherinebarbieri01@gmail.com', full_name: 'Catherine Barbieri', school: 'usc' },
  { email: 'candrewdds@yahoo.com', full_name: 'Andrew Snell', school: 'usc' },
  { email: 'apolek@nasd.k12.pa.us', full_name: 'Alison Polek', school: 'usc' },
  { email: 'stephiec021876@gmail.com', full_name: 'Stephanie Cramer', school: 'osu' },
  { email: 'mackbrynn1313@gmail.com', full_name: 'Teresa Badalamenti', school: 'usc' },
  { email: 'elisarroland@gmail.com', full_name: 'Elisa Roland', school: 'udel' },
  { email: 'rebecca.dawsonrn@gmail.com', full_name: 'Rebecca Dawson', school: 'usc' },
  { email: 'agalm@verizon.net', full_name: 'Amanda Galm', school: 'usc' },
  { email: 'janinelmclements@gmail.com', full_name: 'Janine Clements', school: 'usc' },
  { email: 'jsniffen@gmail.com', full_name: 'Jennifer Sniffen', school: 'usc' },
  { email: 'danagreci19@gmail.com', full_name: 'Dana Greci', school: 'usc' },
  { email: 'theresam.elmer@gmail.com', full_name: 'Theresa Elmer', school: 'usc' },
  { email: 'mlbelusic@yahoo.com', full_name: 'Melisa Skific', school: 'usc' },
  { email: 'nancy.jackson@gmail.com', full_name: 'Nancy Jackson', school: 'usc' },
  { email: 'jenprince23@gmail.com', full_name: 'Jennifer Prince', school: 'usc' },
  { email: 'cmariepayne@gmail.com', full_name: 'Christine Payne', school: 'usc' },
  { email: 'esroka@bwschools.net', full_name: 'Erin Sroka', school: 'osu' },
  { email: 'rachelsdf813@gmail.com', full_name: 'Rachel Fortune', school: 'usc' },
  { email: 'krtship@gmail.com', full_name: 'k topinka', school: 'usc' },
  { email: 'janelleshively@gmail.com', full_name: 'Janelle Shively', school: 'uga' },
  { email: 'deniserphillips@gmail.com', full_name: 'Denise Phillips', school: 'usc' },
  { email: 'alicia.halphen@gmail.com', full_name: 'Alicia Halphen', school: 'osu' },
  { email: 'sandcanelas@gmail.com', full_name: 'Sandra Canelas', school: 'usc' },
  { email: 'pamelasher10@gmail.com', full_name: 'Pam Sher', school: 'usc' },
  { email: '4phillipharper@gmail.com', full_name: 'Phillip Harper', school: 'uga' },
  { email: 'mikebertolozzi@gmail.com', full_name: 'Mike Bertolozzi', school: 'umd' },
  { email: 'jkcoopers@gmail.com', full_name: 'John and Kimberly Cooper', school: 'uga' },
  { email: 'burpoedj@gmail.com', full_name: 'Duane Burpoe', school: 'uga' },
  { email: 'caryn11reid@gmail.com', full_name: 'Caryn Reid', school: 'uga' },
  { email: 'dina.shulman225@gmail.com', full_name: 'Dina Shulman', school: 'osu' },
  { email: 'pfeehan316@gmail.com', full_name: 'Patricia Feehan', school: 'osu' },
  { email: 'pmaini@gmail.com', full_name: 'Prachi Nagpal', school: 'osu' },
  { email: 'nhalphen22@gmail.com', full_name: 'Natalie Halphen', school: 'osu' },
  { email: 'joliegasman@gmail.com', full_name: 'Jolie Gasman', school: 'osu' },
  { email: 'jeisenberg290@gmail.com', full_name: 'Justin Eisenberg', school: 'osu' },
  { email: 'soniasanjeev@gmail.com', full_name: 'Sonia Sanjeev', school: 'osu' },
  { email: 'mfallon033@gmail.com', full_name: 'Michael Fallon', school: 'osu' },
  { email: 'robynwolfe821@gmail.com', full_name: 'Robyn Wolfe', school: 'osu' },
  { email: 'catg355@gmail.com', full_name: 'Catherine Anderson', school: 'usc' },
  { email: 'stephanie@delraytechnology.com', full_name: 'Stephanie Budin', school: 'ucf' },
  { email: 'hswslp@gmail.com', full_name: 'Heather Williams', school: 'usc' },
  { email: 'wbfm1129@gmail.com', full_name: 'Wendy M.', school: 'udel' },
  { email: 'drdave1827@gmail.com', full_name: 'David Fields', school: 'usc' },
  { email: 'anunair12@gmail.com', full_name: 'ANURADHA NAIR', school: 'usc' },
  { email: 'karen.denton@cherokee1.org', full_name: 'KAREN DENTON', school: 'usc' },
  { email: 'tmattera99@gmail.com', full_name: 'Tara Mattera', school: 'usc' },
  { email: 'ntbloom247@gmail.com', full_name: 'Nina Bloomingburg', school: 'usc' },
  { email: 'ginamcguire5@gmail.com', full_name: 'gina mcguire', school: 'usc' },
  { email: 'dmrichmond72@gmail.com', full_name: 'Dawn Richmond', school: 'usc' },
  { email: 'katjay320@gmail.com', full_name: 'Kathleen Jeffcoat', school: 'usc' },
  { email: 'bognermaria6@gmail.com', full_name: 'Maria Bogner', school: 'udel' },
  { email: 'carabharper@gmail.com', full_name: 'Cara Harper', school: 'uga' },
  { email: 'karenmmurphy17@gmail.com', full_name: 'Karen Murphy', school: 'usc' },
  { email: 'jolenekorzeniewski@gmail.com', full_name: 'Jolene Korzeniewski', school: 'usc' },
  { email: 'sabotage1920@gmail.com', full_name: 'Crystal Goodwin', school: 'usc' },
  { email: 'ddsloane@gmail.com', full_name: 'D Ryan', school: 'usc' },
  { email: 'miknshan@me.com', full_name: 'Shannon Mourar', school: 'usc' },
  { email: 'lawbarwick8@gmail.com', full_name: 'Lori B', school: 'usc' },
  { email: 'taluyamx@gmail.com', full_name: 'Martha Leticia De Leon Rodriguez', school: 'usc' },
  { email: 'taralimoco@gmail.com', full_name: 'Tara Limoco', school: 'usc' },
  { email: 'kristin@davisaudiology.com', full_name: 'Kristin Davis', school: 'usc' },
  { email: 'pageamyd@gmail.com', full_name: 'Amy Page', school: 'usc' },
  { email: 'jennifer.r.mosser@gmail.com', full_name: 'Jennifer Mosser', school: 'usc' },
  { email: 'mhelf12@gmail.com', full_name: 'Mitch Helfman', school: 'usc' },
  { email: 'adahlhauser4@gmail.com', full_name: 'April Dahlhauser', school: 'usc' },
  { email: 'randisiegel08@gmail.com', full_name: 'Randi Siegel', school: 'usc' },
  { email: 'mrbrianmlevine@gmail.com', full_name: 'Brian Levine', school: 'usc' },
  { email: 'sylvianola1970@gmail.com', full_name: 'Sylvia Brown', school: 'usc' },
  { email: 'marisahhi@gmail.com', full_name: 'Marisa Wagner', school: 'usc' },
  { email: 'kuulei0924@gmail.com', full_name: 'Wendy Early', school: 'usc' },
  { email: 'artishort@gmail.com', full_name: 'arti short', school: 'usc' },
  { email: 'logsfb@verizon.net', full_name: 'JB', school: 'usc' },
  { email: 'nickolai_30342@yahoo.com', full_name: 'Nicole Scarborough', school: 'usc' },
  { email: 'danielle.rubenstein@gmail.com', full_name: 'Danielle Rubenstein', school: 'usc' },
  { email: 'grdnjul@gmail.com', full_name: 'Julie Houston', school: 'usc' },
  { email: 'adam@submersivemedia.com', full_name: 'Adam Spielberger', school: 'usc' },
  { email: 'risa.mcgrew@gmail.com', full_name: 'Risa McGrew', school: 'usc' },
  { email: 'gillchiro9@gmail.com', full_name: 'lauren g', school: 'usc' },
  { email: 'dpatten1524@gmail.com', full_name: 'Donna Patten', school: 'usc' },
  { email: 'lasgesq@yahoo.com', full_name: 'lasgesq', school: 'usc' },
  { email: 'bgilmore924@gmail.com', full_name: 'Brandy Gilmore', school: 'usc' },
  { email: 'urotmt@gmail.com', full_name: 'Tricia Thaker', school: 'usc' },
  { email: 'jillfields2@gmail.com', full_name: 'Jill Fields', school: 'usc' },
  { email: 'allison.a.hallman@gmail.com', full_name: 'Allison Hallman', school: 'usc' },
  { email: 'jbazzone@gmail.com', full_name: 'Jill Bazzone', school: 'usc' },
  { email: 'dj042103@gmail.com', full_name: 'D Hollars', school: 'usc' },
  { email: 'rachelawton@gmail.com', full_name: 'Rochelle', school: 'usc' },
  { email: 'wscottmacdonald1@gmail.com', full_name: 'W. Scott MacDonald', school: 'usc' },
  { email: 'smorris127@gmail.com', full_name: 'Samantha Morris', school: 'usc' },
  { email: 'lauriebranum@gmail.com', full_name: 'Laurie BRANUM', school: 'usc' },
  { email: 'a.reardon@infantswim.com', full_name: 'Amy Reardon', school: 'usc' },
  { email: 'vlangermatt@gmail.com', full_name: 'Veronica Langer', school: 'usc' },
  { email: 'heidiryan71@gmail.com', full_name: 'Heidi Ryan', school: 'udel' },
  { email: 'mrsrobinbender@gmail.com', full_name: 'Robin Bender', school: 'udel' },
  { email: 'mrshomedepot@gmail.com', full_name: 'Alana Rodriguez', school: 'udel' },
  { email: 'christineltate@gmail.com', full_name: 'Christine Tate', school: 'usc' },
  { email: 'lisablinder26@gmail.com', full_name: 'Lisa Rogers', school: 'usc' },
  { email: 'kristine.mcgee@gmail.com', full_name: 'Kristine McGee', school: 'udel' },
  { email: 'loribrooks29@gmail.com', full_name: 'Lori Brooks', school: 'udel' },
  { email: 'dmcolontonio@gmail.com', full_name: 'Dawn Miller', school: 'usc' },
  { email: 'lisagold38@yahoo.com', full_name: 'lisagold38', school: 'usc' },
  { email: 'janetlawson@optonline.net', full_name: 'Janet', school: 'usc' },
  { email: 'nicoge63@gmail.com', full_name: 'alexandra felsenhardt', school: 'usc' },
  { email: 'jennven@comcast.net', full_name: 'Jen Venditti', school: 'usc' },
  { email: 'cgbrown976@gmail.com', full_name: 'Casey Brown', school: 'usc' },
  { email: 'jennagoldblatt@gmail.com', full_name: 'Jenna Goldblatt', school: 'usc' },
  { email: 'amysilverman1@gmail.com', full_name: 'Amy Silverman', school: 'usc' },
  { email: 'lefkodeb2@gmail.com', full_name: 'D Cohen', school: 'usc' },
  { email: 'cffosu@gmail.com', full_name: 'Brandon Schops', school: 'osu' },
  { email: '14alyb@gmail.com', full_name: 'Alyson Brooks', school: 'osu' },
  { email: 'jetwersky@gmail.com', full_name: 'Jamie Twersky', school: 'udel' },
  { email: 'crystallease3@gmail.com', full_name: 'Crystal Lease', school: 'psu' },
  { email: 'lawbon222@gmail.com', full_name: 'Bonnie Lafazan', school: 'psu' },
  { email: 'jodi@jodimurnick.com', full_name: 'Jodi Murnick', school: 'usc' },
  { email: 'nancyrmartin4@gmail.com', full_name: 'nancy martin', school: 'miami' },
  { email: 'jarahwilk@gmail.com', full_name: 'Jarah Wilk', school: 'osu' },
  { email: 'arleengoldenberg@gmail.com', full_name: 'Arleen Goldenberg', school: 'fsu' },
  { email: 'loridubin2@gmail.com', full_name: 'Lori Dubin', school: 'osu' },
  { email: 'mlb379@gmail.com', full_name: 'Mandi Blaire', school: 'ucf' },
  { email: 'jaime0525@gmail.com', full_name: 'jaime shenkman', school: 'umd' },
  { email: 'shillmant@bellsouth.net', full_name: 'shillmant', school: 'miami' },
  { email: 'levinteam@gmail.com', full_name: 'jaime levin', school: 'psu' },
  // josinoff@gmail.com is the founder — excluded from blast but she gets the test
];

function getFirstName(fullName) {
  if (!fullName || !fullName.trim() || fullName === 'there') return 'there';
  const first = fullName.trim().split(' ')[0];
  // handle email-as-name, all-lowercase with special chars, or pure handle
  if (first.includes('@') || first.includes('.com') || (first === first.toLowerCase() && /[\d_]/.test(first))) return 'there';
  // Capitalize first letter if all lowercase
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function getSchoolName(code) {
  return SCHOOL_NAMES[code?.toLowerCase()] || code || 'your school';
}

function buildParentEmailHtml(firstName, schoolName) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#0d1117;line-height:1.6;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:40px 32px;">

<p style="font-size:16px;margin:0 0 20px;">Hi ${firstName},</p>

<p style="font-size:16px;margin:0 0 20px;">I want to start by saying thank you.</p>

<p style="font-size:16px;margin:0 0 20px;">You joined College Fast Forward when it was barely a thing — an idea from one ${schoolName} parent who couldn't shake the feeling that our kids deserved more than a cold applications portal and crossed fingers. You trusted me with your email and your time while I was still figuring out what this could become. That trust is the only reason any of this exists.</p>

<p style="font-size:16px;margin:0 0 20px;">I've spent the last several months rebuilding it — really rebuilding it. Nobody has done what we're trying to do: a warm, responsive network of parents, alumni, and recent grads where students can actually get introduced to real humans who'll answer. Every week I learned something new and had to redo pieces of it. Thank you for your patience while I got it right.</p>

<p style="font-size:16px;margin:0 0 24px;">It's live now at <strong>collegefastforward.com</strong>. Come over and sign up with this same email — takes about a minute.</p>

<p style="font-size:16px;margin:0 0 20px;">I don't need to tell you it's April, and that our kids are watching their friends get offers, and that the group chat is a stressful place right now. You know. I know. I go to bed thinking about my own kids the same way you do.</p>

<p style="font-size:16px;margin:0 0 12px;"><strong>The ${schoolName} network is completely free.</strong> No cap, no monthly fee. Every parent, alum, and recent grad who joins is one more door our kids can walk through.</p>

<p style="font-size:16px;margin:24px 0 12px;"><strong>And I built something called FastIQ for our kids.</strong> AI-powered mock interviews. LinkedIn profile reviews. Resume tailoring for any job description in 30 seconds. The outreach messages I wish I could have written for my own kids when they were staring at a blank email to some alum they'd never met. <strong>It's $14.50/month through April 30th as an introductory offer</strong> (half off the regular $29/month), because I want our kids to be able to use it right now, during the season they need it most.</p>

<p style="font-size:16px;margin:24px 0;">Come see what you helped build.</p>

<div style="text-align:center;margin:32px 0;">
<a href="https://collegefastforward.com" style="display:inline-block;background:#E85D20;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">Go to collegefastforward.com</a>
</div>

<p style="font-size:16px;margin:24px 0 8px;">Thank you, truly. For believing in this before there was anything to believe in.</p>

<p style="font-size:16px;margin:0 0 4px;">Jill</p>
<p style="font-size:14px;margin:0 0 24px;color:#666;">Founder, College Fast Forward<br>(from one parent of a college kid to another)</p>

<p style="font-size:14px;margin:24px 0 0;color:#666;border-top:1px solid #eee;padding-top:16px;">P.S. If you know another ${schoolName} parent who'd want in — especially right now — forward them this email. The more of us in the network, the more doors our kids can walk through.</p>

</div>
</body>
</html>`;
}

async function sendEmail(sgKey, to, toName, subject, html) {
  return fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sgKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to, name: toName || '' }] }],
      from: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
      reply_to: { email: 'jill@collegefastforward.com', name: 'Jill Osinoff' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default true
    const testEmail = body.test_email || null;

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      return Response.json({ error: 'SENDGRID_API_KEY not set.' }, { status: 500 });
    }

    const SUBJECT = `You helped build this — come see what it became`;

    // Filter out Apple relay, empty emails, and no-school rows
    const eligible = PARENT_CSV.filter(u =>
      u.email &&
      !u.email.includes('privaterelay.appleid.com') &&
      u.school
    );

    // --- TEST MODE ---
    if (testEmail) {
      const firstName = body.first_name || 'Jill';
      const schoolName = body.school_name || 'University of South Carolina';
      const html = buildParentEmailHtml(firstName, schoolName);
      const res = await sendEmail(SENDGRID_API_KEY, testEmail, firstName, SUBJECT, html);
      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: err }, { status: 500 });
      }
      return Response.json({ success: true, mode: 'test', sent_to: testEmail, first_name: firstName, school_name: schoolName });
    }

    // --- DRY RUN ---
    if (dryRun) {
      const existingUsers = await base44.asServiceRole.entities.User.list();
      const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));

      const toSend = eligible.filter(u => !existingEmails.has(u.email.toLowerCase().trim()));
      const alreadyInDb = eligible.filter(u => existingEmails.has(u.email.toLowerCase().trim()));

      const preview = toSend.slice(0, 5).map(u => ({
        email: u.email,
        first_name: getFirstName(u.full_name),
        school_code: u.school,
        school_name: getSchoolName(u.school),
      }));

      return Response.json({
        mode: 'dry_run',
        total_in_csv: eligible.length,
        already_in_db: alreadyInDb.length,
        already_in_db_emails: alreadyInDb.map(u => u.email),
        will_send_to: toSend.length,
        preview,
      });
    }

    // --- FULL SEND ---
    const startIndex = body.start_index || 0;
    const existingUsers = await base44.asServiceRole.entities.User.list();
    const existingEmails = new Set((existingUsers || []).map(u => u.email?.toLowerCase().trim()));
    const allToSend = eligible.filter(u => !existingEmails.has(u.email.toLowerCase().trim()));
    const toSend = allToSend.slice(startIndex);

    console.log(`📧 Sending parent migration email to ${toSend.length} recipients`);

    let sent = 0, failed = 0;
    const errors = [];
    const BATCH_SIZE = 25;

    for (let i = 0; i < toSend.length; i++) {
      const u = toSend[i];
      const firstName = getFirstName(u.full_name);
      const schoolName = getSchoolName(u.school);
      const html = buildParentEmailHtml(firstName, schoolName);

      const res = await sendEmail(SENDGRID_API_KEY, u.email, u.full_name, SUBJECT, html);
      if (res.ok) { sent++; } else { failed++; errors.push({ email: u.email, status: res.status }); }

      if ((i + 1) % BATCH_SIZE === 0 && i + 1 < toSend.length) {
        console.log(`Batch ${Math.ceil((i + 1) / BATCH_SIZE)} done (${sent} sent). Waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
      } else {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    return Response.json({ success: true, mode: 'full_send', sent, failed, errors });

  } catch (e) {
    console.error('sendParentMigrationEmail error:', e);
    return Response.json({ error: e.message }, { status: 500 });
  }
});
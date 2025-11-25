/**
 * Utility functions for displaying user names consistently across the app
 */

/**
 * Properly capitalize a name (handles hyphenated names and special cases)
 */
function capitalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  
  return name.trim()
    .split(/(\s+|-|')/) // Split on spaces, hyphens, and apostrophes but keep delimiters
    .map((part, index, array) => {
      // If it's a delimiter, keep it as is
      if (part.match(/^(\s+|-|')$/)) return part;
      
      // If it's an empty string, skip
      if (!part) return part;
      
      // Capitalize first letter, lowercase the rest
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Get a properly formatted display name from user object
 * Priority: first_name + last_name > full_name > email fallback
 * Always capitalizes names properly regardless of how they're stored
 */
export function getDisplayName(user) {
  if (!user) return 'Unknown User';
  
  // Priority 1: first_name and last_name (most reliable)
  if (user.first_name && user.last_name) {
    const firstName = capitalizeName(user.first_name);
    const lastName = capitalizeName(user.last_name);
    return `${firstName} ${lastName}`;
  }
  
  // Priority 2: just first_name or last_name
  if (user.first_name && !user.last_name) {
    return capitalizeName(user.first_name);
  }
  if (!user.first_name && user.last_name) {
    return capitalizeName(user.last_name);
  }
  
  // Priority 3: full_name (if it doesn't look like an email)
  if (user.full_name && user.full_name.trim() && !user.full_name.includes('@')) {
    // Split full name and capitalize each part
    return user.full_name.trim()
      .split(' ')
      .map(part => capitalizeName(part))
      .filter(Boolean)
      .join(' ');
  }
  
  // Last resort: extract name from email and capitalize properly
  if (user.email) {
    const emailName = user.email.split('@')[0];
    // Convert "jill.camhi" to "Jill Camhi"
    if (emailName.includes('.')) {
      return emailName
        .split('.')
        .map(part => {
          const cleanPart = part.replace(/[0-9]/g, '');
          return capitalizeName(cleanPart);
        })
        .filter(Boolean)
        .join(' ');
    }
    // Remove numbers first: "spencer7stavrevski" -> "spencerstavrevski"
    const cleanName = emailName.replace(/[0-9]/g, '');
    
    // Try to detect common name patterns and split them
    // e.g., "joshuamarchant" -> "Joshua Marchant"
    const commonFirstNames = ['joshua', 'spencer', 'olivia', 'michael', 'sarah', 'david', 'james', 'john', 'robert', 'william', 'richard', 'joseph', 'thomas', 'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'kenneth', 'george', 'edward', 'brian', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'raymond', 'gregory', 'frank', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'adam', 'nathan', 'henry', 'douglas', 'zachary', 'peter', 'kyle', 'noah', 'ethan', 'jeremy', 'walter', 'christian', 'keith', 'roger', 'terry', 'austin', 'sean', 'gerald', 'carl', 'harold', 'dylan', 'arthur', 'lawrence', 'jordan', 'jesse', 'bryan', 'billy', 'bruce', 'gabriel', 'joe', 'logan', 'alan', 'juan', 'wayne', 'elijah', 'randy', 'roy', 'vincent', 'ralph', 'eugene', 'russell', 'bobby', 'mason', 'philip', 'louis', 'mary', 'patricia', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica', 'margaret', 'dorothy', 'lisa', 'nancy', 'karen', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'sharon', 'michelle', 'laura', 'kimberly', 'deborah', 'stephanie', 'cynthia', 'amy', 'angela', 'melissa', 'brenda', 'anna', 'rebecca', 'virginia', 'kathleen', 'pamela', 'martha', 'debra', 'amanda', 'stephanie', 'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'ashley', 'judith', 'rose', 'janice', 'kelly', 'nicole', 'judy', 'christina', 'kathy', 'theresa', 'beverly', 'denise', 'tammy', 'irene', 'jane', 'lori', 'rachel', 'marilyn', 'andrea', 'kathryn', 'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia', 'ruby', 'lois', 'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'emily', 'robin', 'peggy', 'crystal', 'gladys', 'rita', 'dawn', 'connie', 'florence', 'tracy', 'edna', 'tiffany', 'carmen', 'rosa', 'cindy', 'grace', 'wendy', 'victoria', 'edith', 'kim', 'sherry', 'sylvia', 'josephine', 'thelma', 'shannon', 'sheila', 'ethel', 'ellen', 'elaine', 'marjorie', 'carrie', 'charlotte', 'monica', 'esther', 'pauline', 'emma', 'juanita', 'anita', 'rhonda', 'hazel', 'amber', 'eva', 'debbie', 'april', 'leslie', 'clara', 'lucille', 'jamie', 'joanne', 'eleanor', 'valerie', 'danielle', 'megan', 'alicia', 'suzanne', 'michele', 'gail', 'bertha', 'darlene', 'veronica', 'jill', 'erin', 'geraldine', 'lauren', 'cathy', 'joann', 'lorraine', 'lynn', 'sally', 'regina', 'erica', 'beatrice', 'dolores', 'bernice', 'audrey', 'yvonne', 'annette', 'june', 'samantha', 'marion', 'dana', 'stacy', 'ana', 'renee', 'ida', 'vivian', 'roberta', 'holly', 'brittany', 'melanie', 'loretta', 'yolanda', 'jeanette', 'laurie', 'katie', 'kristen', 'vanessa', 'alma', 'sue', 'elsie', 'beth', 'jeanne', 'vicki', 'carla', 'tara', 'rosemary', 'eileen', 'terri', 'gertrude', 'lucy', 'tonya', 'ella', 'stacey', 'wilma', 'gina', 'kristin', 'jessie', 'natalie', 'agnes', 'vera', 'willie', 'charlene', 'bessie', 'delores', 'melinda', 'pearl', 'arlene', 'maureen', 'colleen', 'allison', 'tamara', 'joy', 'georgia', 'constance', 'lillie', 'claudia', 'jackie', 'marcia', 'tanya', 'nellie', 'minnie', 'marlene', 'heidi', 'glenda', 'lydia', 'viola', 'courtney', 'marian', 'stella', 'caroline', 'dora', 'jo', 'vickie', 'mattie', 'maxine', 'irma', 'mabel', 'marsha', 'myrtle', 'lena', 'christy', 'deanna', 'patsy', 'hilda', 'gwendolyn', 'jennie', 'nora', 'margie', 'nina', 'cassandra', 'leah', 'penny', 'kay', 'priscilla', 'naomi', 'carole', 'brandy', 'olga', 'billie', 'dianne', 'tracey', 'leona', 'jenny', 'felicia', 'sonia', 'miriam', 'velma', 'becky', 'bobbie', 'violet', 'kristina', 'toni', 'misty', 'mae', 'shelly', 'daisy', 'ramona', 'sherri', 'erika', 'katrina', 'claire', 'rhiannon', 'odesai', 'omri', 'paige'];
    const lowerClean = cleanName.toLowerCase();
    
    for (const firstName of commonFirstNames) {
      if (lowerClean.startsWith(firstName) && lowerClean.length > firstName.length) {
        const lastName = lowerClean.slice(firstName.length);
        return `${capitalizeName(firstName)} ${capitalizeName(lastName)}`;
      }
    }
    
    // If no match found, just capitalize the whole thing as one name
    return capitalizeName(cleanName);
  }
  
  return 'Gator User';
}

/**
 * Get initials from user object
 */
export function getInitials(user) {
  if (!user) return 'GU';
  
  // Priority 1: Use first and last name
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  
  // Priority 2: Parse display name
  const displayName = getDisplayName(user);
  const nameParts = displayName.split(' ').filter(Boolean);
  
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
}

/**
 * Get first name only - always properly capitalized
 */
export function getFirstName(user) {
  if (!user) return 'User';
  
  if (user.first_name) {
    return capitalizeName(user.first_name);
  }
  
  const displayName = getDisplayName(user);
  return displayName.split(' ')[0];
}
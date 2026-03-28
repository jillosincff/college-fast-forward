export const MAJOR_TO_INDUSTRIES = {
  'Finance': ['Financial Services & Banking', 'Real Estate', 'Technology & Software', 'Consulting'],
  'Accounting': ['Financial Services & Banking', 'Consulting', 'Government & Nonprofit', 'Technology & Software'],
  'Marketing': ['Marketing & Brand', 'Media & Entertainment', 'Consumer Goods & Retail', 'Technology & Software'],
  'Management': ['Consulting', 'Financial Services & Banking', 'Technology & Software', 'Consumer Goods & Retail'],
  'Entrepreneurship': ['Technology & Software', 'Consumer Goods & Retail', 'Media & Entertainment', 'Real Estate'],
  'Business Administration': ['Financial Services & Banking', 'Consulting', 'Technology & Software', 'Consumer Goods & Retail'],
  'International Business': ['Financial Services & Banking', 'Consulting', 'Consumer Goods & Retail', 'Government & Nonprofit'],
  'Supply Chain': ['Logistics & Supply Chain', 'Consumer Goods & Retail', 'Technology & Software', 'Engineering'],
  'Human Resources': ['Human Resources', 'Consulting', 'Technology & Software', 'Financial Services & Banking'],
  'Real Estate': ['Real Estate', 'Financial Services & Banking', 'Consulting', 'Government & Nonprofit'],
  'Computer Science': ['Technology & Software', 'Financial Services & Banking', 'Media & Entertainment', 'Healthcare & Life Sciences'],
  'Information Systems': ['Technology & Software', 'Financial Services & Banking', 'Consulting', 'Healthcare & Life Sciences'],
  'Data Science': ['Technology & Software', 'Financial Services & Banking', 'Healthcare & Life Sciences', 'Consulting'],
  'Engineering': ['Engineering', 'Technology & Software', 'Energy & Utilities', 'Logistics & Supply Chain'],
  'Biomedical Engineering': ['Biotech & Life Sciences', 'Healthcare & Life Sciences', 'Engineering', 'Technology & Software'],
  'Environmental Science': ['Energy & Utilities', 'Government & Nonprofit', 'Engineering', 'Nonprofit & Social Impact'],
  'Mathematics': ['Financial Services & Banking', 'Technology & Software', 'Consulting', 'Education'],
  'Statistics': ['Financial Services & Banking', 'Technology & Software', 'Healthcare & Life Sciences', 'Consulting'],
  'Biology': ['Healthcare & Life Sciences', 'Biotech & Life Sciences', 'Pre-Med & Healthcare', 'Education'],
  'Pre-Med': ['Pre-Med & Healthcare', 'Healthcare & Life Sciences', 'Biotech & Life Sciences', 'Government & Nonprofit'],
  'Nursing': ['Healthcare & Life Sciences', 'Pre-Med & Healthcare', 'Government & Nonprofit', 'Nonprofit & Social Impact'],
  'Public Health': ['Healthcare & Life Sciences', 'Government & Nonprofit', 'Nonprofit & Social Impact', 'Biotech & Life Sciences'],
  'Pharmacy': ['Healthcare & Life Sciences', 'Biotech & Life Sciences', 'Pre-Med & Healthcare', 'Consumer Goods & Retail'],
  'Psychology': ['Healthcare & Life Sciences', 'Human Resources', 'Nonprofit & Social Impact', 'Education'],
  'Sociology': ['Nonprofit & Social Impact', 'Government & Nonprofit', 'Education', 'Human Resources'],
  'Political Science': ['Government & Nonprofit', 'Legal & Compliance', 'Nonprofit & Social Impact', 'Consulting'],
  'Economics': ['Financial Services & Banking', 'Consulting', 'Government & Nonprofit', 'Technology & Software'],
  'Communications': ['Media & Entertainment', 'Marketing & Brand', 'Government & Nonprofit', 'Technology & Software'],
  'Journalism': ['Media & Entertainment', 'Marketing & Brand', 'Government & Nonprofit', 'Nonprofit & Social Impact'],
  'English': ['Media & Entertainment', 'Marketing & Brand', 'Education', 'Nonprofit & Social Impact'],
  'History': ['Government & Nonprofit', 'Legal & Compliance', 'Education', 'Nonprofit & Social Impact'],
  'Philosophy': ['Legal & Compliance', 'Consulting', 'Government & Nonprofit', 'Education'],
  'Graphic Design': ['Media & Entertainment', 'Marketing & Brand', 'Technology & Software', 'Architecture & Design'],
  'Architecture': ['Architecture & Design', 'Real Estate', 'Engineering', 'Government & Nonprofit'],
  'Film': ['Media & Entertainment', 'Marketing & Brand', 'Technology & Software', 'Nonprofit & Social Impact'],
  'Music': ['Media & Entertainment', 'Marketing & Brand', 'Education', 'Nonprofit & Social Impact'],
  'Fine Arts': ['Media & Entertainment', 'Architecture & Design', 'Education', 'Nonprofit & Social Impact'],
  'Sport Management': ['Sports & Athletics', 'Media & Entertainment', 'Marketing & Brand', 'Hospitality & Tourism'],
  'Hospitality': ['Hospitality & Tourism', 'Consumer Goods & Retail', 'Real Estate', 'Marketing & Brand'],
  'Education': ['Education', 'Nonprofit & Social Impact', 'Government & Nonprofit', 'Technology & Software'],
  'Criminal Justice': ['Legal & Compliance', 'Government & Nonprofit', 'Nonprofit & Social Impact', 'Education'],
  'Social Work': ['Nonprofit & Social Impact', 'Government & Nonprofit', 'Healthcare & Life Sciences', 'Education'],
  'Advertising': ['Marketing & Brand', 'Media & Entertainment', 'Technology & Software', 'Consumer Goods & Retail'],
  'Other': ['Technology & Software', 'Financial Services & Banking', 'Consulting', 'Government & Nonprofit'],
  'Undecided': ['Technology & Software', 'Financial Services & Banking', 'Consulting', 'Government & Nonprofit'],
};

export const getIndustryChipsForMajor = (major) => {
  if (!major) return ['Technology & Software', 'Financial Services & Banking', 'Consulting', 'Something else'];
  if (MAJOR_TO_INDUSTRIES[major]) return [...MAJOR_TO_INDUSTRIES[major], 'Something else'];
  const key = Object.keys(MAJOR_TO_INDUSTRIES).find(k =>
    major.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(major.toLowerCase())
  );
  return key
    ? [...MAJOR_TO_INDUSTRIES[key], 'Something else']
    : ['Technology & Software', 'Financial Services & Banking', 'Consulting', 'Something else'];
};
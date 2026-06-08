# Agent Guardrail Verification Strategy

## Overview
This document outlines the three-point validation checklist enforced across all lead generation functions to prevent ghost jobs, mirrored titles, and invalid company data from entering the pipeline.

## The Problem: Ghost Jobs
**Ghost jobs** are fake or malformed job listings that appear in the system due to:
- LLM hallucinations generating company names from job titles
- Scraped data with missing or nested company fields
- Job titles masquerading as company names (e.g., "Marketing Manager" instead of "Google")
- Systemic timeouts returning placeholder text like "Entry Level Role"

### Known Ghost Companies (Blocked)
- Capsule Health / Capsule
- Goodwin Recruiting / Goodwin
- Any company name containing job title keywords without business suffixes

---

## The Solution: Three-Point Agent Validation

### 1. Identity Check (Blocks Ghosts & Mirrored Titles)
**Purpose**: Ensure the company is a real business entity, not a job title.

**Validation Rules**:
```javascript
// Company name must exist and be > 2 characters
if (!company || company.length < 3) return false;

// Company cannot mirror the job title exactly
if (lowerCompany === lowerTitle) return false;

// Company names with job title keywords MUST have business suffixes
const jobKeywords = ['intern', 'manager', 'analyst', 'engineer', ...];
const businessSuffixes = ['inc', 'llc', 'corp', 'company', 'group', ...];

if (!hasValidSuffix && jobKeywords.some(k => lowerCompany.includes(k))) {
  return false; // Example: "Marketing Manager Inc" ❌ vs "Google Inc" ✅
}
```

**Examples**:
- ✅ `"Google"` - Valid company
- ✅ `"Publicis Groupe"` - Valid (has business context)
- ❌ `"Marketing Manager"` - Rejected (job title, no suffix)
- ❌ `"Data Analyst Solutions"` - Rejected (job keyword + generic suffix pattern)

---

### 2. Target Matching (Validates Strategic Relevance)
**Purpose**: Ensure the job is real and matches the user's career goals.

**Validation Rules**:
```javascript
// Job title must exist and not be a placeholder
if (!jobTitle || jobTitle === 'Entry Level Role') return false;
if (jobTitle.toLowerCase().includes('join our team')) return false;

// Location must match user preferences (if specified)
if (userGoals.location_preference) {
  const targetLoc = userGoals.location_preference.toLowerCase();
  if (location && !location.includes(targetLoc) && !targetLoc.includes(location)) {
    return false; // Geographic mismatch
  }
}
```

**Examples**:
- ✅ `"Software Engineer I"` - Valid job title
- ❌ `"Entry Level Role"` - Rejected (LLM fallback)
- ❌ `"Join our team!"` - Rejected (placeholder text)

---

### 3. Link Resolution (Confirms Actionable Engines)
**Purpose**: Ensure we can actually scrape LinkedIn or company data for this lead.

**Validation Rules**:
```javascript
// Must have LinkedIn URL or company domain for Phase 2 automation
const linkedinUrl = lead.linkedin_url || lead.company_linkedin;
const companyDomain = lead.domain || lead.company_domain;

if (!linkedinUrl && !companyDomain) {
  console.log(`⚠️ WARNING: No LinkedIn/domain for "${company}"`);
  // Currently allowed but logged for debugging
}
```

**Note**: This is currently a soft validation (logs warnings but doesn't block). Future iterations may enforce strict blocking.

---

## Implementation Locations

### Backend Functions
1. **`functions/getDualConstraintLeads`** (lines 97-140)
   - Validates Exa search results before returning
   - Inline validation logic (no external imports)

2. **`functions/getLiveJobMatchesFn`** (lines 114-166)
   - Validates LLM-generated company leads
   - Logs rejected companies with reasons

### Frontend Components
1. **`components/free-tier/OrganizedFeeds`** (lines 169-238, 254-288, 376-395)
   - `isValidCompanyName()` - Frontend validation
   - Deep structural mapping for dual constraint leads
   - Ultimate guard filter before rendering

2. **`utils/validateAgentLeadIntegrity.js`**
   - Shared validation utility (for future use)
   - Documents all validation rules in one place

---

## Debug Logging Strategy

### Console Logs to Monitor
Open browser console and backend logs to trace:

**Frontend (OrganizedFeeds)**:
```
🔍 [DEBUG] Live Matches Raw Payload: {...}
🔍 [DEBUG] Lead #0: { company, title, linkedinUrl, ... }
```

**Backend (getDualConstraintLeads)**:
```
🔍 [DualConstraint] Raw Exa Result: {...}
🔍 [DualConstraint] Extracted: { company, title, has_company, has_title }
🚫 [DualConstraint] REJECTED (mirrored): Capsule
```

**Backend (getLiveJobMatchesFn)**:
```
🔍 [getLiveJobMatchesFn] Raw LLM Result: {...}
🚫 [getLiveJobMatchesFn] REJECTED (job keyword): Goodwin Recruiting
[getLiveJobMatchesFn] Validated: 8 / 12 companies passed guardrails
```

---

## Testing & Verification

### Manual Testing
1. Open browser console (F12)
2. Navigate to FreeTierDashboard
3. Click "New Batch" to refresh leads
4. Inspect `console.dir` output for payload structure
5. Verify no ghost companies appear in the UI

### Automated Testing
See `tests/lead-integrity.test.js` for:
- Ghost company detection tests
- Payload structure validation
- Key mismatch detection
- Job title vs company name separation

### Key Names to Trace
When debugging, check these exact key names in console logs:

**Expected Keys**:
- `company` or `companyName` or `company_name`
- `job_title` or `role` or `title`
- `linkedin_url` or `company_linkedin`
- `domain` or `company_domain`

**Red Flags**:
- Company name nested in `lead.organization.name`
- Job title missing or in unexpected key
- LinkedIn URL blank or null

---

## Emergency Cleanup

If ghost jobs appear:
1. Click **🗑️ Nuke Everything** button in OrganizedFeeds
2. This clears:
   - All localStorage keys
   - All sessionStorage keys
   - Backend cache via `clearJobLeadsCache` function
3. Forces hard reload with cache bypass

---

## Future Enhancements

### Phase 2: Strict Link Resolution
- Block leads without LinkedIn URL or domain
- Require at least one actionable identifier for Phase 2 automation

### Phase 3: Real-Time Validation
- Validate leads at scrape time (Exa/LLM)
- Reject before caching, not just before rendering

### Phase 4: Machine Learning
- Train classifier on valid vs ghost companies
- Automated pattern detection for new ghost types

---

## Contact
For questions or to report new ghost patterns, contact the engineering team with:
- Console logs showing the ghost company
- Payload structure from debug logs
- User ID and timestamp
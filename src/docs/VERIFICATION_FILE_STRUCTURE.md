# Verification System - File Structure

## ✅ Complete File Layout

```
├── docs/
│   ├── AGENT_GUARDRAIL_VERIFICATION.md    ✓ Job lead validation strategy
│   └── VERIFICATION_SYSTEM_SUMMARY.md     ✓ Implementation overview
├── functions/
│   ├── getDualConstraintLeads.js          ✓ Three-point guardrail validation
│   ├── getLiveJobMatchesFn.js             ✓ LLM lead filtering
│   └── verifyAlumniBatch.js               ✓ Alumni integrity verification
└── utils/
    └── verifyAlumnusIntegrity.js          ✓ Core validation utilities
```

---

## File Purposes

### `docs/AGENT_GUARDRAIL_VERIFICATION.md`
**Purpose:** Complete validation strategy for job leads  
**Covers:**
- Three-point checklist (Identity, Target, Link Resolution)
- Ghost company patterns (Capsule, Goodwin)
- Debug logging strategy
- Emergency cleanup procedures

### `docs/VERIFICATION_SYSTEM_SUMMARY.md`
**Purpose:** Implementation overview and testing guide  
**Covers:**
- Three-layer architecture
- Testing procedures
- Console inspection workflow
- Token expiration warnings for mock data

### `functions/getDualConstraintLeads.js`
**Purpose:** Fetch real job listings from Exa API  
**Validation:**
- Inline `validateAgentLeadIntegrity()` function
- Filters job title keywords without business suffixes
- Blocks ghost companies at source
- Console logs rejections (no DB writes for routine filtering)

### `functions/getLiveJobMatchesFn.js`
**Purpose:** Generate personalized job leads via LLM  
**Validation:**
- Inline validation logic
- Filters LLM hallucinations
- Debug logs raw payload structure
- Console logs rejected companies with reasons

### `functions/verifyAlumniBatch.js`
**Purpose:** Verify alumni education + employment history  
**Validation:**
- Strict array inspection (`profile.education[]`, `profile.experiences[]`)
- LinkedIn ID matching (UF = 13606)
- Current employment check (`is_current === true` or `ends_at === null`)
- **Optimized logging:** DB writes only for systemic issues, not routine rejections

### `utils/verifyAlumnusIntegrity.js`
**Purpose:** Core validation utilities  
**Exports:**
- `verifyAlumnusIntegrity(profile, school, company)` - Text-based matching
- `verifyAlumnusById(profile, schoolId, companyId)` - LinkedIn ID matching (gold standard)
- `validateAgentLeadIntegrity(lead, userGoals)` - Job lead validation
- `batchVerifyAlumni(profiles, school, company)` - Batch processing

---

## Database Optimization Strategy

### ✅ Write to DebugLogs Entity (High Priority)
- Corrupt API schemas
- Missing critical fields (null profile, undefined arrays)
- Third-party API failures
- Systemic validation patterns

### ❌ Console Log Only (Routine Rejections)
- Education mismatch (school name doesn't match)
- Employment mismatch (company name doesn't match)
- Generic keyword blocks
- Placeholder title rejections

**Why:** Prevents write amplification when parsing hundreds of payloads per user session.

---

## Testing Considerations

### Token Expiration in Mock Data
When testing `verifyAlumniBatch` with saved JSON snapshots:

```javascript
// ❌ Stale data - will fail current employment check
{
  company: "Google",
  title: "Software Engineer",
  ends_at: "2023-12"  // ← Past date = not current
}

// ✅ Valid mock data
{
  company: "Google",
  title: "Software Engineer",
  ends_at: null  // ← Currently employed
}

// ✅ Also valid
{
  company: "Google",
  title: "Software Engineer",
  ends_at: "Present",
  is_current: true
}
```

**Fix:** Update mock data timestamps or ensure `ends_at` fields use `null` or `"Present"` for active roles.

---

## Integration Points

### Frontend (OrganizedFeeds)
- Debug logs raw payload structure on fetch
- Traces key names from backend APIs
- Identifies nested structure issues before UI rendering

### Backend Functions
- All three functions use inline validation (no external imports)
- Deno-compatible code structure
- Consistent logging format across services

### DebugLogs Entity
- Optional entity for audit trail
- Only written to for systemic issues
- Schema:
  ```javascript
  {
    event: "ALUMNI_FILTER_SYSTEMIC_ISSUE",
    reason: "semicolon-separated failure reasons",
    profile_url: "linkedin.com/in/...",
    school_code: "UF",
    company: "Google",
    severity: "high",
    timestamp: "2026-06-08T..."
  }
  ```

---

## Deployment Status

| File | Status | Notes |
|------|--------|-------|
| `getDualConstraintLeads.js` | ✅ Deployed | Inline validation active |
| `getLiveJobMatchesFn.js` | ✅ Deployed | Ghost job filtering active |
| `verifyAlumniBatch.js` | ✅ Deployed | Alumni verification ready |
| `verifyAlumnusIntegrity.js` | ✅ Created | Utility library complete |
| `AGENT_GUARDRAIL_VERIFICATION.md` | ✅ Created | Strategy documented |
| `VERIFICATION_SYSTEM_SUMMARY.md` | ✅ Created | Testing guide complete |

---

## Next Steps (Optional)

1. **LinkedIn ID Hardcoding**
   - Add school LinkedIn IDs to constants (UF=13606, USC=1234, etc.)
   - Enable ID-based matching in `verifyAlumnusById()`

2. **Real-Time Validation**
   - Move validation to scrape time (Exa/Proxycurl API calls)
   - Reject before caching, not just before rendering

3. **Machine Learning Classifier**
   - Train on valid vs ghost patterns
   - Automated detection of new ghost company types

---

## Support

For questions or to report validation failures:
1. Check console logs for rejection reasons
2. Review payload structure in browser console
3. Verify mock data timestamps (if testing)
4. Consult `docs/AGENT_GUARDRAIL_VERIFICATION.md` for troubleshooting
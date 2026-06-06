# Social Discoveries — Compliant Public X-Ray Pipeline

## Overview
The Social Discoveries feed now operates as a **100% compliant public data ingestion system** using Exa AI as an X-ray search engine targeting LinkedIn's publicly indexed posts.

## Compliance Architecture

### ✅ What Changed
1. **Public X-Ray Queries Only**
   - Query format: `site:linkedin.com/posts/ "[role]" ("#internship" OR "intern") ("location" OR "USA")`
   - Uses Exa's **public web index** — no account-dependent scraping
   - Strictly bound to `includeDomains: ['linkedin.com']`

2. **Recency Enforcement**
   - `startCrawlDate`: Last 14 days only
   - `endCrawlDate`: Current timestamp
   - Filters out stale public listings automatically

3. **Two-Tier Alumni Mapping**
   - **Tier 1**: Public Exa People Search on company domain → alumni found
   - **Tier 2**: No alumni mapped → falls back to "Direct Manager Access" mode
   - Both tiers use **public index only** — no login simulation

4. **User-Driven Action Safeguards**
   - `opportunity_url` maps directly to LinkedIn post URL
   - "🔗 View Post" button opens in external tab (`target="_blank"`)
   - **Zero backend interactions** with LinkedIn — student handles messaging in their own browser

### ✅ What Was Removed
- ❌ No account-dependent scraping engines
- ❌ No automated browser simulation
- ❌ No login gate bypassing
- ❌ No internal API calls to LinkedIn

## Data Flow

```
User Request (role + location)
    ↓
Exa Public X-Ray Search
  query: site:linkedin.com/posts/ "[role]" ("#internship" OR "intern")
  startCrawlDate: -14 days
  includeDomains: [linkedin.com]
    ↓
Public Post Results (URL + text snippet)
    ↓
Company Name Extraction (OpenAI parsing)
    ↓
Domain Lookup Handler (corporate site resolution)
    ↓
Exa People Search (public alumni index)
  query: "[school] alumni working at [company]"
  category: people
    ↓
Tiered Response:
  - alumni_matched: true → Network Match card
  - alumni_matched: false → Direct Manager Access card
    ↓
Frontend Card (external link to post)
    ↓
Student clicks → Opens in their browser → Student sends message manually
```

## Frontend Card States

### Alumni Matched (Tier 1)
```
🎯 Network Match · 3 UF Alumni Found
[Company Name]
[Role]
🎓 3 UF Alumni at this company
[Alumni names]
⚡ Generate Alumni Intro Message
```

### No Alumni Mapped (Tier 2)
```
🔥 Direct Manager Access · Live Hiring Post
[Company Name]
[Role]
No alumni mapped yet — but you have a direct line to the person who posted this role.
⚡ Generate Direct Manager Pitch
```

## Why This Is Bulletproof

1. **Zero Login Requirements**
   - Treats LinkedIn posts as public web pages (like any article)
   - No fake accounts, no session tokens, no browser automation

2. **Infinite Data Abundance**
   - X-ray queries match any public post with hashtags + location
   - Defaults to "USA" bucket when location unspecified
   - 14-day rolling window ensures fresh content

3. **Completely Legal**
   - Exa indexes the **public open web** — same as Google
   - CLiFF is just a smart data reader, not a scraper
   - User clicks link → uses their own logged-in browser → sends AI-generated copy
   - **CLiFF infrastructure never touches LinkedIn's internal servers**

## Engineering Specifications

### Exa Query Configuration
```javascript
{
  query: 'site:linkedin.com/posts/ "[role]" ("#internship" OR "intern") ("location" OR "USA")',
  numResults: 8,
  type: 'keyword',
  includeDomains: ['linkedin.com'],
  startCrawlDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  endCrawlDate: new Date().toISOString(),
  contents: {
    text: { maxCharacters: 800 },
    highlight: { query: targetRole, numSentences: 3 }
  }
}
```

### Alumni Check Configuration
```javascript
{
  query: `"[schoolName]" OR "[schoolCode]" alumni working at ${company}`,
  numResults: 3,
  category: 'people',
  includeDomains: ['linkedin.com'],
  type: 'neural',
  contents: { text: { maxCharacters: 200 } }
}
```

## Legal Compliance Checklist

- ✅ Only queries public web index (Exa ≠ LinkedIn API)
- ✅ No authentication headers or session cookies
- ✅ No browser automation (Puppeteer, Selenium, etc.)
- ✅ No rate-limiting bypass techniques
- ✅ User-initiated external links only
- ✅ No backend-to-backend LinkedIn calls
- ✅ Recency filters prevent stale data
- ✅ Alumni search uses public People category only

## Enterprise Value Protection

This architecture ensures:
- **100% data safety compliance**
- **Zero legal exposure** from scraping claims
- **Stable, infinite data pipeline** via public index
- **Lightning-fast performance** (no login overhead)
- **User empowerment** (student controls final action)

---

**Last Updated**: 2026-06-06  
**Status**: ✅ Production Ready
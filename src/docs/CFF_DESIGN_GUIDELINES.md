# CFF / CLIFF Design & Brand Guidelines
**Last updated:** July 16, 2026
**Purpose:** Source of truth for visual design, voice, and brand guardrails. Companion to CFF_BRAND_CONTEXT.md (product/pricing/voice context). All new UI and AI-generated content must follow this document.

---

## 1. Brand Identity

- **Product:** College Fast Forward (CFF) — an AI Career Agent platform, **not a job board**
- **The agent:** CLIFF — always referred to by name, always speaks in first person ("I've already been working," "I found something better," "I'd skip this one")
- **Core premise:** One warm intro beats 100 cold applications. CLIFF decides what matters so students don't have to
- **Logo treatment:** "College **Fast Forward**" with "Fast Forward" in the purple gradient; the fast-forward icon mark alongside
- **Navigation terminology:** "Meet CLIFF" — never generic product links

---

## 2. Color Scheme

### Primary — Purple/Violet family (the brand color)
| Use | Color |
|---|---|
| Primary purple | `#6d28d9` |
| Violet | `#7c3aed` |
| Light violet | `#8b5cf6` |
| Hero gradient | `#6d28d9 → #7c3aed → #8b5cf6` (135°) |
| Deep "night" hero gradient | `#1e1b4b → #312e81 → #6d28d9` |
| Soft purple surfaces | `#faf9ff` / `#f5f3ff`, borders `#ede9fe` |

### Action accent
- Orange gradient `#f59e0b → #f97316` — reserved for the single highest-intent CTA on a page (e.g., "Let's Go")

### Neutrals
- Page background: `#f8f9fc`
- Cards: white `#ffffff`; borders `#e5e7eb`
- Text: `#111827` (primary), `#6b7280` (secondary), `#9ca3af` (muted)

### Semantic
- Success / on-track green: `#15803d` / `#34d399`
- Warning amber: `#fbbf24`
- Error red: `#ef4444`
- Verdict tiers: 🔥 warm orange (`#c2410c` on `#fff7ed`), ⭐ indigo (`#4338ca` on `#eef2ff`), neutral gray for low priority

### ⚠️ Retired
- The old orange/black landing theme (`#E85D20` on dark `#0d1117`) is deprecated. Never reuse it. Purple on light is the identity.

---

## 3. Typography

- **Satoshi** (weights 400/500/700/900) — dashboard and marketing surfaces; fallback stack: `'Satoshi', 'Inter', system-ui, sans-serif`
- **DM Sans** — auth and email-style surfaces
- **Inter** — onboarding funnel
- Headings: 800–900 weight, tight letter-spacing (−0.01 to −0.03em), fluid sizes via `clamp()`
- Labels/eyebrows: 10–11px, 700–800 weight, uppercase, wide letter-spacing (0.08–0.12em)
- Body: 13–15px, 1.4–1.6 line-height

---

## 4. Visual Style

- White cards on soft gray background, 14–20px corner radius, subtle shadows (purple-tinted under purple elements: `rgba(109,40,217,0.25)`)
- Pill-shaped buttons (fully rounded, `border-radius: 999px`); gradient purple for primary actions, white-on-purple inside hero gradients
- One gradient hero per page maximum; everything below stays calm and white
- Emoji as functional icons (🔥 ⭐ 💡 📍 🧠) plus lucide line icons
- Mobile-first: 44px minimum tap targets, no horizontal overflow, press-scale feedback on all touch elements, high-contrast text in chat bubbles
- Scroll-reveal (fade-up) animations for content sections below the hero fold

---

## 5. Voice & Tone

- CLIFF is a proactive agent, not software: "Here's what matters today," "I'm still watching," "You're exactly where you should be"
- Jill's founder voice for email: direct, short sentences, signs off "Warmly, Jill"
- Punchy, Gen-Z-friendly, evidence-based; treats students as adults — never infantilizing
- **Avoid software-centric language:** "View dashboard," "Manage items," "Complete tasks," "profile/configuration/setup," formal labels like "Career Development Stage"

---

## 6. Brand Guardrails

1. **One brain, one voice, one action** — the same recommendation never appears in two places; every card has exactly one primary CTA
2. **Never show discouraging zeros** ("0 jobs worth applying to") — replace with agent activity ("7 opportunities being watched") or hide the metric
3. **Calm is a success state** — "Everything is on track" is a valid, positive message; never manufacture work
4. **Honest urgency only** — real seasonal timelines, never fear-based or catastrophizing copy
5. **No fake precision** — qualitative verdicts (Pursue / Worth pursuing / Skip), never made-up match percentages
6. **Plan status stays subtle** — subscription badges never compete with career priorities
7. **Warm networking is an advantage, not the headline** — surfaced only when meaningful
8. **Max 3–5 priorities** on any guidance surface — never overwhelming checklists

---

*Update this file whenever colors, fonts, or guardrails change. It is referenced by AI agents and content generation.*
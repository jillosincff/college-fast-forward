# Magic Moment — Quick Test Matrix

Automated checks (Playwright) for the Magic Moment free cycle, covering all
four artifacts, the soft wall, and the API response contract.

## What it covers

**E2E (`e2e.spec.js`)**
1. Full cycle renders all four artifacts (job, resume, alumni, outreach) — no empty blocks.
2. Outreach draft is non-empty and rejects banned phrases (`fellow student`, `go gators`).
3. Copy shows a confirmation (the `outreach_copied` signal).
4. No-resume path still shows a resume artifact (starter/profile).
5. No-alumni path shows the fallback, not an empty state.
6. After the free cycle, a second attempt shows the soft wall with **Upgrade to Pro** and **Ask a parent to unlock**.

**API (`api.spec.js`)**
- `getLiveJobMatchesFn` → non-empty job array with required fields.
- `findWorkspaceConnections` → `connections[]` or `upgrade_required`.
- `generateOutreachDraft` → non-empty message, no banned phrases.
- After `completeMagicMoment`, a second `generateOutreachDraft` returns `upgrade_required: true`.

**Fixtures (`seed.spec.js`)**
- Upserts known alumni at the fixture company for the test school.
- Guarantees a zero-alumni company.

## Data-testids

`mm-free-cycle-pill`, `mm-job`, `mm-resume`, `mm-alumni`, `mm-alumni-list`,
`mm-alumni-fallback`, `mm-outreach-draft`, `mm-copy-send`, `mm-copy-confirmation`,
`soft-wall-modal`, `soft-wall-upgrade`, `cta-upgrade`, `cta-parent`.

## Fixture accounts

Create these once in the platform (same school as the seeded alumni):
- admin, user (with resume), no-resume, zero-alumni, api.

Configure credentials as CI secrets (`MM_*`) or a local `.env`.

## Running

```bash
npx playwright install --with-deps chromium
# critical subset (PR gate)
APP_BASE_URL=https://your-app.base44.app npx playwright test --grep critical
# full matrix (nightly)
APP_BASE_URL=https://your-app.base44.app npx playwright test
```

## CI workflows
The workflow files live in `tests/magic-moment/ci/` as reference copies because the
Base44 GitHub sync app can't write to `.github/workflows/`. Copy them into
`.github/workflows/` to activate:
- `magic-moment-pr.yml` → runs the `--grep critical` subset on PRs.
- `magic-moment-nightly.yml` → runs the full matrix on a daily cron.

## Notes
- Tests run serially (`workers: 1`) because each Magic Moment cycle mutates per-user state.
- Draft **tone** remains manual sample review — not asserted here.
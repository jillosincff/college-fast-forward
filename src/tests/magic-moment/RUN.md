# Run the Magic Moment tests on your laptop

## Before you start
- Install **Node.js 20+** from https://nodejs.org (if you don't have it).
- You need a local copy of this app's code (your GitHub repo). If you don't have
  it cloned yet, ask whoever set up your GitHub connection for the repo link,
  then run `git clone <repo>` in a terminal.

## Step 1 — Open a terminal in the project folder
```bash
cd path/to/your-app
```

## Step 2 — Create the 4 student test accounts (one-time)
Sign up 4 students in your live app (at your APP_BASE_URL). Use real emails you
control and simple passwords. All 4 must pick the **same school** (UF by default)
during onboarding so they match the seeded alumni.

| Account | What makes it different |
|---|---|
| User (with resume) | Upload a resume file during onboarding |
| No-resume | Skip the resume step |
| Zero-alumni | Any school is fine — we only need its login to prove the fallback |
| API | Any school — used only for backend calls |

Also note your **admin** email + password (the owner account you already use).

## Step 3 — Fill in the env file
```bash
cp tests/magic-moment/.env.example tests/magic-moment/.env
```
Open `tests/magic-moment/.env` and paste in the 5 emails + passwords + your app URL.

## Step 4 — Install + run (critical subset)
```bash
npm ci
npx playwright install --with-deps chromium
npx playwright test --grep critical
```

The first two commands run once. The third is what you'll run every time.

## What you'll see
A list of green checkmarks (pass) or red x's (fail) with a short reason. On
failure, Playwright saves a screenshot + trace in `playwright-report/` — open
`playwright-report/index.html` in your browser to see exactly what broke.

## Troubleshooting
- **"Missing credentials for X"** → you left a blank in `.env`.
- **Login step times out** → the email/password form wording may differ; tell
  me what your GatorAuth sign-in button says and I'll adjust the test selector.
- **Timeout during Magic Moment** → the job-feed API was slow; just re-run.
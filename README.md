# Playwright TypeScript QA Lab

A multi-layer test automation framework built with Playwright and TypeScript, covering API, database, UI, and integration testing. The project targets the **Users module** of a Supabase-backed application and is wired to a GitHub Actions CI pipeline that publishes live Monocart reports to GitHub Pages on every run.

---

## What's Inside

| Layer | File | What it covers |
|---|---|---|
| API | `tests/api/users.spec.ts` | `GET /users` returns 200 and a valid JSON array |
| API + DB | `tests/api/users.integration.spec.ts` | API row count matches the database row count |
| Database | `tests/db/users.db.spec.ts` | Table has records, required fields exist, no null emails |
| UI | `tests/ui/users.ui.spec.ts` | QA Lab heading renders on the user list page |

---

## Project Structure

```
playwright_typescript_qa_lab/
├── .github/
│   └── workflows/
│       └── playwright.yml      # CI pipeline
├── tests/
│   ├── api/
│   │   ├── users.spec.ts               # API tests
│   │   └── users.integration.spec.ts   # API + DB integration tests
│   ├── db/
│   │   └── users.db.spec.ts            # Database tests
│   └── ui/
│       └── users.ui.spec.ts            # UI tests
├── utils/
│   └── dbClient.ts             # PostgreSQL query helper
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env                        # Local environment variables (not committed)
```

---

## Requirements

- Node.js (LTS)
- A Supabase project with a `users` table
- A PostgreSQL connection string (direct database access)

---

## Setup

**1. Clone the repository**

```bash
git clone https://github.com/cng07/playwright_typescript_qa_lab.git
cd playwright_typescript_qa_lab
```

**2. Install dependencies**

```bash
npm ci
```

**3. Install Playwright browsers**

```bash
npx playwright install --with-deps
```

**4. Configure environment variables**

Create a `.env` file at the root of the project:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-supabase-anon-key
DB_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
BASE_URL=https://your-app-url.com
```

> `BASE_URL_DEV`, `BASE_URL_STAGING`, and `BASE_URL_PROD` are also supported if you need per-environment URLs. Set `TEST_ENV` to `dev`, `staging`, or `prod` to activate them.

---

## Running Tests

**Run all tests**

```bash
npx playwright test
```

**Run a specific layer**

```bash
npx playwright test tests/api
npx playwright test tests/db
npx playwright test tests/ui
```

**Run by tag**

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

**Control workers and retries**

```bash
npx playwright test --workers=4 --retries=2
```

---

## Test Reports

Three reporters are active by default:

| Reporter | Output | Purpose |
|---|---|---|
| Monocart | `monocart-report/index.html` | Dashboard with charts and trend tracking |
| HTML | `playwright-report/` | Playwright's built-in visual report |
| JUnit | `results.xml` | CI integration (dorny/test-reporter) |
| JSON | `results.json` | Used to generate the GitHub Actions step summary |

Open the Monocart report locally:

```bash
open monocart-report/index.html
```

The live report from the latest CI run is published to **GitHub Pages** and automatically updated on every push to `main`.

---

## CI Pipeline

The workflow at `.github/workflows/playwright.yml` runs on:

- Every push to `main`
- Every pull request
- Manual trigger via **workflow_dispatch**

### Manual Trigger Options

When running manually from the GitHub Actions tab, the following inputs are available:

| Input | Default | Description |
|---|---|---|
| `test_type` | `all` | `all`, `api`, `db`, `ui`, or comma-separated e.g. `api,db` |
| `tag` | *(none)* | Optional Playwright tag filter e.g. `@smoke` |
| `workers` | `3` | Number of parallel workers |
| `retries` | `1` | Number of retries on failure |

### Pipeline Steps

1. Checkout code
2. Set up Node.js (LTS)
3. Install dependencies (`npm ci`)
4. Install Playwright browsers
5. Run tests based on selected inputs
6. Publish JUnit results via `dorny/test-reporter`
7. Generate a pass/fail summary in the GitHub Actions job summary
8. Upload HTML and Monocart reports as artifacts (retained for 30 days)
9. Deploy the Monocart report to GitHub Pages

---

## Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Base URL of your Supabase project |
| `SUPABASE_API_KEY` | Yes | Supabase anon/service key |
| `DB_URL` | Yes | PostgreSQL connection string for direct DB access |
| `BASE_URL` | Yes | Application base URL used by UI tests |
| `BASE_URL_DEV` | No | Dev environment URL |
| `BASE_URL_STAGING` | No | Staging environment URL |
| `BASE_URL_PROD` | No | Production environment URL |
| `TEST_ENV` | No | Active environment: `dev`, `staging`, `prod` (default: `dev`) |
| `PW_WORKERS` | No | Override the number of parallel workers |
| `PW_RETRIES` | No | Override the number of test retries |

In CI, all secrets are stored as **GitHub Actions Secrets** and injected at runtime.

---

## License

[ISC](LICENSE)
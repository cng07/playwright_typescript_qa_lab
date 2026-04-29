# Playwright TypeScript QA Lab

A multi-layer Playwright + TypeScript test automation lab for a Supabase-backed `users` module. The suite covers API, database, UI, and API-to-database integration scenarios, with GitHub Actions publishing Monocart reports to GitHub Pages after each run.

## What's Covered

| Layer | Location | Coverage |
|---|---|---|
| API | `tests/api/users/` | CRUD, negative, and API helper-based tests for the `users` endpoint |
| Database | `tests/db/users/` | Schema, constraints, indexes, CRUD, and factory-driven DB checks |
| UI | `tests/ui/users/` | Basic user page validation through Playwright browser tests |
| Integration | `tests/api/users/integration.spec.ts` | API and DB consistency checks for the `users` module |

## Project Structure

```text
playwright_typescript_qa_lab/
|-- .github/
|   `-- workflows/
|       `-- playwright.yml
|-- scripts/
|   `-- trim-trend.js
|-- tests/
|   |-- api/
|   |   `-- users/
|   |       |-- api.spec.ts
|   |       |-- delete.spec.ts
|   |       |-- get.spec.ts
|   |       |-- integration.spec.ts
|   |       |-- negative.spec.ts
|   |       |-- patch.spec.ts
|   |       `-- post.spec.ts
|   |-- db/
|   |   `-- users/
|   |       |-- constraints.spec.ts
|   |       |-- crud.spec.ts
|   |       |-- crudFactory.spec.ts
|   |       |-- db.spec.ts
|   |       |-- indexes.spec.ts
|   |       `-- schema.spec.ts
|   `-- ui/
|       `-- users/
|           `-- ui.spec.ts
|-- trend-data/
|-- utils/
|   |-- apiClient.ts
|   |-- dbClient.ts
|   `-- factories/
|       `-- userFactory.ts
|-- package.json
|-- playwright.config.ts
|-- README.md
`-- tsconfig.json
```

## Requirements

- Node.js LTS
- A Supabase project with a `users` table
- A PostgreSQL connection string with direct access to that database

## Setup

```bash
git clone https://github.com/cng07/playwright_typescript_qa_lab.git
cd playwright_typescript_qa_lab
npm ci
npx playwright install --with-deps
```

Create `.env` in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_API_KEY=your-supabase-key
DB_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
BASE_URL=https://your-app-url.com
```

Optional environment-specific URLs are supported:

```env
BASE_URL_DEV=https://dev.example.com
BASE_URL_STAGING=https://staging.example.com
BASE_URL_PROD=https://prod.example.com
TEST_ENV=dev
PW_WORKERS=4
PW_RETRIES=1
```

`TEST_ENV` selects `BASE_URL_DEV`, `BASE_URL_STAGING`, or `BASE_URL_PROD`. If no environment-specific URL matches, Playwright falls back to `BASE_URL`.

## Running Tests

Run the full suite:

```bash
npm test
```

Run a single layer:

```bash
npx playwright test tests/api
npx playwright test tests/db
npx playwright test tests/ui
```

Run by tag:

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

Control workers and retries:

```bash
npx playwright test --workers=4 --retries=2
```

The config excludes `@excluded` tests by default via `grepInvert`. To execute those scenarios, temporarily remove or adjust `grepInvert` in `playwright.config.ts`.

After each `npm test` run, the `posttest` script trims persisted trend history to keep the Monocart trend file bounded.

## Reports

Configured reporters:

| Reporter | Output | Purpose |
|---|---|---|
| HTML | `playwright-report/` | Playwright's built-in visual report |
| JUnit | `results.xml` | CI test result publishing |
| JSON | `results.json` | GitHub Actions summary data |
| Monocart | `test-results/report.html` | Rich dashboard with embedded assets and trend history |

Trend history is stored in `trend-data/trend.json` so it survives Playwright's cleanup of `test-results/`.

To open the Monocart report locally, open `test-results/report.html` in a browser.

## CI Pipeline

`.github/workflows/playwright.yml` runs on:

- Pushes to `main`
- Pull requests
- Manual `workflow_dispatch`

Manual workflow inputs:

| Input | Default | Description |
|---|---|---|
| `test_type` | `all` | `all`, `api`, `db`, `ui`, or comma-separated combinations like `api,db` |
| `tag` | empty | Optional Playwright tag filter such as `@smoke` |
| `workers` | `3` | Number of Playwright workers |
| `retries` | `1` | Number of Playwright retries |

Pipeline flow:

1. Check out the repository.
2. Restore cached trend data.
3. Install Node.js dependencies and Playwright browsers.
4. Run the selected tests with optional tag, worker, and retry inputs.
5. Publish JUnit results with `dorny/test-reporter`.
6. Generate a GitHub Actions job summary from `results.json`.
7. Save updated trend data.
8. Upload HTML and Monocart artifacts.
9. Publish the Monocart report to `gh-pages`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes | Base URL for Supabase REST calls |
| `SUPABASE_API_KEY` | Yes | Supabase API key used by API tests/helpers |
| `DB_URL` | Yes | PostgreSQL connection string for direct DB access |
| `BASE_URL` | Yes for UI tests unless env-specific URL is used | Default application base URL |
| `BASE_URL_DEV` | No | Base URL used when `TEST_ENV=dev` |
| `BASE_URL_STAGING` | No | Base URL used when `TEST_ENV=staging` |
| `BASE_URL_PROD` | No | Base URL used when `TEST_ENV=prod` |
| `TEST_ENV` | No | Active environment selector, defaults to `dev` |
| `PW_WORKERS` | No | Overrides Playwright worker count |
| `PW_RETRIES` | No | Overrides Playwright retry count |
| `CI` | No | Enables CI-specific behavior such as headless mode and stricter checks |

In GitHub Actions, runtime values are injected through repository secrets.

## License

[ISC](LICENSE)

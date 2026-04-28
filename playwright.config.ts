import fs from 'fs';
import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const MONOCART_REPORT_FILE = './test-results/report.html';
const TREND_DATA_FILE = './trend-data/trend.json';
const MAX_TREND_RUNS = 5;

const selectedEnvironment = (process.env.TEST_ENV || 'dev').toLowerCase();

const baseUrls: Record<string, string | undefined> = {
  dev: process.env.BASE_URL_DEV,
  staging: process.env.BASE_URL_STAGING,
  prod: process.env.BASE_URL_PROD,
};

const baseURL = baseUrls[selectedEnvironment] || process.env.BASE_URL;

const readIntegerEnv = (name: string, fallback: number | undefined, minimum: number) => {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum ? parsed : fallback;
};

type TrendSummary = Record<string, unknown>;

type TrendPoint = {
  date: number;
  duration: number;
  summary: TrendSummary;
};

type TrendHistoryPoint = {
  date: number;
  duration: number;
  [key: string]: unknown;
};

type TrendSnapshot = TrendPoint & {
  trends?: TrendHistoryPoint[];
};

const isTrendSummary = (value: unknown): value is TrendSummary =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isTrendSnapshot = (value: unknown): value is TrendSnapshot => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const trendPoint = value as Partial<TrendSnapshot>;
  return (
    typeof trendPoint.date === 'number' &&
    Number.isFinite(trendPoint.date) &&
    typeof trendPoint.duration === 'number' &&
    Number.isFinite(trendPoint.duration) &&
    isTrendSummary(trendPoint.summary) &&
    (trendPoint.trends === undefined ||
      (Array.isArray(trendPoint.trends) && trendPoint.trends.every(isTrendHistoryPoint)))
  );
};

const isTrendHistoryPoint = (value: unknown): value is TrendHistoryPoint => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const trendPoint = value as Partial<TrendHistoryPoint>;
  return (
    typeof trendPoint.date === 'number' &&
    Number.isFinite(trendPoint.date) &&
    typeof trendPoint.duration === 'number' &&
    Number.isFinite(trendPoint.duration)
  );
};

const loadTrendSnapshot = (): TrendSnapshot | null => {
  try {
    const trendFilePath = path.resolve(TREND_DATA_FILE);
    if (!fs.existsSync(trendFilePath)) {
      return null;
    }

    const raw = fs.readFileSync(trendFilePath, 'utf8').trim();
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!isTrendSnapshot(parsed)) {
      return null;
    }

    const history = Array.isArray(parsed.trends) ? parsed.trends.filter(isTrendHistoryPoint) : [];

    return {
      ...parsed,
      trends: history.slice(-(MAX_TREND_RUNS - 1)),
    };
  } catch {
    // A bad trend file should never block the test run.
    return null;
  }
};

const persistTrendSnapshot = async (reportData: TrendSnapshot) => {
  const trendFilePath = path.resolve(TREND_DATA_FILE);
  const trendDirectory = path.dirname(trendFilePath);
  const history = Array.isArray(reportData.trends)
    ? reportData.trends.filter(isTrendHistoryPoint)
    : [];

  const snapshot: TrendSnapshot = {
    date: reportData.date,
    duration: reportData.duration,
    summary: reportData.summary,
    // reportData.trends already contains only historical points from earlier runs.
    trends: history.slice(-(MAX_TREND_RUNS - 1)),
  };

  const tempFilePath = `${trendFilePath}.tmp`;
  await fs.promises.mkdir(trendDirectory, { recursive: true });
  await fs.promises.writeFile(tempFilePath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await fs.promises.rm(trendFilePath, { force: true });
  await fs.promises.rename(tempFilePath, trendFilePath);
};

const workers = readIntegerEnv('PW_WORKERS', process.env.CI ? 4 : undefined, 1);
const retries = readIntegerEnv('PW_RETRIES', process.env.CI ? 1 : 2, 0);
const trendSnapshot = loadTrendSnapshot();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  grepInvert: /@excluded/,
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries,
  workers,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
    ['json', { outputFile: 'results.json' }],
    [
      'monocart-reporter',
      {
        name: 'QA Lab Automation Report - Users Module',
        outputFile: MONOCART_REPORT_FILE,
        charts: true,
        embedAssets: true,
        inline: true,
        // Store the trend input outside test-results because Playwright cleans that directory.
        trend: trendSnapshot,
        columns: (defaultColumns: string[]) => {
          const included = ['title', 'status', 'duration'];
          return defaultColumns.filter((col: string) => included.includes(col));
        },
        metadata: {
          project: 'QA Automation Lab',
          module: 'Users Service',
          environment: process.env.TEST_ENV || 'QA Environment',
          execution: process.env.CI ? 'GitHub Actions CI Pipeline' : 'Local Execution',
        },
        onEnd: async (reportData: TrendSnapshot) => {
          await persistTrendSnapshot(reportData);
        },
      },
    ],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

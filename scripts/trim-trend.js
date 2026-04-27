'use strict';

const fs = require('fs');
const path = require('path');

const MAX_RUNS = 5;
const trendFilePath = path.resolve(process.cwd(), 'trend-data', 'trend.json');
const tempFilePath = `${trendFilePath}.tmp`;
const lockFilePath = `${trendFilePath}.lock`;

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isTrendEntry = (value) =>
  isObject(value) &&
  typeof value.date === 'number' &&
  Number.isFinite(value.date) &&
  typeof value.duration === 'number' &&
  Number.isFinite(value.duration) &&
  isObject(value.summary);

const isTrendHistoryEntry = (value) =>
  isObject(value) &&
  typeof value.date === 'number' &&
  Number.isFinite(value.date) &&
  typeof value.duration === 'number' &&
  Number.isFinite(value.duration);

const readTrendFile = () => {
  if (!fs.existsSync(trendFilePath)) {
    return null;
  }

  const raw = fs.readFileSync(trendFilePath, 'utf8').trim();
  if (!raw) {
    return null;
  }

  return JSON.parse(raw);
};

const writeTrendFile = (trendData) => {
  fs.mkdirSync(path.dirname(trendFilePath), { recursive: true });
  fs.writeFileSync(tempFilePath, `${JSON.stringify(trendData, null, 2)}\n`, 'utf8');
  fs.rmSync(trendFilePath, { force: true });
  fs.renameSync(tempFilePath, trendFilePath);
};

const acquireLock = () => {
  try {
    const handle = fs.openSync(lockFilePath, 'wx');
    return () => {
      fs.closeSync(handle);
      fs.rmSync(lockFilePath, { force: true });
    };
  } catch {
    return null;
  }
};

const trimTrendFile = () => {
  const releaseLock = acquireLock();
  if (!releaseLock) {
    // Avoid clobbering the file if another run is normalizing it at the same time.
    return;
  }

  try {
    const trendData = readTrendFile();
    if (!isTrendEntry(trendData)) {
      return;
    }

    const history = Array.isArray(trendData.trends)
      ? trendData.trends.filter(isTrendHistoryEntry)
      : [];

    // The current run is stored on the root object, so only keep four older entries here.
    trendData.trends = history.slice(-(MAX_RUNS - 1));
    writeTrendFile(trendData);
  } catch {
    // Never fail the command after tests because of missing or corrupted trend history.
  } finally {
    releaseLock();
  }
};

trimTrendFile();

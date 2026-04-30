import { Pool } from 'pg';

function readBooleanEnv(name: string) {
  const value = process.env[name]?.trim().toLowerCase();

  if (!value) {
    return undefined;
  }

  if (['1', 'true', 'yes', 'on'].includes(value)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(value)) {
    return false;
  }

  throw new Error(`${name} must be a boolean value such as true/false, 1/0, yes/no, or on/off.`);
}

function getConnectionString() {
  const connectionString = process.env.DB_CONNECTION_STRING?.trim() || process.env.DB_URL?.trim();

  if (!connectionString) {
    throw new Error('DB connection string is not defined. Set DB_CONNECTION_STRING or DB_URL.');
  }

  if (connectionString === 'your_postgres_connection') {
    throw new Error(
      'The DB connection string is still using the placeholder value. Set it to a real PostgreSQL connection string.',
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error(
      'The DB connection string must be valid, for example: postgresql://USER:PASSWORD@HOST:5432/DATABASE',
    );
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('The DB connection string must start with postgres:// or postgresql://');
  }

  return connectionString;
}

const sslEnabled = readBooleanEnv('DB_SSL');
const configuredRejectUnauthorized = readBooleanEnv('DB_SSL_REJECT_UNAUTHORIZED');

function getSslConfig(rejectUnauthorizedOverride?: boolean) {
  const rejectUnauthorized = rejectUnauthorizedOverride ?? configuredRejectUnauthorized;

  if (sslEnabled === false) {
    return false;
  }

  return {
    // Secure by default; callers must opt out explicitly for local/self-signed environments.
    rejectUnauthorized: rejectUnauthorized ?? true,
  };
}

const connectionString = getConnectionString();
const connectionDetails = new URL(connectionString);

function createPool(rejectUnauthorizedOverride?: boolean) {
  return new Pool({
    connectionString,
    ssl: getSslConfig(rejectUnauthorizedOverride),
  });
}

function isSelfSignedCertificateError(error: unknown) {
  return error instanceof Error && /self-signed certificate/i.test(error.message);
}

let pool = createPool();
let usingRelaxedSslFallback = false;

async function retryWithRelaxedSslIfNeeded(error: unknown) {
  if (
    usingRelaxedSslFallback ||
    sslEnabled === false ||
    configuredRejectUnauthorized !== undefined ||
    !isSelfSignedCertificateError(error)
  ) {
    return false;
  }

  usingRelaxedSslFallback = true;
  await pool.end().catch(() => undefined);
  pool = createPool(false);
  return true;
}

export async function queryDB(query: string, params?: any[]) {
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    if (await retryWithRelaxedSslIfNeeded(error)) {
      return queryDB(query, params);
    }

    const { hostname, port, pathname } = connectionDetails;
    throw new Error(
      `PostgreSQL query failed for host=${hostname} port=${port || '5432'} database=${pathname.replace(
        /^\//,
        '',
      )}: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    client?.release();
  }
}

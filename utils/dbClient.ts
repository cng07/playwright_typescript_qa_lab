import { Pool } from 'pg';

function getConnectionString() {
  const connectionString =
    process.env.DB_CONNECTION_STRING?.trim() || process.env.DB_URL?.trim();

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

const connectionString = getConnectionString();

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function queryDB(query: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    const { hostname, port, pathname } = new URL(connectionString);
    throw new Error(
      `PostgreSQL query failed for host=${hostname} port=${port || '5432'} database=${pathname.replace(
        /^\//,
        '',
      )}: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    client.release();
  }
}

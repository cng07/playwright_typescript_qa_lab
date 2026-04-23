import { Client } from 'pg';

function getConnectionString() {
  const connectionString = process.env.DB_URL?.trim();

  if (!connectionString) {
    throw new Error('DB_URL is not defined');
  }

  if (connectionString === 'your_postgres_connection') {
    throw new Error(
      'DB_URL is still using the placeholder value. Set it to a real PostgreSQL connection string.'
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(connectionString);
  } catch {
    throw new Error(
      'DB_URL must be a valid PostgreSQL connection string, for example: postgresql://USER:PASSWORD@HOST:5432/DATABASE'
    );
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
    throw new Error('DB_URL must start with postgres:// or postgresql://');
  }

  return connectionString;
}

export async function queryDB(query: string) {
  const connectionString = getConnectionString();

  const client = new Client({
    connectionString,
  });

  await client.connect();

  try {
    const res = await client.query(query);
    return res.rows;
  } finally {
    await client.end();
  }
}

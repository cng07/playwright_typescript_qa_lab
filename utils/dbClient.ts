import { Client } from 'pg';

export async function queryDB(query: string) {
  const connectionString = process.env.DB_URL;

  if (!connectionString) {
    throw new Error('DB_URL is not defined');
  }

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

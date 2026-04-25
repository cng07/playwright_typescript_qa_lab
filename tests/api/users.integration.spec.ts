import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('API + DB - Users', () => {
  test('Integration: Users API row count matches users table row count @regression', async ({ request }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseApiKey = process.env.SUPABASE_API_KEY;

  expect(supabaseUrl, 'SUPABASE_URL must be defined').toBeTruthy();
  expect(supabaseApiKey, 'SUPABASE_API_KEY must be defined').toBeTruthy();

    const apiRes = await request.get(`${supabaseUrl}/rest/v1/users`, {
      headers: {
        apikey: supabaseApiKey!,
        Authorization: `Bearer ${supabaseApiKey!}`,
      },
    });

    expect(apiRes.status()).toBe(200);
    expect(apiRes.headers()['content-type'] || '').toContain('application/json');

    const apiData = await apiRes.json();

    const dbData = await queryDB('SELECT * FROM users');

    expect(apiData.length).toBe(dbData.length);
  });
});

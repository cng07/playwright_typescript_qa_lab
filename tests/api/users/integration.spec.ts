import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';
import { queryDB } from '../../../utils/dbClient';

test.describe('API + DB - Users', () => {
  test.describe.configure({ mode: 'serial' });
  test('Integration: Users API row count matches users table row count @excluded', async ({
    request,
  }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseApiKey = process.env.SUPABASE_API_KEY;

    expect(supabaseUrl, 'SUPABASE_URL must be defined').toBeTruthy();
    expect(supabaseApiKey, 'SUPABASE_API_KEY must be defined').toBeTruthy();

    // const apiRes = await request.get(`${supabaseUrl}/rest/v1/users`, {
    //   headers: {
    //     apikey: supabaseApiKey!,
    //     Authorization: `Bearer ${supabaseApiKey!}`,
    //   },
    // });
    const apiRes = await apiRequest(request, 'get', '/rest/v1/users');

    expect(apiRes.status()).toBe(200);
    expect(apiRes.headers()['content-type'] || '').toContain('application/json');

    const apiData = await apiRes.json();

    const dbData = await queryDB('SELECT * FROM users');

    expect(apiData.length).toBe(dbData.length);
  });

  test('Integration: API matches DB for created user', async ({ request }) => {
    const email = `test_${Date.now()}@mail.com`;

    // CREATE
    await apiRequest(request, 'post', '/rest/v1/users', {
      data: {
        email,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      },
    });

    // VERIFY with polling
    await expect
      .poll(async () => {
        const apiRes = await apiRequest(request, 'get', `/rest/v1/users?email=eq.${email}`);
        const apiData = await apiRes.json();

        const dbData = await queryDB(`SELECT * FROM users WHERE email='${email}'`);

        return {
          api: apiData.length,
          db: dbData.length,
        };
      })
      .toEqual({ api: 1, db: 1 });

    // CLEANUP
    await apiRequest(request, 'delete', `/rest/v1/users?email=eq.${email}`);
  });
});

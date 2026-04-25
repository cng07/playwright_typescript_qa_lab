import { test, expect } from '@playwright/test';

test.describe('API - Users', () => {
  test('API: GET /users returns 200 and a valid JSON array @smoke @regression', async ({ request }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseApiKey = process.env.SUPABASE_API_KEY;

  expect(supabaseUrl, 'SUPABASE_URL must be defined').toBeTruthy();
  expect(supabaseApiKey, 'SUPABASE_API_KEY must be defined').toBeTruthy();

    const res = await request.get(`${supabaseUrl}/rest/v1/users`, {
      headers: {
        apikey: supabaseApiKey!,
        Authorization: `Bearer ${supabaseApiKey!}`,
      },
    });
    const contentType = res.headers()['content-type'] || '';
    const bodyText = await res.text();

    expect(res.status()).toBe(200);
    expect(contentType).toContain('application/json');

    const data = JSON.parse(bodyText);
    expect(Array.isArray(data)).toBe(true);
  });
});

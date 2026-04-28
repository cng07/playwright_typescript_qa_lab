import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';

test.describe('API - Users GET @api @api_get', () => {
  test('API: GET - Users should return 200 and array', async ({ request }) => {
    const res = await apiRequest(request, 'get', '/rest/v1/users');

    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('API: GET - Users should return valid schema', async ({ request }) => {
    const res = await apiRequest(request, 'get', '/rest/v1/users?limit=1');

    const [user] = await res.json();

    expect(user).toMatchObject({
      id: expect.any(String),
      first_name: expect.any(String),
      last_name: expect.any(String),
      email: expect.any(String),
      created_at: expect.any(String),
      nationality: expect.any(String),
      role: expect.any(String),
    });
  });

  test('API: GET - Users with filter should return correct results', async ({ request }) => {
    const res = await apiRequest(request, 'get', '/rest/v1/users?role=eq.Member');

    const data = await res.json();

    data.forEach((user: any) => {
      expect(user.role).toBe('Member');
    });
  });
});

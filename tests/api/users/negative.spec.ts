import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';

test.describe('API - Users NEGATIVE @api @api_negative', () => {
  let createdEmails: string[] = [];

  test.afterEach(async ({ request }) => {
    // cleanup ALL emails created during test
    for (const email of createdEmails) {
      await apiRequest(request, 'delete', `/rest/v1/users?email=eq.${email}`);
    }

    createdEmails = [];
  });

  test('API: POST should fail with missing required fields', async ({ request }) => {
    const res = await apiRequest(request, 'post', '/rest/v1/users', {
      data: {
        first_name: 'OnlyName',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test('API: POST invalid email (cleanup if inserted)', async ({ request }) => {
    const invalidEmail = 'invalid-email';

    let createdId: string | null = null;

    const res = await apiRequest(request, 'post', '/rest/v1/users', {
      data: {
        first_name: 'Bad',
        last_name: 'Email',
        email: invalidEmail,
        nationality: 'Filipino',
        role: 'Member',
      },
      headers: { Prefer: 'return=representation' },
    });

    expect([201, 400]).toContain(res.status());

    // If inserted → capture ID
    if (res.status() === 201) {
      const body = await res.json();
      createdId = body?.[0]?.id;

      if (createdId) {
        await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${createdId}`);
      }
    }
  });

  test('API: POST invalid role (cleanup if inserted)', async ({ request }) => {
    const email = `badrole_${Date.now()}@mail.com`;
    createdEmails.push(email);

    const res = await apiRequest(request, 'post', '/rest/v1/users', {
      data: {
        first_name: 'Bad',
        last_name: 'Role',
        email,
        nationality: 'Filipino',
        role: 'SuperAdmin', // invalid
      },
      headers: { Prefer: 'return=representation' },
    });

    expect([201, 400]).toContain(res.status());
  });

  test('API: PATCH non-existent user should not crash', async ({ request }) => {
    const res = await apiRequest(
      request,
      'patch',
      `/rest/v1/users?email=eq.nonexistent_${Date.now()}@mail.com`,
      {
        data: { role: 'Admin' },
      },
    );

    expect([200, 204]).toContain(res.status());
  });

  test('API: DELETE non-existent user should not fail', async ({ request }) => {
    const res = await apiRequest(
      request,
      'delete',
      `/rest/v1/users?email=eq.nonexistent_${Date.now()}@mail.com`,
    );

    expect([200, 204]).toContain(res.status());
  });

  test('API: Unauthorized request should fail', async ({ request }) => {
    const supabaseUrl = process.env.SUPABASE_URL!;

    const res = await request.get(`${supabaseUrl}/rest/v1/users`);

    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test('API: Invalid endpoint should return 404', async ({ request }) => {
    const res = await apiRequest(request, 'get', '/rest/v1/nonexistent');

    expect(res.status()).toBe(404);
  });
});

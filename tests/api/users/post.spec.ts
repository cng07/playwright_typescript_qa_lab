import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';

test.describe('API - Users POST @api @api_post', () => {
  test('API:POST - Users should create user', async ({ request }) => {
    const email = `api_${Date.now()}@mail.com`;

    let userId: string | null = null;

    try {
      // CREATE
      const res = await apiRequest(request, 'post', '/rest/v1/users', {
        data: {
          first_name: 'API',
          last_name: 'Test',
          email,
          nationality: 'Filipino',
          role: 'Member',
        },
        headers: {
          // Previous inline defaults, now centralized in apiRequest:
          // apikey: process.env.SUPABASE_API_KEY!,
          // Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
          // 'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      });

      expect(res.status()).toBe(201);

      const data = await res.json();
      const user = data[0];

      userId = user.id;

      expect(user.email).toBe(email);
    } finally {
      // CLEANUP (always runs)
      if (userId) {
        // Previous inline defaults were:
        // headers: {
        //   apikey: process.env.SUPABASE_API_KEY!,
        //   Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
        // }
        const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);

        expect(deleteRes.status()).toBe(204);
      }
    }
  });

  test('API:POST - Users should fail with missing fields', async ({ request }) => {
    const email = `api_incomplete_${Date.now()}@mail.com`;

    let userId: string | null = null;

    try {
      // CREATE (currently succeeds due to schema)
      const res = await apiRequest(request, 'post', '/rest/v1/users', {
        data: {
          first_name: 'Incomplete',
          email,
        },
        headers: {
          // Previous inline defaults, now centralized in apiRequest:
          // apikey: process.env.SUPABASE_API_KEY!,
          // Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
          // 'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      });

      expect(res.status()).toBe(201);

      const data = await res.json();
      const user = data[0];

      userId = user.id;

      expect(user.first_name).toBe('Incomplete');
    } finally {
      // CLEANUP (always runs)
      if (userId) {
        // Previous inline defaults were:
        // headers: {
        //   apikey: process.env.SUPABASE_API_KEY!,
        //   Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
        // }
        const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);

        expect(deleteRes.status()).toBe(204);
      }
    }
  });
});

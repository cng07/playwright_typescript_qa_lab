import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';

test.describe('API - Users DELETE', () => {
  test('API: DELETE - Users should remove user', async ({ request }) => {
    const email = `delete_${Date.now()}@mail.com`;

    let userId: string | null = null;

    try {
      // CREATE
      const createRes = await apiRequest(request, 'post', '/rest/v1/users', {
        data: {
          first_name: 'Delete',
          last_name: 'Test',
          email,
          nationality: 'Filipino',
          role: 'Member',
        },
        headers: { Prefer: 'return=representation' },
      });

      expect(createRes.status()).toBe(201);

      const created = await createRes.json();
      userId = created[0].id;

      // DELETE
      const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);

      expect(deleteRes.status()).toBe(204);

      // VERIFY DELETION (optional but strong assertion)
      const verifyRes = await apiRequest(request, 'get', `/rest/v1/users?id=eq.${userId}`);

      expect(verifyRes.status()).toBe(200);

      const data = await verifyRes.json();
      expect(data.length).toBe(0);
    } finally {
      // SAFETY CLEANUP (in case DELETE test fails midway)
      if (userId) {
        await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);
      }
    }
  });
});

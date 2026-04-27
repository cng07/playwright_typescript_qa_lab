import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';

test.describe('API - Users PATCH', () => {
  test('API: PATCH - Users should update role', async ({ request }) => {
    const email = `patch_${Date.now()}@mail.com`;

    let userId: string | null = null;

    try {
      // CREATE
      const createRes = await apiRequest(request, 'post', '/rest/v1/users', {
        data: {
          first_name: 'Patch',
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

      // PATCH
      const patchRes = await apiRequest(request, 'patch', `/rest/v1/users?id=eq.${userId}`, {
        data: { role: 'Admin' },
        headers: { Prefer: 'return=representation' },
      });

      expect(patchRes.status()).toBe(200);

      const updated = await patchRes.json();
      expect(updated[0].role).toBe('Admin');
    } finally {
      // CLEANUP
      if (userId) {
        const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);

        expect(deleteRes.status()).toBe(204);
      }
    }
  });
});

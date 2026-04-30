import { test, expect } from '@playwright/test';
import { apiRequest } from '../../../utils/apiClient';
import { queryDB } from '../../../utils/dbClient';

test.describe('Integration: API + DB - User Full Lifecycle @integration', () => {
  test.describe.configure({ mode: 'serial' });

  test('Create → Read → Update → Delete user @integration', async ({ request }) => {
    const email = `test_${Date.now()}@mail.com`;

    // CREATE
    const createRes = await apiRequest(request, 'post', '/rest/v1/users', {
      data: {
        email,
        first_name: 'Initial',
        last_name: 'User',
        role: 'user',
      },
    });

    expect(createRes.status()).toBe(201);

    // VERIFY CREATE (API + DB)
    const apiCreateRes = await apiRequest(request, 'get', `/rest/v1/users?email=eq.${email}`);
    const apiUser = await apiCreateRes.json();

    const dbUser = await queryDB('SELECT * FROM users WHERE email = $1', [email]);

    expect(apiUser.length).toBe(1);
    expect(dbUser.length).toBe(1);

    const apiRecord = apiUser[0];
    const dbRecord = dbUser[0];

    // Field-level validation
    expect(apiRecord.email).toBe(dbRecord.email);
    expect(apiRecord.first_name).toBe(dbRecord.first_name);
    expect(apiRecord.role).toBe(dbRecord.role);

    // Server-generated fields
    expect(apiRecord.id).toBeTruthy();
    expect(dbRecord.id).toBeTruthy();

    const userId = apiRecord.id;

    // UPDATE
    const updateRes = await apiRequest(request, 'patch', `/rest/v1/users?id=eq.${userId}`, {
      data: {
        first_name: 'Updated',
        role: 'admin',
      },
    });

    expect(updateRes.status()).toBe(204);

    // VERIFY UPDATE (API + DB)
    const apiUpdatedRes = await apiRequest(request, 'get', `/rest/v1/users?id=eq.${userId}`);
    const apiUpdated = await apiUpdatedRes.json();

    const dbUpdated = await queryDB('SELECT * FROM users WHERE id = $1', [userId]);

    expect(apiUpdated.length).toBe(1);
    expect(dbUpdated.length).toBe(1);

    const apiUpdatedRecord = apiUpdated[0];
    const dbUpdatedRecord = dbUpdated[0];

    // Updated fields
    expect(apiUpdatedRecord.first_name).toBe('Updated');
    expect(dbUpdatedRecord.first_name).toBe('Updated');

    expect(apiUpdatedRecord.role).toBe('admin');
    expect(dbUpdatedRecord.role).toBe('admin');

    // Unchanged fields
    expect(apiUpdatedRecord.email).toBe(email);
    expect(dbUpdatedRecord.email).toBe(email);

    // DELETE
    const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);

    expect(deleteRes.status()).toBe(204);

    // VERIFY DELETE (API + DB)
    const apiAfterDeleteRes = await apiRequest(request, 'get', `/rest/v1/users?id=eq.${userId}`);
    const apiAfterDelete = await apiAfterDeleteRes.json();

    const dbAfterDelete = await queryDB('SELECT * FROM users WHERE id = $1', [userId]);

    expect(apiAfterDelete.length).toBe(0);
    expect(dbAfterDelete.length).toBe(0);
  });
});

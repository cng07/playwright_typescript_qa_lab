import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('DB - Users CRUD @db @db_crud', () => {
  let testUserEmail: string;

  test.beforeEach(async () => {
    // Generate unique email per test run
    testUserEmail = `testuser_${Date.now()}@mail.com`;

    await queryDB(`
            INSERT INTO users (id, first_name, last_name, email, nationality, role)
            VALUES (
                gen_random_uuid(),
                'Test',
                'User',
                '${testUserEmail}',
                'Filipino',
                'Member'
            )
        `);
  });

  test.afterEach(async () => {
    // Cleanup test data
    await queryDB(`
            DELETE FROM users 
            WHERE email = '${testUserEmail}'
        `);
  });

  test('CRUD: INSERT should create a new user', async () => {
    const result = await queryDB(`
            SELECT * FROM users 
            WHERE email = '${testUserEmail}'
        `);

    expect(result.length).toBe(1);

    const user = result[0];
    expect(user.email).toBe(testUserEmail);
    expect(user.first_name).toBe('Test');
    expect(user.role).toBe('Member');
  });

  test('CRUD: SELECT should retrieve correct user', async () => {
    const result = await queryDB(`
            SELECT first_name, last_name, email 
            FROM users 
            WHERE email = '${testUserEmail}'
        `);

    expect(result.length).toBe(1);
    expect(result[0]).toMatchObject({
      first_name: 'Test',
      last_name: 'User',
      email: testUserEmail,
    });
  });

  test('CRUD: UPDATE should modify user role', async () => {
    await queryDB(`
            UPDATE users
            SET role = 'Admin'
            WHERE email = '${testUserEmail}'
        `);

    const result = await queryDB(`
            SELECT role FROM users 
            WHERE email = '${testUserEmail}'
    `);

    expect(result[0].role).toBe('Admin');
  });

  test('CRUD: DELETE should remove user', async () => {
    await queryDB(`
            DELETE FROM users 
            WHERE email = '${testUserEmail}'
        `);

    const result = await queryDB(`
            SELECT * FROM users 
            WHERE email = '${testUserEmail}'
        `);

    expect(result.length).toBe(0);
  });
});

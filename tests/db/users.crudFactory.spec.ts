import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';
import { createTestUser, deleteTestUser } from '../../utils/factories/userFactory';

test.describe('DB - Users CRUD (Factory) @db @db_crudFactory', () => {
  let user: any;

  test.beforeEach(async () => {
    user = await createTestUser();
  });

  test.afterEach(async () => {
    await deleteTestUser(user.email);
  });

  test('CRUD: SELECT should retrieve user', async () => {
    const result = await queryDB(`
        SELECT * FROM users 
        WHERE email = '${user.email}'
    `);

    expect(result.length).toBe(1);
  });

  test('CRUD: UPDATE should modify role', async () => {
    await queryDB(`
      UPDATE users
      SET role = 'Admin'
      WHERE email = '${user.email}'
    `);

    const result = await queryDB(`
      SELECT role FROM users 
      WHERE email = '${user.email}'
    `);

    expect(result[0].role).toBe('Admin');
  });
});

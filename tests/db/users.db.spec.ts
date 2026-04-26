import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('DB - Users @db', () => {
  test('DB: Users table contains at least one record @smoke', async () => {
    const users = await queryDB('SELECT * FROM users');
    expect(users.length).toBeGreaterThan(0);
  });

  test('DB: Users table returns required profile fields @smoke @regression', async () => {
    const users = await queryDB('SELECT * FROM users LIMIT 1');

    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('first_name');
    expect(users[0]).toHaveProperty('last_name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('created_at');
    expect(users[0]).toHaveProperty('Nationality');
    expect(users[0]).toHaveProperty('Role');
  });

  test('DB: Users table should not contain null emails @smoke @regression', async () => {
    const users = await queryDB(`
      SELECT * 
      FROM users 
      WHERE email IS NULL`);

    expect(users.length).toBe(0);
  });

  test('DB: Users columns have correct data types', async () => {
    const [user] = await queryDB(`
      SELECT *
      FROM users 
      LIMIT 1
      `);

    expect(typeof user.first_name).toBe('string');
    expect(typeof user.last_name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.Nationality).toBe('string');
    expect(typeof user.Role).toBe('string');
    expect(typeof user.id).toBe('string');

    expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
  });

  test('DB: Column naming should remain consistent', async () => {
    const result = await queryDB(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `);

    const columns = result.map(c => c.column_name);

    expect(columns).toContain('first_name');
    expect(columns).toContain('last_name');
    expect(columns).toContain('email');
    expect(columns).toContain('created_at');
    expect(columns).toContain('Nationality');
    expect(columns).toContain('Role');
    expect(columns).toContain('id');
  });

  test('DB: Emails should be unique', async () => {
    const duplicates = await queryDB(`
    SELECT email, COUNT(*) 
    FROM users 
    GROUP BY email 
    HAVING COUNT(*) > 1
  `);

    expect(duplicates.length).toBe(0);
  });

  test('DB: IDs should be unique', async () => {
    const duplicates = await queryDB(`
    SELECT id, COUNT(*) 
    FROM users 
    GROUP BY id 
    HAVING COUNT(*) > 1
  `);

    expect(duplicates.length).toBe(0);
  });

  test('DB: Roles should be valid', async () => {
    const invalidRoles = await queryDB(`
    SELECT DISTINCT "Role" 
    FROM users 
    WHERE "Role" NOT IN ('Member', 'Admin', 'VIP')
  `);

    expect(invalidRoles.length).toBe(0);
  });

});

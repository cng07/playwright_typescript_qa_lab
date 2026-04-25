import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('DB - Users', () => {
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
    const users = await queryDB('SELECT * FROM users WHERE email IS NULL');

    expect(users.length).toBe(0);
  });
});

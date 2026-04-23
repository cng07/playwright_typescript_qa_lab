import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test('Verify users exist in DB', async () => {
  const users = await queryDB('SELECT * FROM users');
  expect(users.length).toBeGreaterThan(0);
});

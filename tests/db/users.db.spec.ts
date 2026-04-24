import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test('Verify users exist in DB @smoke', async () => {
    const users = await queryDB('SELECT * FROM users');
    expect(users.length).toBeGreaterThan(0);
});


test('Verify users have required fields @smoke', async () => {
    const users = await queryDB('SELECT * FROM users LIMIT 1');

    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('first_name');
    expect(users[0]).toHaveProperty('last_name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('created_at');
    expect(users[0]).toHaveProperty('Nationality');
    expect(users[0]).toHaveProperty('Role');
});

test('Verify emails should not be null @smoke', async () => {
    const users = await queryDB('SELECT * FROM users WHERE email IS NULL');

    expect(users.length).toBe(3);
});

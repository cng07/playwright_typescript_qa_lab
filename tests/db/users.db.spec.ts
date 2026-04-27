import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('DB - Users @db', () => {
  test('DB: Users table contains at least one record @smoke', async () => {
    const users = await queryDB(`
      SELECT * 
      FROM users
      `);

    expect(users.length).toBeGreaterThan(0);
  });

  test('DB: Users table returns required profile fields @smoke @regression', async () => {
    const users = await queryDB(`
      SELECT * 
      FROM users 
      LIMIT 1
      `);

    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('first_name');
    expect(users[0]).toHaveProperty('last_name');
    expect(users[0]).toHaveProperty('email');
    expect(users[0]).toHaveProperty('created_at');
    expect(users[0]).toHaveProperty('nationality');
    expect(users[0]).toHaveProperty('role');
  });

  test('DB: Users table should not contain null emails @smoke @regression', async () => {
    const users = await queryDB(`
      SELECT * 
      FROM users 
      WHERE email IS NULL
      `);

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
    expect(typeof user.nationality).toBe('string');
    expect(typeof user.role).toBe('string');
    expect(typeof user.id).toBe('string');

    expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
  });

  test('DB: Column naming should remain consistent', async () => {
    const result = await queryDB(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
    `);

    const columns = result.map((c) => c.column_name);

    expect(columns).toContain('first_name');
    expect(columns).toContain('last_name');
    expect(columns).toContain('email');
    expect(columns).toContain('created_at');
    expect(columns).toContain('nationality');
    expect(columns).toContain('role');
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
    SELECT DISTINCT "role" 
    FROM users 
    WHERE "role" NOT IN ('Member', 'Admin', 'VIP')
  `);

    expect(invalidRoles.length).toBe(0);
  });

  test('DB: Names should not be empty', async () => {
    const invalid = await queryDB(`
    SELECT * FROM users 
    WHERE first_name = '' OR last_name = ''
  `);

    expect(invalid.length).toBe(0);
  });

  test('DB: Emails should be valid format', async () => {
    const invalidEmails = await queryDB(`
    SELECT email FROM users
    WHERE email !~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
  `);

    expect(invalidEmails.length).toBe(0);
  });

  test('DB: created_at should not be in the future', async () => {
    const invalid = await queryDB(`
    SELECT * FROM users
    WHERE created_at > NOW()
  `);

    expect(invalid.length).toBe(0);
  });

  test('DB: created_at should not be null', async () => {
    const invalid = await queryDB(`
    SELECT * FROM users
    WHERE created_at IS NULL
  `);

    expect(invalid.length).toBe(0);
  });

  test('DB: No duplicate email', async () => {
    const duplicate = await queryDB(`
    SELECT email, COUNT(*)
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
  `);

    expect(duplicate.length).toBe(0);
  });

  test('DB: Filter users by role', async () => {
    const members = await queryDB(`
    SELECT * 
    FROM users 
    WHERE "role" = 'Member'
  `);

    members.forEach((user) => {
      expect(user.role).toBe('Member');
    });
  });

  test('DB: Users sorted by created_at DESC', async () => {
    const users = await queryDB(`
    SELECT * FROM users ORDER BY created_at DESC
  `);

    for (let i = 1; i < users.length; i++) {
      expect(new Date(users[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(
        new Date(users[i].created_at).getTime(),
      );
    }
  });

  test('DB: No critical null fields', async () => {
    const invalid = await queryDB(`
    SELECT * FROM users
    WHERE first_name IS NULL 
       OR last_name IS NULL
       OR email IS NULL
  `);

    expect(invalid.length).toBe(0);
  });

  test('DB: Email column should be indexed', async () => {
    const indexes = await queryDB(`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'users'
  `);

    const hasEmailIndex = indexes.some((i) => i.indexname.includes('email'));
    expect(hasEmailIndex).toBe(true);
  });
});

import { test, expect } from '@playwright/test';
import { queryDB } from '../../../utils/dbClient';

test.describe('DB - Users Constraints @db @db_constraints', () => {
  test('Constraint: Emails should be unique', async () => {
    const duplicates = await queryDB(`
            SELECT email, COUNT(*) 
            FROM users 
            GROUP BY email 
            HAVING COUNT(*) > 1
        `);

    expect(duplicates.length).toBe(0);
  });

  test('Constraint: IDs should be unique', async () => {
    const duplicates = await queryDB(`
            SELECT id, COUNT(*) 
            FROM users 
            GROUP BY id 
            HAVING COUNT(*) > 1
        `);

    expect(duplicates.length).toBe(0);
  });

  test('Constraint: Emails should not be null', async () => {
    const result = await queryDB(`
            SELECT * FROM users 
            WHERE email IS NULL
        `);

    expect(result.length).toBe(0);
  });

  test('Constraint: Required fields should not be null', async () => {
    const result = await queryDB(`
            SELECT * FROM users
            WHERE first_name IS NULL
                OR last_name IS NULL
                OR email IS NULL
                OR created_at IS NULL
        `);

    expect(result.length).toBe(0);
  });

  test('Constraint: Emails should have valid format', async () => {
    const invalidEmails = await queryDB(`
            SELECT email
            FROM users
            WHERE email !~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
        `);

    expect(invalidEmails.length).toBe(0);
  });

  test('Constraint: Roles should be valid', async () => {
    const invalidRoles = await queryDB(`
            SELECT DISTINCT "role"
            FROM users
            WHERE "role" NOT IN ('Member', 'Admin', 'VIP')
        `);

    expect(invalidRoles.length).toBe(0);
  });

  test('Constraint: created_at should not be in the future', async () => {
    const result = await queryDB(`
            SELECT * FROM users
            WHERE created_at > NOW()
        `);

    expect(result.length).toBe(0);
  });

  test('Constraint: Names should not be empty strings', async () => {
    const result = await queryDB(`
            SELECT * FROM users
            WHERE first_name = '' OR last_name = ''
        `);

    expect(result.length).toBe(0);
  });
});

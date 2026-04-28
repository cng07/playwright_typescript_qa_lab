# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: db/users/constraints.spec.ts >> DB - Users Constraints @db @db_constraints >> Constraint: Emails should be unique
- Location: tests/db/users/constraints.spec.ts:5:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { queryDB } from '../../../utils/dbClient';
  3  | 
  4  | test.describe('DB - Users Constraints @db @db_constraints', () => {
  5  |   test('Constraint: Emails should be unique', async () => {
  6  |     const duplicates = await queryDB(`
  7  |             SELECT email, COUNT(*) 
  8  |             FROM users 
  9  |             GROUP BY email 
  10 |             HAVING COUNT(*) > 1
  11 |         `);
  12 | 
> 13 |     expect(duplicates.length).toBe(0);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  14 |   });
  15 | 
  16 |   test('Constraint: IDs should be unique', async () => {
  17 |     const duplicates = await queryDB(`
  18 |             SELECT id, COUNT(*) 
  19 |             FROM users 
  20 |             GROUP BY id 
  21 |             HAVING COUNT(*) > 1
  22 |         `);
  23 | 
  24 |     expect(duplicates.length).toBe(0);
  25 |   });
  26 | 
  27 |   test('Constraint: Emails should not be null', async () => {
  28 |     const result = await queryDB(`
  29 |             SELECT * FROM users 
  30 |             WHERE email IS NULL
  31 |         `);
  32 | 
  33 |     expect(result.length).toBe(0);
  34 |   });
  35 | 
  36 |   test('Constraint: Required fields should not be null', async () => {
  37 |     const result = await queryDB(`
  38 |             SELECT * FROM users
  39 |             WHERE first_name IS NULL
  40 |                 OR last_name IS NULL
  41 |                 OR email IS NULL
  42 |                 OR created_at IS NULL
  43 |         `);
  44 | 
  45 |     expect(result.length).toBe(0);
  46 |   });
  47 | 
  48 |   test('Constraint: Emails should have valid format', async () => {
  49 |     const invalidEmails = await queryDB(`
  50 |             SELECT email
  51 |             FROM users
  52 |             WHERE email !~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
  53 |         `);
  54 | 
  55 |     expect(invalidEmails.length).toBe(0);
  56 |   });
  57 | 
  58 |   test('Constraint: Roles should be valid', async () => {
  59 |     const invalidRoles = await queryDB(`
  60 |             SELECT DISTINCT "role"
  61 |             FROM users
  62 |             WHERE "role" NOT IN ('Member', 'Admin', 'VIP')
  63 |         `);
  64 | 
  65 |     expect(invalidRoles.length).toBe(0);
  66 |   });
  67 | 
  68 |   test('Constraint: created_at should not be in the future', async () => {
  69 |     const result = await queryDB(`
  70 |             SELECT * FROM users
  71 |             WHERE created_at > NOW()
  72 |         `);
  73 | 
  74 |     expect(result.length).toBe(0);
  75 |   });
  76 | 
  77 |   test('Constraint: Names should not be empty strings', async () => {
  78 |     const result = await queryDB(`
  79 |             SELECT * FROM users
  80 |             WHERE first_name = '' OR last_name = ''
  81 |         `);
  82 | 
  83 |     expect(result.length).toBe(0);
  84 |   });
  85 | });
  86 | 
```
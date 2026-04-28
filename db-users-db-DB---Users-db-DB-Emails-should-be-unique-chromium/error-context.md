# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: db/users/db.spec.ts >> DB - Users @db >> DB: Emails should be unique
- Location: tests/db/users/db.spec.ts:75:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { queryDB } from '../../../utils/dbClient';
  3   | 
  4   | test.describe('DB - Users @db', () => {
  5   |   test('DB: Users table contains at least one record @smoke', async () => {
  6   |     const users = await queryDB(`
  7   |       SELECT * 
  8   |       FROM users
  9   |       `);
  10  | 
  11  |     expect(users.length).toBeGreaterThan(0);
  12  |   });
  13  | 
  14  |   test('DB: Users table returns required profile fields @smoke @regression', async () => {
  15  |     const users = await queryDB(`
  16  |       SELECT * 
  17  |       FROM users 
  18  |       LIMIT 1
  19  |       `);
  20  | 
  21  |     expect(users[0]).toHaveProperty('id');
  22  |     expect(users[0]).toHaveProperty('first_name');
  23  |     expect(users[0]).toHaveProperty('last_name');
  24  |     expect(users[0]).toHaveProperty('email');
  25  |     expect(users[0]).toHaveProperty('created_at');
  26  |     expect(users[0]).toHaveProperty('nationality');
  27  |     expect(users[0]).toHaveProperty('role');
  28  |   });
  29  | 
  30  |   test('DB: Users table should not contain null emails @smoke @regression', async () => {
  31  |     const users = await queryDB(`
  32  |       SELECT * 
  33  |       FROM users 
  34  |       WHERE email IS NULL
  35  |       `);
  36  | 
  37  |     expect(users.length).toBe(0);
  38  |   });
  39  | 
  40  |   test('DB: Users columns have correct data types', async () => {
  41  |     const [user] = await queryDB(`
  42  |       SELECT *
  43  |       FROM users 
  44  |       LIMIT 1
  45  |       `);
  46  | 
  47  |     expect(typeof user.first_name).toBe('string');
  48  |     expect(typeof user.last_name).toBe('string');
  49  |     expect(typeof user.email).toBe('string');
  50  |     expect(typeof user.nationality).toBe('string');
  51  |     expect(typeof user.role).toBe('string');
  52  |     expect(typeof user.id).toBe('string');
  53  | 
  54  |     expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
  55  |   });
  56  | 
  57  |   test('DB: Column naming should remain consistent', async () => {
  58  |     const result = await queryDB(`
  59  |     SELECT column_name 
  60  |     FROM information_schema.columns 
  61  |     WHERE table_name = 'users'
  62  |     `);
  63  | 
  64  |     const columns = result.map((c) => c.column_name);
  65  | 
  66  |     expect(columns).toContain('first_name');
  67  |     expect(columns).toContain('last_name');
  68  |     expect(columns).toContain('email');
  69  |     expect(columns).toContain('created_at');
  70  |     expect(columns).toContain('nationality');
  71  |     expect(columns).toContain('role');
  72  |     expect(columns).toContain('id');
  73  |   });
  74  | 
  75  |   test('DB: Emails should be unique', async () => {
  76  |     const duplicates = await queryDB(`
  77  |     SELECT email, COUNT(*) 
  78  |     FROM users 
  79  |     GROUP BY email 
  80  |     HAVING COUNT(*) > 1
  81  |   `);
  82  | 
> 83  |     expect(duplicates.length).toBe(0);
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  84  |   });
  85  | 
  86  |   test('DB: IDs should be unique', async () => {
  87  |     const duplicates = await queryDB(`
  88  |     SELECT id, COUNT(*) 
  89  |     FROM users 
  90  |     GROUP BY id 
  91  |     HAVING COUNT(*) > 1
  92  |   `);
  93  | 
  94  |     expect(duplicates.length).toBe(0);
  95  |   });
  96  | 
  97  |   test('DB: Roles should be valid', async () => {
  98  |     const invalidRoles = await queryDB(`
  99  |     SELECT DISTINCT "role" 
  100 |     FROM users 
  101 |     WHERE "role" NOT IN ('Member', 'Admin', 'VIP')
  102 |   `);
  103 | 
  104 |     expect(invalidRoles.length).toBe(0);
  105 |   });
  106 | 
  107 |   test('DB: Names should not be empty', async () => {
  108 |     const invalid = await queryDB(`
  109 |     SELECT * FROM users 
  110 |     WHERE first_name = '' OR last_name = ''
  111 |   `);
  112 | 
  113 |     expect(invalid.length).toBe(0);
  114 |   });
  115 | 
  116 |   test('DB: Emails should be valid format', async () => {
  117 |     const invalidEmails = await queryDB(`
  118 |     SELECT email FROM users
  119 |     WHERE email !~ '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'
  120 |   `);
  121 | 
  122 |     expect(invalidEmails.length).toBe(0);
  123 |   });
  124 | 
  125 |   test('DB: created_at should not be in the future', async () => {
  126 |     const invalid = await queryDB(`
  127 |     SELECT * FROM users
  128 |     WHERE created_at > NOW()
  129 |   `);
  130 | 
  131 |     expect(invalid.length).toBe(0);
  132 |   });
  133 | 
  134 |   test('DB: created_at should not be null', async () => {
  135 |     const invalid = await queryDB(`
  136 |     SELECT * FROM users
  137 |     WHERE created_at IS NULL
  138 |   `);
  139 | 
  140 |     expect(invalid.length).toBe(0);
  141 |   });
  142 | 
  143 |   test('DB: No duplicate email', async () => {
  144 |     const duplicate = await queryDB(`
  145 |     SELECT email, COUNT(*)
  146 |     FROM users
  147 |     GROUP BY email
  148 |     HAVING COUNT(*) > 1
  149 |   `);
  150 | 
  151 |     expect(duplicate.length).toBe(0);
  152 |   });
  153 | 
  154 |   test('DB: Filter users by role', async () => {
  155 |     const members = await queryDB(`
  156 |     SELECT * 
  157 |     FROM users 
  158 |     WHERE "role" = 'Member'
  159 |   `);
  160 | 
  161 |     members.forEach((user) => {
  162 |       expect(user.role).toBe('Member');
  163 |     });
  164 |   });
  165 | 
  166 |   test('DB: Users sorted by created_at DESC', async () => {
  167 |     const users = await queryDB(`
  168 |     SELECT * FROM users ORDER BY created_at DESC
  169 |   `);
  170 | 
  171 |     for (let i = 1; i < users.length; i++) {
  172 |       expect(new Date(users[i - 1].created_at).getTime()).toBeGreaterThanOrEqual(
  173 |         new Date(users[i].created_at).getTime(),
  174 |       );
  175 |     }
  176 |   });
  177 | 
  178 |   test('DB: No critical null fields', async () => {
  179 |     const invalid = await queryDB(`
  180 |     SELECT * FROM users
  181 |     WHERE first_name IS NULL 
  182 |        OR last_name IS NULL
  183 |        OR email IS NULL
```
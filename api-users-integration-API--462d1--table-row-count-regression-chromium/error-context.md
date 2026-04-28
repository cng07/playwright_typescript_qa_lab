# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/users/integration.spec.ts >> API + DB - Users >> Integration: Users API row count matches users table row count @regression
- Location: tests/api/users/integration.spec.ts:6:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 6
Received: 5
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { apiRequest } from '../../../utils/apiClient';
  3  | import { queryDB } from '../../../utils/dbClient';
  4  | 
  5  | test.describe('API + DB - Users', () => {
  6  |   test('Integration: Users API row count matches users table row count @regression', async ({
  7  |     request,
  8  |   }) => {
  9  |     const supabaseUrl = process.env.SUPABASE_URL;
  10 |     const supabaseApiKey = process.env.SUPABASE_API_KEY;
  11 | 
  12 |     expect(supabaseUrl, 'SUPABASE_URL must be defined').toBeTruthy();
  13 |     expect(supabaseApiKey, 'SUPABASE_API_KEY must be defined').toBeTruthy();
  14 | 
  15 |     // const apiRes = await request.get(`${supabaseUrl}/rest/v1/users`, {
  16 |     //   headers: {
  17 |     //     apikey: supabaseApiKey!,
  18 |     //     Authorization: `Bearer ${supabaseApiKey!}`,
  19 |     //   },
  20 |     // });
  21 |     const apiRes = await apiRequest(request, 'get', '/rest/v1/users');
  22 | 
  23 |     expect(apiRes.status()).toBe(200);
  24 |     expect(apiRes.headers()['content-type'] || '').toContain('application/json');
  25 | 
  26 |     const apiData = await apiRes.json();
  27 | 
  28 |     const dbData = await queryDB('SELECT * FROM users');
  29 | 
> 30 |     expect(apiData.length).toBe(dbData.length);
     |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  31 |   });
  32 | });
  33 | 
```
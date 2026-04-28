# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/users/integration.spec.ts >> API + DB - Users >> Integration: Users API row count matches users table row count @regression
- Location: tests/api/users/integration.spec.ts:7:7

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
  6  |   test.describe.configure({ mode: 'serial' });
  7  |   test('Integration: Users API row count matches users table row count @regression', async ({
  8  |     request,
  9  |   }) => {
  10 |     const supabaseUrl = process.env.SUPABASE_URL;
  11 |     const supabaseApiKey = process.env.SUPABASE_API_KEY;
  12 | 
  13 |     expect(supabaseUrl, 'SUPABASE_URL must be defined').toBeTruthy();
  14 |     expect(supabaseApiKey, 'SUPABASE_API_KEY must be defined').toBeTruthy();
  15 | 
  16 |     // const apiRes = await request.get(`${supabaseUrl}/rest/v1/users`, {
  17 |     //   headers: {
  18 |     //     apikey: supabaseApiKey!,
  19 |     //     Authorization: `Bearer ${supabaseApiKey!}`,
  20 |     //   },
  21 |     // });
  22 |     const apiRes = await apiRequest(request, 'get', '/rest/v1/users');
  23 | 
  24 |     expect(apiRes.status()).toBe(200);
  25 |     expect(apiRes.headers()['content-type'] || '').toContain('application/json');
  26 | 
  27 |     const apiData = await apiRes.json();
  28 | 
  29 |     const dbData = await queryDB('SELECT * FROM users');
  30 | 
> 31 |     expect(apiData.length).toBe(dbData.length);
     |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  32 |   });
  33 | });
  34 | 
```
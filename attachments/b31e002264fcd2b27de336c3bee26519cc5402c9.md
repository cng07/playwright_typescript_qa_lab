# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/users/post.spec.ts >> API - Users POST @api @api_post >> API:POST - Users should fail with missing fields
- Location: tests/api/users/post.spec.ts:52:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 400
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { apiRequest } from '../../../utils/apiClient';
  3  | 
  4  | test.describe('API - Users POST @api @api_post', () => {
  5  |   test('API:POST - Users should create user', async ({ request }) => {
  6  |     const email = `api_${Date.now()}@mail.com`;
  7  | 
  8  |     let userId: string | null = null;
  9  | 
  10 |     try {
  11 |       // CREATE
  12 |       const res = await apiRequest(request, 'post', '/rest/v1/users', {
  13 |         data: {
  14 |           first_name: 'API',
  15 |           last_name: 'Test',
  16 |           email,
  17 |           nationality: 'Filipino',
  18 |           role: 'Member',
  19 |         },
  20 |         headers: {
  21 |           // Previous inline defaults, now centralized in apiRequest:
  22 |           // apikey: process.env.SUPABASE_API_KEY!,
  23 |           // Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
  24 |           // 'Content-Type': 'application/json',
  25 |           Prefer: 'return=representation',
  26 |         },
  27 |       });
  28 | 
  29 |       expect(res.status()).toBe(201);
  30 | 
  31 |       const data = await res.json();
  32 |       const user = data[0];
  33 | 
  34 |       userId = user.id;
  35 | 
  36 |       expect(user.email).toBe(email);
  37 |     } finally {
  38 |       // CLEANUP (always runs)
  39 |       if (userId) {
  40 |         // Previous inline defaults were:
  41 |         // headers: {
  42 |         //   apikey: process.env.SUPABASE_API_KEY!,
  43 |         //   Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
  44 |         // }
  45 |         const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);
  46 | 
  47 |         expect(deleteRes.status()).toBe(204);
  48 |       }
  49 |     }
  50 |   });
  51 | 
  52 |   test('API:POST - Users should fail with missing fields', async ({ request }) => {
  53 |     const email = `api_incomplete_${Date.now()}@mail.com`;
  54 | 
  55 |     let userId: string | null = null;
  56 | 
  57 |     try {
  58 |       // CREATE (currently succeeds due to schema)
  59 |       const res = await apiRequest(request, 'post', '/rest/v1/users', {
  60 |         data: {
  61 |           first_name: 'Incomplete',
  62 |           email,
  63 |         },
  64 |         headers: {
  65 |           // Previous inline defaults, now centralized in apiRequest:
  66 |           // apikey: process.env.SUPABASE_API_KEY!,
  67 |           // Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
  68 |           // 'Content-Type': 'application/json',
  69 |           Prefer: 'return=representation',
  70 |         },
  71 |       });
  72 | 
> 73 |       expect(res.status()).toBe(201);
     |                            ^ Error: expect(received).toBe(expected) // Object.is equality
  74 | 
  75 |       const data = await res.json();
  76 |       const user = data[0];
  77 | 
  78 |       userId = user.id;
  79 | 
  80 |       expect(user.first_name).toBe('Incomplete');
  81 |     } finally {
  82 |       // CLEANUP (always runs)
  83 |       if (userId) {
  84 |         // Previous inline defaults were:
  85 |         // headers: {
  86 |         //   apikey: process.env.SUPABASE_API_KEY!,
  87 |         //   Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
  88 |         // }
  89 |         const deleteRes = await apiRequest(request, 'delete', `/rest/v1/users?id=eq.${userId}`);
  90 | 
  91 |         expect(deleteRes.status()).toBe(204);
  92 |       }
  93 |     }
  94 |   });
  95 | });
  96 | 
```
import { APIRequestContext } from '@playwright/test';

export async function apiRequest(
  request: APIRequestContext,
  method: 'get' | 'post' | 'patch' | 'delete',
  endpoint: string,
  options: any = {},
) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const apiKey = process.env.SUPABASE_API_KEY!;

  return request[method](`${supabaseUrl}${endpoint}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
}

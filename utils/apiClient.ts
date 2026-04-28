import { APIRequestContext } from '@playwright/test';

export async function apiRequest(
  request: APIRequestContext,
  method: 'get' | 'post' | 'patch' | 'delete',
  endpoint: string,
  options: any = {},
) {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const defaultHeaders = {
    apikey: process.env.SUPABASE_API_KEY!,
    Authorization: `Bearer ${process.env.SUPABASE_API_KEY}`,
    'Content-Type': 'application/json',
  };
  const { headers, ...requestOptions } = options;

  return request[method](`${supabaseUrl}${endpoint}`, {
    ...requestOptions,
    headers: {
      ...defaultHeaders,
      ...(headers || {}),
    },
  });
}

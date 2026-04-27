import { test, expect } from '@playwright/test';
import { queryDB } from '../../../utils/dbClient';

test.describe('DB - Users Indexes @db @db_indexes', () => {
  test('Index: Users table should have a primary key index on id', async () => {
    const indexes = await queryDB(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'users'
        `);

    const hasPrimaryKeyIndex = indexes.some((idx: any) => idx.indexdef.includes('(id)'));

    expect(hasPrimaryKeyIndex).toBe(true);
  });

  test('Index: Users table should have an index on email', async () => {
    const indexes = await queryDB(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'users'
        `);

    const hasEmailIndex = indexes.some((idx: any) => idx.indexdef.includes('(email)'));

    expect(hasEmailIndex).toBe(true);
  });

  test('Index: Expected indexes should exist', async () => {
    const indexes = await queryDB(`
            SELECT indexname
            FROM pg_indexes
            WHERE tablename = 'users'
            AND schemaname = 'public'
        `);

    indexes.forEach((idx: any) => {
      expect(idx.indexname).toMatch(/(_idx|_key|_pkey)$/);
    });
  });
});

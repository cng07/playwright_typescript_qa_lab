import { test, expect } from '@playwright/test';
import { queryDB } from '../../utils/dbClient';

test.describe('DB - Users Schema @db_schema', () => {

    test('Schema: Users table should have expected columns', async () => {

        const result = await queryDB(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);

        const columns = result.map((c: any) => c.column_name);

        expect(columns).toEqual(expect.arrayContaining([
            'id',
            'first_name',
            'last_name',
            'email',
            'created_at',
            'nationality',
            'role'
        ]));
    });


    test('Schema: Users columns should have correct data types', async () => {
        const result = await queryDB(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'users'
            AND table_schema = 'public'    
        `);

        const columnMap = Object.fromEntries(
            result.map((col: any) => [col.column_name, col.data_type])
        );

        expect(columnMap['id']).toContain('uuid');
        expect(columnMap['first_name']).toContain('text');
        expect(columnMap['last_name']).toContain('text');
        // expect(columnMap['email']).toContain('text');
        expect(['text', 'character varying']).toContain(columnMap['email']);
        expect(columnMap['created_at']).toContain('timestamp');
    });


    test('Schema: Sample record should match expected structure', async () => {
        const [user] = await queryDB(`
            SELECT * 
            FROM users 
            LIMIT 1
        `);

        expect(user).toMatchObject({
            id: expect.any(String),
            first_name: expect.any(String),
            last_name: expect.any(String),
            email: expect.any(String),
            created_at: expect.any(Date),
            nationality: expect.any(String),
            role: expect.any(String),
        });
    });


    test('Schema: created_at should be a valid date', async () => {
        const [user] = await queryDB(`
            SELECT created_at 
            FROM users LIMIT 1
        `);

        expect(new Date(user.created_at).toString()).not.toBe('Invalid Date');
    });

});


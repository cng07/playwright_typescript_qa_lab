import { queryDB } from '../dbClient';

type UserInput = {
    first_name?: string;
    last_name?: string;
    email?: string;
    nationality?: string;
    role?: 'Member' | 'Admin' | 'VIP';
};

export async function createTestUser(input: UserInput = {}) {
    const email = input.email || `test_${Date.now()}@mail.com`;

    const user = {
        first_name: input.first_name || 'Test',
        last_name: input.last_name || 'User',
        email,
        nationality: input.nationality || 'Filipino',
        role: input.role || 'Member',
    };

    await queryDB(`
        INSERT INTO users (id, first_name, last_name, email, nationality, role)
        VALUES (
        gen_random_uuid(),
        '${user.first_name}',
        '${user.last_name}',
        '${user.email}',
        '${user.nationality}',
        '${user.role}'
        )
    `);

    return user;
}

export async function deleteTestUser(email: string) {
    await queryDB(`
        DELETE FROM users 
        WHERE email = '${email}'
    `);
}
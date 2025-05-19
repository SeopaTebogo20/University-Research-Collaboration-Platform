const auth = require('../src/public/js/auth');

describe('auth module', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    test('should return false when user is not logged in', () => {
        expect(auth.isLoggedIn()).toBe(false);
    });

    test('should return true when user is logged in', () => {
        sessionStorage.setItem('user', JSON.stringify({ id: 1, name: 'Alice' }));
        expect(auth.isLoggedIn()).toBe(true);
    });

    test('should return current user from sessionStorage', () => {
        const user = { id: 1, name: 'Alice' };
        sessionStorage.setItem('user', JSON.stringify(user));
        expect(auth.getCurrentUser()).toEqual(user);
    });

    test('should parse a valid JWT', () => {
        const payload = { id: '123', name: 'Test User' };
        const token = `header.${btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}.signature`;
        expect(auth.parseJwt(token)).toEqual(payload);
    });

    test('should return null for invalid JWT', () => {
        expect(auth.parseJwt('invalid.token')).toBeNull();
    });

    test('should store user data on login', () => {
        const userData = {
            id: 'abc',
            email: 'test@example.com',
            user_metadata: {
                name: 'Alice',
                role: 'admin',
                picture: 'pic.jpg'
            },
            session: {
                access_token: 'token123',
                refresh_token: 'refresh123'
            }
        };

        const result = auth.handleLogin(userData);
        expect(result).toBe(true);
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        expect(storedUser).toMatchObject({
            id: 'abc',
            email: 'test@example.com',
            name: 'Alice',
            role: 'admin',
            picture: 'pic.jpg'
        });
        expect(sessionStorage.getItem('access_token')).toBe('token123');
        expect(sessionStorage.getItem('refresh_token')).toBe('refresh123');
    });
});

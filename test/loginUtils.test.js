const { getDashboardUrlByRole, storeUserInSession } = require('../src/public/js/loginUtils');

describe('getDashboardUrlByRole', () => {
  test('returns correct dashboard for admin', () => {
    expect(getDashboardUrlByRole('admin')).toBe('/roles/admin/dashboard.html');
  });

  test('returns correct dashboard for reviewer', () => {
    expect(getDashboardUrlByRole('reviewer')).toBe('/roles/reviewer/dashboard.html');
  });

  test('returns correct dashboard for researcher', () => {
    expect(getDashboardUrlByRole('researcher')).toBe('/roles/researcher/dashboard.html');
  });

  test('returns default dashboard for unknown role', () => {
    expect(getDashboardUrlByRole('unknown')).toBe('/roles/researcher/dashboard.html');
  });
});

describe('storeUserInSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('stores user data correctly in sessionStorage', () => {
    const user = {
      id: '123',
      email: 'test@example.com',
      user_metadata: {
        role: 'admin',
        name: 'Alice',
        picture: 'pic.jpg'
      },
      session: {
        access_token: 'token123',
        refresh_token: 'refresh456'
      }
    };

    storeUserInSession(user);

    const stored = JSON.parse(sessionStorage.getItem('user'));
    expect(stored).toEqual({
      id: '123',
      email: 'test@example.com',
      role: 'admin',
      name: 'Alice',
      picture: 'pic.jpg'
    });

    expect(sessionStorage.getItem('access_token')).toBe('token123');
    expect(sessionStorage.getItem('refresh_token')).toBe('refresh456');
  });

  test('handles missing session tokens gracefully', () => {
    const user = {
      id: '456',
      email: 'test2@example.com',
      user_metadata: { name: 'Bob', role: 'researcher' }
    };

    storeUserInSession(user);

    const stored = JSON.parse(sessionStorage.getItem('user'));
    expect(stored.name).toBe('Bob');
    expect(sessionStorage.getItem('access_token')).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
  });
});

const { fetchGoogleProfile, handleFormSubmission, getDashboardUrlByRole } = require('../src/public/js/signupUtils');

global.fetch = jest.fn(); // Mock global fetch

describe('signupUtils.js', () => {
    describe('fetchGoogleProfile', () => {
        it('should fetch Google profile successfully', async () => {
            const mockProfile = { name: 'John Doe', email: 'john@example.com', picture: 'profile.jpg' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ profile: mockProfile })
            });

            const profile = await fetchGoogleProfile('dummy-token');

            expect(profile).toEqual(mockProfile);
        });

        it('should return null if Google profile fetch fails', async () => {
            fetch.mockResolvedValueOnce({ ok: false });

            const profile = await fetchGoogleProfile('dummy-token');

            expect(profile).toBeNull();
        });

        it('should handle errors correctly', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const profile = await fetchGoogleProfile('dummy-token');

            expect(profile).toBeNull();
        });
    });



    describe('getDashboardUrlByRole', () => {
        it('should return correct dashboard URL for admin', () => {
            const url = getDashboardUrlByRole('admin');
            expect(url).toBe('/roles/admin/dashboard.html');
        });

        it('should return correct dashboard URL for reviewer', () => {
            const url = getDashboardUrlByRole('reviewer');
            expect(url).toBe('/roles/reviewer/dashboard.html');
        });

        it('should return correct dashboard URL for researcher (default)', () => {
            const url = getDashboardUrlByRole('researcher');
            expect(url).toBe('/roles/researcher/dashboard.html');
        });

        it('should return correct dashboard URL for an unknown role', () => {
            const url = getDashboardUrlByRole('unknownRole');
            expect(url).toBe('/roles/researcher/dashboard.html');
        });
    });
});

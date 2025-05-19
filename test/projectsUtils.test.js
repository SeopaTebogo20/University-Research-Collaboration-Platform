// projectsUtils.test.js
const {
    getApiBaseUrl,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectDetails,
    getUsers,
    getUserProfile,
    sendInvitation,
    formatProjectDates,
    getStatusClass
} = require('../src/public/js/projectsUtils');

// Mock the global fetch and window objects
global.fetch = jest.fn();
global.window = {
    location: {
        hostname: 'localhost'
    }
};

describe('projectsUtils', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('getApiBaseUrl', () => {
        it('should return localhost URL for development', () => {
            window.location.hostname = 'localhost';
            expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
        });

        it('should return production URL for production', () => {
            window.location.hostname = 'example.com';
            expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
        });
    });

    describe('loadProjects', () => {
        it('should fetch projects without search query', async () => {
            const mockProjects = [{ id: 1, title: 'Project 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProjects)
            });

            const projects = await loadProjects();
            expect(projects).toEqual(mockProjects);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects');
        });

        it('should fetch projects with search query', async () => {
            const mockProjects = [{ id: 1, title: 'Project 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProjects)
            });

            const projects = await loadProjects('test');
            expect(projects).toEqual(mockProjects);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects?search=test');
        });

        it('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(loadProjects()).rejects.toThrow('HTTP error! Status: 500');
        });
    });

    describe('createProject', () => {
        it('should create a new project', async () => {
            const mockProject = { id: 1, title: 'New Project' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProject)
            });

            const projectData = { title: 'New Project' };
            const result = await createProject(projectData);
            expect(result).toEqual(mockProject);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });
        });
    });

    describe('updateProject', () => {
        it('should update an existing project', async () => {
            const mockProject = { id: 1, title: 'Updated Project' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProject)
            });

            const projectData = { title: 'Updated Project' };
            const result = await updateProject(1, projectData);
            expect(result).toEqual(mockProject);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects/1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData)
            });
        });
    });

    describe('deleteProject', () => {
        it('should delete a project', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({})
            });

            await deleteProject(1);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects/1', {
                method: 'DELETE'
            });
        });
    });

    describe('getProjectDetails', () => {
        it('should fetch project details', async () => {
            const mockProject = { id: 1, title: 'Project Details' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProject)
            });

            const result = await getProjectDetails(1);
            expect(result).toEqual(mockProject);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects/1');
        });
    });

    describe('getUsers', () => {
        it('should fetch users', async () => {
            const mockUsers = [{ id: 1, name: 'User 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUsers)
            });

            const result = await getUsers();
            expect(result).toEqual(mockUsers);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users');
        });
    });

    describe('getUserProfile', () => {
        it('should fetch user profile', async () => {
            const mockProfile = { id: 1, name: 'User Profile' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProfile)
            });

            const result = await getUserProfile('1');
            expect(result).toEqual(mockProfile);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users/1');
        });
    });

    describe('sendInvitation', () => {
        it('should send an invitation', async () => {
            const mockResponse = { success: true };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const invitationData = {
                project_id: 1,
                collaborator_id: 2,
                position: 'Researcher',
                message: 'Test message'
            };
            const result = await sendInvitation(invitationData);
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invitationData)
            });
        });
    });

    describe('formatProjectDates', () => {
        it('should format project dates', () => {
            const project = {
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            };
            const formatted = formatProjectDates(project);
            expect(formatted.start_date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
            expect(formatted.end_date).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
        });
    });

    describe('getStatusClass', () => {
        it('should return correct status class', () => {
            expect(getStatusClass('active')).toBe('status-active');
            expect(getStatusClass('completed')).toBe('status-completed');
            expect(getStatusClass('pending')).toBe('status-pending');
            expect(getStatusClass()).toBe('status-active');
            expect(getStatusClass('unknown')).toBe('status-active');
        });
    });
});
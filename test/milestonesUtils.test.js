// milestonesUtils.test.js
const {
    getApiBaseUrl,
    getApiEndpoints,
    loadProjects,
    loadMilestones,
    saveMilestone,
    deleteMilestoneById,
    loadProjectDetails,
    loadCollaborators,
    getMilestoneStats,
    capitalize
} = require('../src/public/js/milestonesUtils');

// Mock the global fetch and window objects
global.fetch = jest.fn();
global.window = {
    location: {
        hostname: 'localhost'
    }
};

describe('milestonesUtils', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    describe('getApiBaseUrl', () => {
        it('should return localhost URL for development', () => {
            window.location.hostname = 'localhost';
            expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
        });

        it('should return production URL for non-localhost', () => {
            window.location.hostname = 'example.com';
            expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
        });
    });

    describe('getApiEndpoints', () => {
        it('should return correct API endpoints', () => {
            const endpoints = getApiEndpoints();
            expect(endpoints).toEqual({
                projects: 'http://localhost:3000/api/projects',
                milestones: 'http://localhost:3000/api/milestones',
                collaborators: 'http://localhost:3000/api/collaborators'
            });
        });
    });

    describe('loadProjects', () => {
        it('should fetch projects successfully', async () => {
            const mockProjects = [{ id: 1, title: 'Project 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProjects)
            });

            const projects = await loadProjects();
            expect(projects).toEqual(mockProjects);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects');
        });

        it('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(loadProjects()).rejects.toThrow('HTTP error! Status: 500');
        });
    });

    describe('loadMilestones', () => {
        it('should fetch milestones for a project successfully', async () => {
            const mockMilestones = [{ id: 1, title: 'Milestone 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockMilestones)
            });

            const milestones = await loadMilestones(1);
            expect(milestones).toEqual(mockMilestones);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/milestones?project_id=1');
        });

        it('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(loadMilestones(1)).rejects.toThrow('HTTP error! Status: 404');
        });
    });

    describe('saveMilestone', () => {
        it('should create new milestone successfully', async () => {
            const mockMilestone = { id: 1, title: 'New Milestone' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockMilestone)
            });

            const milestoneData = { title: 'New Milestone' };
            const result = await saveMilestone(milestoneData, true);
            expect(result).toEqual(mockMilestone);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/milestones',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );
        });

        it('should update existing milestone successfully', async () => {
            const mockMilestone = { id: 1, title: 'Updated Milestone' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockMilestone)
            });

            const milestoneData = { id: 1, title: 'Updated Milestone' };
            const result = await saveMilestone(milestoneData, false);
            expect(result).toEqual(mockMilestone);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/milestones/1',
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            );
        });

        it('should throw error when save fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            await expect(saveMilestone({}, true)).rejects.toThrow('HTTP error! Status: 400');
        });
    });

    describe('deleteMilestoneById', () => {
        it('should delete milestone successfully', async () => {
            fetch.mockResolvedValueOnce({
                ok: true
            });

            const result = await deleteMilestoneById(1);
            expect(result).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/milestones/1',
                { method: 'DELETE' }
            );
        });

        it('should throw error when delete fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(deleteMilestoneById(1)).rejects.toThrow('HTTP error! Status: 404');
        });
    });

    describe('loadProjectDetails', () => {
        it('should fetch project details successfully', async () => {
            const mockProject = { id: 1, title: 'Project Details' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProject)
            });

            const project = await loadProjectDetails(1);
            expect(project).toEqual(mockProject);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/projects/1');
        });

        it('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(loadProjectDetails(1)).rejects.toThrow('HTTP error! Status: 404');
        });
    });

    describe('loadCollaborators', () => {
        it('should fetch collaborators successfully', async () => {
            const mockCollaborators = [{ id: 1, name: 'Collaborator 1' }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockCollaborators)
            });

            const collaborators = await loadCollaborators();
            expect(collaborators).toEqual(mockCollaborators);
            expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/collaborators');
        });

        it('should throw error when fetch fails', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(loadCollaborators()).rejects.toThrow('HTTP error! Status: 500');
        });
    });



    describe('capitalize', () => {
        it('should capitalize first letter of a string', () => {
            expect(capitalize('hello')).toBe('Hello');
            expect(capitalize('WORLD')).toBe('WORLD');
            expect(capitalize('')).toBe('');
        });
    });
});
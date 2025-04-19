const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to projects data file
const PROJECTS_FILE = path.join(__dirname, '../researcher/data/projects.json');

// Helper function to read projects data
async function readProjects() {
  try {
    const data = await fs.readFile(PROJECTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading projects file:', error);
    return { projects: [] };
  }
}

// Helper function to write projects data
async function writeProjects(data) {
  try {
    await fs.writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing projects file:', error);
    return false;
  }
}

// Generate a new project ID
function generateProjectId(projects) {
  const maxId = projects.reduce((max, project) => {
    const num = parseInt(project.id.replace('PRJ', ''));
    return num > max ? num : max;
  }, 0);
  return `PRJ${String(maxId + 1).padStart(3, '0')}`;
}

// GET all projects
router.get('/', async (req, res) => {
  try {
    const data = await readProjects();
    res.json(data.projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await readProjects();
    const project = data.projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// POST create new project
router.post('/', async (req, res) => {
  try {
    const data = await readProjects();
    const newProject = req.body;
    
    // Validate required fields
    if (!newProject.projectDetails || !newProject.projectDetails.projectTitle || 
        !newProject.projectDetails.description || !newProject.projectDetails.keyResearchArea) {
      return res.status(400).json({ message: 'Missing required project details' });
    }
    
    // Generate ID if not provided
    if (!newProject.id) {
      newProject.id = generateProjectId(data.projects);
    }
    
    // Set default values if not provided
    if (!newProject.projectDetails.researcherName) {
      newProject.projectDetails.researcherName = "Dr. Sarah Johnson";
    }
    if (!newProject.projectDetails.startDate) {
      newProject.projectDetails.startDate = new Date().toISOString().split('T')[0];
    }
    if (!newProject.projectDetails.endDate) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      newProject.projectDetails.endDate = endDate.toISOString().split('T')[0];
    }
    if (newProject.projectDetails.fundingAvailable === undefined) {
      newProject.projectDetails.fundingAvailable = false;
    }
    
    // Set default collaboration requirements if not provided
    if (!newProject.collaborationRequirements) {
      newProject.collaborationRequirements = {
        skillsAndExpertise: [],
        experienceLevel: 'Intermediate',
        positionsRequired: [],
        technicalRequirements: []
      };
    }
    
    data.projects.push(newProject);
    await writeProjects(data);
    
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// PUT update existing project
router.put('/:id', async (req, res) => {
  try {
    const data = await readProjects();
    const projectIndex = data.projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const updatedProject = req.body;
    
    // Validate required fields
    if (!updatedProject.projectDetails || !updatedProject.projectDetails.projectTitle || 
        !updatedProject.projectDetails.description || !updatedProject.projectDetails.keyResearchArea) {
      return res.status(400).json({ message: 'Missing required project details' });
    }
    
    // Preserve the ID
    updatedProject.id = req.params.id;
    
    data.projects[projectIndex] = updatedProject;
    await writeProjects(data);
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// DELETE a project
router.delete('/:id', async (req, res) => {
  try {
    const data = await readProjects();
    const projectIndex = data.projects.findIndex(p => p.id === req.params.id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const deletedProject = data.projects.splice(projectIndex, 1);
    await writeProjects(data);
    
    res.json(deletedProject[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to collaborators data file
const COLLABORATORS_FILE = path.join(__dirname, '../researcher/data/collaborators.json');

// Helper function to read collaborators data
async function readCollaborators() {
  try {
    const data = await fs.readFile(COLLABORATORS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading collaborators file:', error);
    return { collaborators: [] };
  }
}

// Helper function to write collaborators data
async function writeCollaborators(data) {
  try {
    await fs.writeFile(COLLABORATORS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing collaborators file:', error);
    return false;
  }
}

// Generate a new collaborator ID
function generateCollaboratorId(collaborators) {
  const maxId = collaborators.reduce((max, collaborator) => {
    // Extract the numeric part of the id (c1, c2, etc.)
    const num = parseInt(collaborator.id.replace('c', ''));
    return num > max ? num : max;
  }, 0);
  return `c${maxId + 1}`;
}

// GET all collaborators
router.get('/', async (req, res) => {
  try {
    const data = await readCollaborators();
    res.json(data.collaborators);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborators', error: error.message });
  }
});

// GET single collaborator by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await readCollaborators();
    const collaborator = data.collaborators.find(c => c.id === req.params.id);
    
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    res.json(collaborator);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborator', error: error.message });
  }
});

// POST create new collaborator
router.post('/', async (req, res) => {
  try {
    const data = await readCollaborators();
    const newCollaborator = req.body;
    
    // Validate required fields
    if (!newCollaborator.name || !newCollaborator.institution || 
        !newCollaborator.email || !newCollaborator.bio) {
      return res.status(400).json({ message: 'Missing required collaborator details' });
    }
    
    // Generate ID if not provided
    if (!newCollaborator.id) {
      newCollaborator.id = generateCollaboratorId(data.collaborators);
    }
    
    // Set default values if not provided
    if (!newCollaborator.title) {
      newCollaborator.title = "Researcher";
    }
    if (!newCollaborator.department) {
      newCollaborator.department = "Research";
    }
    if (!newCollaborator.skills) {
      newCollaborator.skills = [];
    }
    if (!newCollaborator.education) {
      newCollaborator.education = [];
    }
    if (!newCollaborator.experience) {
      newCollaborator.experience = [];
    }
    if (!newCollaborator.projects) {
      newCollaborator.projects = [];
    }
    if (newCollaborator.publications === undefined) {
      newCollaborator.publications = 0;
    }
    if (newCollaborator.citations === undefined) {
      newCollaborator.citations = 0;
    }
    if (newCollaborator.collaborations === undefined) {
      newCollaborator.collaborations = 0;
    }
    if (newCollaborator.isCollaborator === undefined) {
      newCollaborator.isCollaborator = false;
    }
    if (newCollaborator.isSameField === undefined) {
      newCollaborator.isSameField = false;
    }
    if (newCollaborator.isSameInstitution === undefined) {
      newCollaborator.isSameInstitution = false;
    }
    if (newCollaborator.isRecommended === undefined) {
      newCollaborator.isRecommended = false;
    }
    
    data.collaborators.push(newCollaborator);
    await writeCollaborators(data);
    
    res.status(201).json(newCollaborator);
  } catch (error) {
    res.status(500).json({ message: 'Error creating collaborator', error: error.message });
  }
});

// PUT update existing collaborator
router.put('/:id', async (req, res) => {
  try {
    const data = await readCollaborators();
    const collaboratorIndex = data.collaborators.findIndex(c => c.id === req.params.id);
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    const updatedCollaborator = req.body;
    
    // Validate required fields
    if (!updatedCollaborator.name || !updatedCollaborator.institution || 
        !updatedCollaborator.email || !updatedCollaborator.bio) {
      return res.status(400).json({ message: 'Missing required collaborator details' });
    }
    
    // Preserve the ID
    updatedCollaborator.id = req.params.id;
    
    data.collaborators[collaboratorIndex] = updatedCollaborator;
    await writeCollaborators(data);
    
    res.json(updatedCollaborator);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collaborator', error: error.message });
  }
});

// DELETE a collaborator
router.delete('/:id', async (req, res) => {
  try {
    const data = await readCollaborators();
    const collaboratorIndex = data.collaborators.findIndex(c => c.id === req.params.id);
    
    if (collaboratorIndex === -1) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    const deletedCollaborator = data.collaborators.splice(collaboratorIndex, 1);
    await writeCollaborators(data);
    
    res.json(deletedCollaborator[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collaborator', error: error.message });
  }
});

// GET collaborators by filter criteria
router.get('/filter/:criteria/:value', async (req, res) => {
  try {
    const { criteria, value } = req.params;
    const data = await readCollaborators();
    
    let filteredCollaborators = [];
    
    switch(criteria) {
      case 'institution':
        filteredCollaborators = data.collaborators.filter(c => 
          c.institution.toLowerCase().includes(value.toLowerCase()));
        break;
      case 'department':
        filteredCollaborators = data.collaborators.filter(c => 
          c.department.toLowerCase().includes(value.toLowerCase()));
        break;
      case 'skill':
        filteredCollaborators = data.collaborators.filter(c => 
          c.skills.some(skill => skill.toLowerCase().includes(value.toLowerCase())));
        break;
      case 'isCollaborator':
        filteredCollaborators = data.collaborators.filter(c => 
          c.isCollaborator === (value.toLowerCase() === 'true'));
        break;
      case 'isSameField':
        filteredCollaborators = data.collaborators.filter(c => 
          c.isSameField === (value.toLowerCase() === 'true'));
        break;
      case 'isRecommended':
        filteredCollaborators = data.collaborators.filter(c => 
          c.isRecommended === (value.toLowerCase() === 'true'));
        break;
      default:
        return res.status(400).json({ message: 'Invalid filter criteria' });
    }
    
    res.json(filteredCollaborators);
  } catch (error) {
    res.status(500).json({ message: 'Error filtering collaborators', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Path to invitations data file
const INVITATIONS_FILE = path.join(__dirname, '../researcher/data/invitations.json');

// Helper function to read invitations data
async function readInvitations() {
  try {
    const data = await fs.readFile(INVITATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading invitations file:', error);
    return { invitations: [] };
  }
}

// Helper function to write invitations data
async function writeInvitations(data) {
  try {
    await fs.writeFile(INVITATIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing invitations file:', error);
    return false;
  }
}

// Generate a new invitation ID
function generateInvitationId(invitations) {
  const maxId = invitations.reduce((max, invitation) => {
    const num = parseInt(invitation.id.replace('INV', ''));
    return num > max ? num : max;
  }, 0);
  return `INV${String(maxId + 1).padStart(3, '0')}`;
}

// GET all invitations
router.get('/', async (req, res) => {
  try {
    const data = await readInvitations();
    res.json(data.invitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations', error: error.message });
  }
});

// GET single invitation by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitation = data.invitations.find(i => i.id === req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitation', error: error.message });
  }
});

// POST create new invitation
router.post('/', async (req, res) => {
  try {
    const data = await readInvitations();
    const newInvitation = req.body;
    
    // Validate required fields
    if (!newInvitation.projectId || !newInvitation.collaboratorId || 
        !newInvitation.invitationDate || !newInvitation.status) {
      return res.status(400).json({ message: 'Missing required invitation details' });
    }
    
    // Generate ID if not provided
    if (!newInvitation.id) {
      newInvitation.id = generateInvitationId(data.invitations);
    }
    
    // Set default values if not provided
    if (!newInvitation.message) {
      newInvitation.message = "I would like to invite you to collaborate on this project.";
    }
    if (!newInvitation.followUpDate) {
      const followUpDate = new Date(newInvitation.invitationDate);
      followUpDate.setDate(followUpDate.getDate() + 7);
      newInvitation.followUpDate = followUpDate.toISOString().split('T')[0];
    }
    if (!newInvitation.notes) {
      newInvitation.notes = "";
    }
    
    data.invitations.push(newInvitation);
    await writeInvitations(data);
    
    res.status(201).json(newInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invitation', error: error.message });
  }
});

// PUT update existing invitation
router.put('/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.invitations.findIndex(i => i.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    const updatedInvitation = req.body;
    
    // Validate required fields
    if (!updatedInvitation.projectId || !updatedInvitation.collaboratorId || 
        !updatedInvitation.invitationDate || !updatedInvitation.status) {
      return res.status(400).json({ message: 'Missing required invitation details' });
    }
    
    // Preserve the ID
    updatedInvitation.id = req.params.id;
    
    data.invitations[invitationIndex] = updatedInvitation;
    await writeInvitations(data);
    
    res.json(updatedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invitation', error: error.message });
  }
});

// DELETE an invitation
router.delete('/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.invitations.findIndex(i => i.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    const deletedInvitation = data.invitations.splice(invitationIndex, 1);
    await writeInvitations(data);
    
    res.json(deletedInvitation[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invitation', error: error.message });
  }
});

// GET invitations by project ID
router.get('/project/:projectId', async (req, res) => {
  try {
    const data = await readInvitations();
    const projectInvitations = data.invitations.filter(i => i.projectId === req.params.projectId);
    
    res.json(projectInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project invitations', error: error.message });
  }
});

// GET invitations by collaborator ID
router.get('/collaborator/:collaboratorId', async (req, res) => {
  try {
    const data = await readInvitations();
    const collaboratorInvitations = data.invitations.filter(i => i.collaboratorId === req.params.collaboratorId);
    
    res.json(collaboratorInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collaborator invitations', error: error.message });
  }
});

// GET invitations by status
router.get('/status/:status', async (req, res) => {
  try {
    const data = await readInvitations();
    const statusInvitations = data.invitations.filter(i => i.status.toLowerCase() === req.params.status.toLowerCase());
    
    res.json(statusInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations by status', error: error.message });
  }
});

// GET invitations needing follow-up
router.get('/follow-up/needed', async (req, res) => {
  try {
    const data = await readInvitations();
    const today = new Date().toISOString().split('T')[0];
    
    const followUpNeeded = data.invitations.filter(i => {
      return i.followUpDate <= today && 
             i.status !== 'Accepted' && 
             i.status !== 'Declined' &&
             (!i.lastFollowUpDate || i.lastFollowUpDate < today);
    });
    
    res.json(followUpNeeded);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations needing follow-up', error: error.message });
  }
});

// PUT update invitation status
router.put('/:id/status', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.invitations.findIndex(i => i.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    if (!req.body.status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    data.invitations[invitationIndex].status = req.body.status;
    data.invitations[invitationIndex].statusDate = new Date().toISOString().split('T')[0];
    
    await writeInvitations(data);
    
    res.json(data.invitations[invitationIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invitation status', error: error.message });
  }
});

// PUT record follow-up
router.put('/:id/follow-up', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.invitations.findIndex(i => i.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    data.invitations[invitationIndex].lastFollowUpDate = new Date().toISOString().split('T')[0];
    
    if (req.body.notes) {
      data.invitations[invitationIndex].notes = req.body.notes;
    }
    
    // Set new follow-up date if provided, or default to 7 days from now
    if (req.body.newFollowUpDate) {
      data.invitations[invitationIndex].followUpDate = req.body.newFollowUpDate;
    } else {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 7);
      data.invitations[invitationIndex].followUpDate = followUpDate.toISOString().split('T')[0];
    }
    
    await writeInvitations(data);
    
    res.json(data.invitations[invitationIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Error recording follow-up', error: error.message });
  }
});

module.exports = router;
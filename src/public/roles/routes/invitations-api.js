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
    return { sentInvitations: [], receivedInvitations: [] };
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

// Generate a new sent invitation ID
function generateSentInvitationId(sentInvitations) {
  const maxId = sentInvitations.reduce((max, invitation) => {
    const match = invitation.id.match(/^si(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `si${maxId + 1}`;
}

// Generate a new received invitation ID
function generateReceivedInvitationId(receivedInvitations) {
  const maxId = receivedInvitations.reduce((max, invitation) => {
    const match = invitation.id.match(/^INV(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `INV${String(maxId + 1).padStart(3, '0')}`;
}

// GET all invitations (both sent and received)
router.get('/', async (req, res) => {
  try {
    const data = await readInvitations();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations', error: error.message });
  }
});

// GET all sent invitations
router.get('/sent', async (req, res) => {
  try {
    const data = await readInvitations();
    res.json(data.sentInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent invitations', error: error.message });
  }
});

// GET all received invitations
router.get('/received', async (req, res) => {
  try {
    const data = await readInvitations();
    res.json(data.receivedInvitations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching received invitations', error: error.message });
  }
});

// GET sent invitation by ID
router.get('/sent/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitation = data.sentInvitations.find(inv => inv.id === req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Sent invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sent invitation', error: error.message });
  }
});

// GET received invitation by ID
router.get('/received/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitation = data.receivedInvitations.find(inv => inv.id === req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ message: 'Received invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching received invitation', error: error.message });
  }
});

// GET all invitations for a specific project
router.get('/project/:projectId', async (req, res) => {
  try {
    const data = await readInvitations();
    const sentInvitations = data.sentInvitations.filter(inv => inv.projectId === req.params.projectId);
    const receivedInvitations = data.receivedInvitations.filter(inv => inv.projectId === req.params.projectId);
    res.json({ sentInvitations, receivedInvitations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations for project', error: error.message });
  }
});

// POST create new sent invitation
router.post('/sent', async (req, res) => {
  try {
    const data = await readInvitations();
    const newInvitation = req.body;
    
    // Validate required fields
    if (!newInvitation.projectId || !newInvitation.invitedCollaborator) {
      return res.status(400).json({ message: 'Missing required invitation fields' });
    }
    
    // Generate ID if not provided
    if (!newInvitation.id) {
      newInvitation.id = generateSentInvitationId(data.sentInvitations);
    }
    
    // Set default values if not provided
    if (!newInvitation.invitedDate) {
      newInvitation.invitedDate = new Date().toISOString();
    }
    if (!newInvitation.status) {
      newInvitation.status = 'invited';
    }
    if (!newInvitation.messages) {
      newInvitation.messages = [];
    }
    
    data.sentInvitations.push(newInvitation);
    await writeInvitations(data);
    
    res.status(201).json(newInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating sent invitation', error: error.message });
  }
});

// POST create new received invitation
router.post('/received', async (req, res) => {
  try {
    const data = await readInvitations();
    const newInvitation = req.body;
    
    // Validate required fields
    if (!newInvitation.projectId || !newInvitation.projectTitle || !newInvitation.invitedBy) {
      return res.status(400).json({ message: 'Missing required invitation fields' });
    }
    
    // Generate ID if not provided
    if (!newInvitation.id) {
      newInvitation.id = generateReceivedInvitationId(data.receivedInvitations);
    }
    
    // Set default values if not provided
    if (!newInvitation.invitedDate) {
      newInvitation.invitedDate = new Date().toISOString();
    }
    if (!newInvitation.status) {
      newInvitation.status = 'pending';
    }
    if (!newInvitation.messages) {
      newInvitation.messages = [];
    }
    
    data.receivedInvitations.push(newInvitation);
    await writeInvitations(data);
    
    res.status(201).json(newInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating received invitation', error: error.message });
  }
});

// PUT update sent invitation
router.put('/sent/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.sentInvitations.findIndex(inv => inv.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Sent invitation not found' });
    }
    
    const updatedInvitation = req.body;
    
    // Validate required fields
    if (!updatedInvitation.projectId || !updatedInvitation.invitedCollaborator) {
      return res.status(400).json({ message: 'Missing required invitation fields' });
    }
    
    // Preserve the ID
    updatedInvitation.id = req.params.id;
    
    data.sentInvitations[invitationIndex] = updatedInvitation;
    await writeInvitations(data);
    
    res.json(updatedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating sent invitation', error: error.message });
  }
});

// PUT update received invitation
router.put('/received/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.receivedInvitations.findIndex(inv => inv.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Received invitation not found' });
    }
    
    const updatedInvitation = req.body;
    
    // Validate required fields
    if (!updatedInvitation.projectId || !updatedInvitation.projectTitle || !updatedInvitation.invitedBy) {
      return res.status(400).json({ message: 'Missing required invitation fields' });
    }
    
    // Preserve the ID
    updatedInvitation.id = req.params.id;
    
    data.receivedInvitations[invitationIndex] = updatedInvitation;
    await writeInvitations(data);
    
    res.json(updatedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating received invitation', error: error.message });
  }
});

// PUT update status for any invitation type
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const data = await readInvitations();
    let foundInvitation = false;
    let updatedInvitation = null;
    
    // First check in sent invitations
    const sentIndex = data.sentInvitations.findIndex(inv => inv.id === id);
    if (sentIndex !== -1) {
      data.sentInvitations[sentIndex].status = status;
      updatedInvitation = data.sentInvitations[sentIndex];
      
      // Add message if provided
      if (message && message.trim() !== '') {
        if (!updatedInvitation.messages) {
          updatedInvitation.messages = [];
        }
        updatedInvitation.messages.push({
          text: message,
          sender: 'recipient',
          timestamp: new Date().toISOString()
        });
      }
      
      foundInvitation = true;
    }
    
    // If not found in sent, check in received
    if (!foundInvitation) {
      const receivedIndex = data.receivedInvitations.findIndex(inv => inv.id === id);
      if (receivedIndex !== -1) {
        data.receivedInvitations[receivedIndex].status = status;
        updatedInvitation = data.receivedInvitations[receivedIndex];
        
        // Add message if provided
        if (message && message.trim() !== '') {
          if (!updatedInvitation.messages) {
            updatedInvitation.messages = [];
          }
          updatedInvitation.messages.push({
            text: message,
            sender: 'you',
            timestamp: new Date().toISOString()
          });
        }
        
        foundInvitation = true;
      }
    }
    
    if (!foundInvitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    await writeInvitations(data);
    res.json(updatedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invitation status', error: error.message });
  }
});

// POST add message to invitation - works for both sent and received
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const message = req.body;
    
    if (!message.text || !message.sender) {
      return res.status(400).json({ message: 'Message text and sender are required' });
    }
    
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    
    const data = await readInvitations();
    let foundInvitation = false;
    
    // Check in sent invitations
    const sentIndex = data.sentInvitations.findIndex(inv => inv.id === id);
    if (sentIndex !== -1) {
      if (!data.sentInvitations[sentIndex].messages) {
        data.sentInvitations[sentIndex].messages = [];
      }
      data.sentInvitations[sentIndex].messages.push(message);
      foundInvitation = true;
    }
    
    // If not found in sent, check in received
    if (!foundInvitation) {
      const receivedIndex = data.receivedInvitations.findIndex(inv => inv.id === id);
      if (receivedIndex !== -1) {
        if (!data.receivedInvitations[receivedIndex].messages) {
          data.receivedInvitations[receivedIndex].messages = [];
        }
        data.receivedInvitations[receivedIndex].messages.push(message);
        foundInvitation = true;
      }
    }
    
    if (!foundInvitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    await writeInvitations(data);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message to invitation', error: error.message });
  }
});

// DELETE an invitation (works for both sent and received)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readInvitations();
    let deletedInvitation = null;
    
    // Try to delete from sent invitations
    const sentIndex = data.sentInvitations.findIndex(inv => inv.id === id);
    if (sentIndex !== -1) {
      deletedInvitation = data.sentInvitations.splice(sentIndex, 1)[0];
    } else {
      // If not in sent, try to delete from received invitations
      const receivedIndex = data.receivedInvitations.findIndex(inv => inv.id === id);
      if (receivedIndex !== -1) {
        deletedInvitation = data.receivedInvitations.splice(receivedIndex, 1)[0];
      }
    }
    
    if (!deletedInvitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }
    
    await writeInvitations(data);
    res.json(deletedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invitation', error: error.message });
  }
});

// Additional endpoints for backward compatibility
// DELETE sent invitation
router.delete('/sent/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.sentInvitations.findIndex(inv => inv.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Sent invitation not found' });
    }
    
    const deletedInvitation = data.sentInvitations.splice(invitationIndex, 1)[0];
    await writeInvitations(data);
    
    res.json(deletedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting sent invitation', error: error.message });
  }
});

// DELETE received invitation
router.delete('/received/:id', async (req, res) => {
  try {
    const data = await readInvitations();
    const invitationIndex = data.receivedInvitations.findIndex(inv => inv.id === req.params.id);
    
    if (invitationIndex === -1) {
      return res.status(404).json({ message: 'Received invitation not found' });
    }
    
    const deletedInvitation = data.receivedInvitations.splice(invitationIndex, 1)[0];
    await writeInvitations(data);
    
    res.json(deletedInvitation);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting received invitation', error: error.message });
  }
});

module.exports = router;
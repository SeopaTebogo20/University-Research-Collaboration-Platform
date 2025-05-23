const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Generate a new received invitation ID
async function generateRinvitationsId() {
  try {
    const { data: received_invitations, error } = await supabase
      .from('received_invitations')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (received_invitations && received_invitations.length > 0) {
      const lastId = received_invitations[0].id;
      const numericPart = parseInt(lastId.replace('RIV', ''));
      return `RIV${String(numericPart + 1).padStart(3, '0')}`;
    } else {
      return 'RIV001';
    }
  } catch (error) {
    console.error('Error generating received invitations ID:', error);
    throw error;
  }
}

// GET all received_invitations
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all received_invitations`);
    
    const { data: received_invitations, error } = await supabase
      .from('received_invitations')
      .select('*')
      .order('invited_date', { descending: false });
    
    if (error) throw error;
    
    res.json(received_invitations);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching received_invitations: ${error.message}`);
    res.status(500).json({ message: 'Error fetching received_invitations', error: error.message });
  }
});

// GET single received_invitations by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching received_invitations with ID: ${req.params.id}`);
    
    const { data: received_invitations, error } = await supabase
      .from('received_invitations')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.message.includes('No rows found')) {
        return res.status(404).json({ message: 'received_invitations not found' });
      }
      throw error;
    }
    
    if (!received_invitations) {
      return res.status(404).json({ message: 'received_invitations not found' });
    }
    
    res.json(received_invitations);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching received_invitations: ${error.message}`);
    res.status(500).json({ message: 'Error fetching received_invitations', error: error.message });
  }
}); 

// POST create new received_invitations
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new received_invitations`);
    
    const newRecInv = req.body;
    
    if (!newRecInv.invitedByTitle || !newRecInv.description || !newRecInv.key_research_area) {
      return res.status(400).json({ message: 'Missing required received invitations' });
    }
    
    if (!newRecInv.id) {
      newRecInv.id = await generateRinvitationsId();
    }
    
    if (!newRecInv.invitedByName) {
      newRecInv.invitedByName = "Dr. Sarah Johnson";
    }
    if (!newRecInv.invitedByEmail) {
      newRecInv.invitedByEmail = "245@wits.ac.za";
    }

    const { data: createdreceived_invitations, error } = await supabase
      .from('received_invitations')
      .insert([newRecInv])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] received_invitations created successfully with ID: ${createdreceived_invitations.id}`);
    res.status(201).json(createdreceived_invitations);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating received_invitations: ${error.message}`);
    res.status(500).json({ message: 'Error creating received_invitations', error: error.message });
  }
});

// PUT update existing received_invitations
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating received_invitations with ID: ${req.params.id}`);
    
    // First get the existing invitation to find the corresponding sent invitation
    const { data: existingInvitation, error: fetchError } = await supabase
      .from('received_invitations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !existingInvitation) {
      return res.status(404).json({ message: 'received_invitations not found' });
    }

    // For status updates (accept/decline)
    if (req.body.status) {
      // Update the received invitation
      const { data: updatedReceived, error: updateReceivedError } = await supabase
        .from('received_invitations')
        .update({ 
          status: req.body.status,
          ...(req.body.messages && { messages: req.body.messages })
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (updateReceivedError) throw updateReceivedError;

      // Find and update the corresponding sent invitation
      // We need to match based on projectId and recipient email
      const { data: sentInvitation, error: findSentError } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('projectId', existingInvitation.projectId)
        .eq('email', existingInvitation.recipientEmail) // Assuming you have recipientEmail in received_invitations
        .single();

      if (!findSentError && sentInvitation) {
        // Update the sent invitation with the same status and message
        const sentMessages = sentInvitation.messages ? JSON.parse(sentInvitation.messages) : [];
        
        if (req.body.messages) {
          const newMessages = JSON.parse(req.body.messages);
          sentMessages.push(...newMessages);
        }

        const { error: updateSentError } = await supabase
          .from('project_invitations')
          .update({ 
            status: req.body.status,
            messages: JSON.stringify(sentMessages)
          })
          .eq('id', sentInvitation.id);

        if (updateSentError) {
          console.error('Error updating sent invitation:', updateSentError);
          // Don't fail the whole request if sent invitation update fails
        }
      }

      return res.json(updatedReceived);
    }

    // For full updates, validate required fields
    if (!req.body.invitedByTitle || !req.body.description || !req.body.key_research_area) {
      return res.status(400).json({ message: 'Missing required received_invitations details' });
    }

    // Full update (non-status changes)
    const { data: updatedData, error } = await supabase
      .from('received_invitations')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] received_invitations updated successfully: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating received_invitations: ${error.message}`);
    res.status(500).json({ message: 'Error updating received_invitations', error: error.message });
  }
});

// DELETE a received_invitations
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting received_invitations with ID: ${req.params.id}`);
    
    const { data: existingreceived_invitations, error: checkError } = await supabase
      .from('received_invitations')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingreceived_invitations) {
      return res.status(404).json({ message: 'received_invitations not found' });
    }
    
    const { error } = await supabase
      .from('received_invitations')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] received_invitations deleted successfully: ${req.params.id}`);
    res.json(existingreceived_invitations);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting received_invitations: ${error.message}`);
    res.status(500).json({ message: 'Error deleting received_invitations', error: error.message });
  }
});

module.exports = router;
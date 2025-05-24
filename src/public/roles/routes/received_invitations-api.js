const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create client for admin operations (server-side only)
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
    // Get all received_invitations
    const { data: received_invitations, error } = await supabase
      .from('received_invitations')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (received_invitations && received_invitations.length > 0) {
      // Extract the numeric part of the last ID (assuming format is RINV001, RINV002, etc.)
      const lastId = received_invitations[0].id;
      const numericPart = parseInt(lastId.replace('RIV', ''));
      return `RIV${String(numericPart + 1).padStart(3, '0')}`;
    } else {
      // If no received_invitations exist yet, start with RIV001
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
      
      // Get all received_invitations from Supabase
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
      
      // Get received_invitations by ID from Supabase
      const { data: received_invitations, error } = await supabase
        .from('received_invitations')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (error) {
        // If the error is 'No rows found', return 404
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
      
      // Extract received_invitations data from request body
      const newRecInv = req.body;
      
      // Validate required fields
      if (!newRecInv.invitedByTitle || !newRecInv.description || !newRecInv.key_research_area) {
        return res.status(400).json({ message: 'Missing required received invitations' });
      }
      
      // Generate new received_invitations ID if not provided
      if (!newRecInv.id) {
        newRecInv.id = await generateRinvitationsId();
      }
      
      // Set default values if not provided
      if (!newRecInv.invitedByName) {
        newRecInv.invitedByName = "Dr. Sarah Johnson";
      }
      if (!newRecInv.invitedByEmail) {
        newRecInv.invitedByEmail = "245@wits.ac.za";
      }
      // Set default status if not provided
      if (!newRecInv.status) {
        newRecInv.status = "pending"; // or whatever your default status should be
      }
      // Validate status value
      if (newRecInv.status && !["pending", "accepted", "declined"].includes(newRecInv.status)) {
        return res.status(400).json({ message: 'Invalid status value. Must be "pending", "accepted", or "declined"' });
      }
      
      // Insert received_invitations into Supabase
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
      
      // Extract received_invitations data from request body
      const updatedreceived_invitations = req.body;
      
      // Validate required fields
      if (!updatedreceived_invitations.invitedByTitle || !updatedreceived_invitations.description || !updatedreceived_invitations.key_research_area) {
        return res.status(400).json({ message: 'Missing required received_invitations details' });
      }
      
      // Check if received_invitations exists
      const { data: existingreceived_invitations, error: checkError } = await supabase
        .from('received_invitations')
        .select('id')
        .eq('id', req.params.id)
        .single();
      
      if (checkError || !existingreceived_invitations) {
        return res.status(404).json({ message: 'received_invitations not found' });
      }
      
      // Update received_invitations in Supabase
      const { data: updatedData, error } = await supabase
        .from('received_invitations')
        .update(updatedreceived_invitations)
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
      
      // Check if received_invitations exists
      const { data: existingreceived_invitations, error: checkError } = await supabase
        .from('received_invitations')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (checkError || !existingreceived_invitations) {
        return res.status(404).json({ message: 'received_invitations not found' });
      }
      
      // Delete received_invitations from Supabase
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
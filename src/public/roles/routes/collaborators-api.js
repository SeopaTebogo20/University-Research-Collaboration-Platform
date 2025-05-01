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

// GET all collaborators
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all collaborators`);
    
    // Process query parameters for filtering
    const { institution, isRecommended, search } = req.query;
    
    // Start building the query
    let query = supabase.from('collaborators').select('*');
    
    // Apply filters if they exist
    if (institution && institution !== 'all') {
      query = query.eq('institution', institution);
    }
    
    if (isRecommended && isRecommended !== 'all') {
      query = query.eq('isRecommended', isRecommended);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,institution.ilike.%${search}%`);
    }
    
    // Execute the query
    const { data: collaborators, error } = await query;
    
    if (error) throw error;
    
    res.json(collaborators);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching collaborators: ${error.message}`);
    res.status(500).json({ message: 'Error fetching collaborators', error: error.message });
  }
});

// GET a single collaborator by ID
router.get('/:id', async (req, res) => {
  try {
    const collaboratorId = req.params.id.trim();
    console.log(`[${new Date().toISOString()}] Fetching collaborator with ID: ${collaboratorId}`);
    
    // Modified query to handle potential whitespace and newline characters
    const { data: collaborators, error } = await supabase
      .from('collaborators')
      .select('*')
      .ilike('id', `%${collaboratorId}%`);
    
    if (error) throw error;
    
    if (!collaborators || collaborators.length === 0) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    // Return the first match if multiple are found
    const collaborator = collaborators[0];
    res.json(collaborator);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching collaborator: ${error.message}`);
    res.status(500).json({ message: 'Error fetching collaborator', error: error.message });
  }
});
// POST create a new collaborator
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new collaborator`);
    
    // Extract collaborator data from request body
    const newCollaborator = req.body;
    
    // Validate required fields
    if (!newCollaborator.name || !newCollaborator.email || !newCollaborator.institution) {
      return res.status(400).json({ message: 'Missing required collaborator details' });
    }
    
    // Create collaborator in Supabase
    const { data, error } = await supabase
      .from('collaborators')
      .insert([newCollaborator])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator created successfully: ${data.id}`);
    res.status(201).json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating collaborator: ${error.message}`);
    res.status(500).json({ message: 'Error creating collaborator', error: error.message });
  }
});

// PUT update existing collaborator
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating collaborator with ID: ${req.params.id}`);
    
    // Extract collaborator data from request body
    const updatedCollaborator = req.body;
    
    // Validate required fields
    if (!updatedCollaborator.name || !updatedCollaborator.email || !updatedCollaborator.institution) {
      return res.status(400).json({ message: 'Missing required collaborator details' });
    }
    
    // Check if collaborator exists
    const { data: existingCollaborator, error: checkError } = await supabase
      .from('collaborators')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingCollaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    // Update collaborator in Supabase
    const { data: updatedData, error } = await supabase
      .from('collaborators')
      .update(updatedCollaborator)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator updated successfully: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating collaborator: ${error.message}`);
    res.status(500).json({ message: 'Error updating collaborator', error: error.message });
  }
});

// PATCH update collaborator recommendation status
router.patch('/:id/recommend', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating recommendation status for collaborator ID: ${req.params.id}`);
    
    const { isRecommended } = req.body;
    
    if (isRecommended === undefined) {
      return res.status(400).json({ message: 'isRecommended value is required' });
    }
    
    // Update only the isRecommended field
    const { data, error } = await supabase
      .from('collaborators')
      .update({ isRecommended })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator recommendation status updated successfully: ${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating collaborator recommendation status: ${error.message}`);
    res.status(500).json({ message: 'Error updating collaborator recommendation status', error: error.message });
  }
});

// PATCH update collaborator isCollaborator status
router.patch('/:id/status', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating collaborator status for ID: ${req.params.id}`);
    
    const { isCollaborator } = req.body;
    
    if (isCollaborator === undefined) {
      return res.status(400).json({ message: 'isCollaborator value is required' });
    }
    
    // Update only the isCollaborator field
    const { data, error } = await supabase
      .from('collaborators')
      .update({ isCollaborator })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator status updated successfully: ${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating collaborator status: ${error.message}`);
    res.status(500).json({ message: 'Error updating collaborator status', error: error.message });
  }
});

// DELETE a collaborator
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting collaborator with ID: ${req.params.id}`);
    
    // Check if collaborator exists
    const { data: existingCollaborator, error: checkError } = await supabase
      .from('collaborators')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingCollaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    // Delete collaborator from Supabase
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator deleted successfully: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting collaborator: ${error.message}`);
    res.status(500).json({ message: 'Error deleting collaborator', error: error.message });
  }
});

// GET collaborators by institution
router.get('/institution/:institution', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching collaborators by institution: ${req.params.institution}`);
    
    const { data: collaborators, error } = await supabase
      .from('collaborators')
      .select('*')
      .eq('institution', req.params.institution);
    
    if (error) throw error;
    
    res.json(collaborators);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching collaborators by institution: ${error.message}`);
    res.status(500).json({ message: 'Error fetching collaborators by institution', error: error.message });
  }
});

// GET all institutions (distinct)
router.get('/institutions', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching distinct institutions`);
    
    // Get all collaborators
    const { data: collaborators, error } = await supabase
      .from('collaborators')
      .select('institution');
    
    if (error) throw error;
    
    // Extract unique institutions
    const institutions = [...new Set(collaborators.map(c => c.institution))].filter(Boolean);
    
    res.json(institutions);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching institutions: ${error.message}`);
    res.status(500).json({ message: 'Error fetching institutions', error: error.message });
  }
});

// PATCH update collaborator isSameField status
router.patch('/:id/samefield', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating same field status for collaborator ID: ${req.params.id}`);
    
    const { isSameField } = req.body;
    
    if (isSameField === undefined) {
      return res.status(400).json({ message: 'isSameField value is required' });
    }
    
    // Update only the isSameField field
    const { data, error } = await supabase
      .from('collaborators')
      .update({ isSameField })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator same field status updated successfully: ${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating collaborator same field status: ${error.message}`);
    res.status(500).json({ message: 'Error updating collaborator same field status', error: error.message });
  }
});

// PATCH update collaborator isSameInstitution status
router.patch('/:id/institution', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating same institution status for collaborator ID: ${req.params.id}`);
    
    const { isSameInstitution } = req.body;
    
    if (isSameInstitution === undefined) {
      return res.status(400).json({ message: 'isSameInstitution value is required' });
    }
    
    // Update only the isSameInstitution field
    const { data, error } = await supabase
      .from('collaborators')
      .update({ isSameInstitution })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Collaborator same institution status updated successfully: ${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating collaborator same institution status: ${error.message}`);
    res.status(500).json({ message: 'Error updating collaborator same institution status', error: error.message });
  }
});

module.exports = router;

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
 


 

// Generate a new sent invitation ID
 

async function generateSentInvitationId() {
 

  try {
 

    // Get all project_invitations
 

    const { data: project_invitations, error } = await supabase
 

      .from('project_invitations')
 

      .select('id')
 

      .order('id', { ascending: false })
 

      .limit(1);
 

    
 

    if (error) throw error;
 

    
 

    if (project_invitations && project_invitations.length > 0) {
 

      // Extract the numeric part of the last ID (assuming format is PINV001, PINV002, etc.)
 

      const lastId = project_invitations[0].id;
 

      const numericPart = parseInt(lastId.replace('PINV', ''));
 

      return `PINV${String(numericPart + 1).padStart(3, '0')}`;
 

    } else {
 

      // If no project_invitations exist yet, start with PINV001
 

      return 'PINV001';
 

    }
 

  } catch (error) {
 

    console.error('Error generating project invitations ID:', error);
 

    throw error;
 

  }
 

}
 


 

// GET all project_invitations
 

router.get('/', async (req, res) => {
 

  try {
 

    console.log(`[${new Date().toISOString()}] Fetching all project_invitations`);
 

    
 

    // Get all project_invitations from Supabase
 

    const { data: project_invitations, error } = await supabase
 

      .from('project_invitations')
 

      .select('*')
 

      .order('created_at', { descending: false });
 

    
 

    if (error) throw error;
 

    
 

    res.json(project_invitations);
 

  } catch (error) {
 

    console.error(`[${new Date().toISOString()}] Error fetching project_invitations: ${error.message}`);
 

    res.status(500).json({ message: 'Error fetching project_invitations', error: error.message });
 

  }
 

});
 


 

// GET single project_invitation by ID
 

router.get('/:id', async (req, res) => {
 

  try {
 

    console.log(`[${new Date().toISOString()}] Fetching project_invitation with ID: ${req.params.id}`);
 

    
 

    // Get project_invitation by ID from Supabase
 

    const { data: project_invitation, error } = await supabase
 

      .from('project_invitations')
 

      .select('*')
 

      .eq('id', req.params.id)
 

      .single();
 

    
 

    if (error) {
 

      // If the error is 'No rows found', return 404
 

      if (error.message.includes('No rows found')) {
 

        return res.status(404).json({ message: 'Project invitation not found' });
 

      }
 

      throw error;
 

    }
 

    
 

    if (!project_invitation) {
 

      return res.status(404).json({ message: 'Project invitation not found' });
 

    }
 

    
 

    res.json(project_invitation);
 

  } catch (error) {
 

    console.error(`[${new Date().toISOString()}] Error fetching project_invitation: ${error.message}`);
 

    res.status(500).json({ message: 'Error fetching project_invitation', error: error.message });
 

  }
 

});
 


 

// POST create new project_invitation
 

router.post('/', async (req, res) => {
 

  try {
 

    console.log(`[${new Date().toISOString()}] Creating new project_invitation`);
 

    
 

    // Extract project_invitation data from request body
 

    const newProjectInvitation = req.body;
 

    
 

    // Validate required fields
 

    if (!newProjectInvitation.projectId || !newProjectInvitation.description || !newProjectInvitation.key_research_area) {
 

      return res.status(400).json({ message: 'Missing required project invitation details' });
 

    }
 

    
 

    // Generate new project_invitation ID if not provided
 

    if (!newProjectInvitation.id) {
 

      newProjectInvitation.id = await generateSentInvitationId();
 

    }
 

    
 

    // Set created_at if not provided
 

    if (!newProjectInvitation.created_at) {
 

      newProjectInvitation.created_at = new Date().toISOString();
 

    }
 

    
 

    // Insert project_invitation into Supabase
 

    const { data: createdProjectInvitation, error } = await supabase
 

      .from('project_invitations')
 

      .insert([newProjectInvitation])
 

      .select()
 

      .single();
 

    
 

    if (error) throw error;
 

    
 

    console.log(`[${new Date().toISOString()}] Project invitation created successfully with ID: ${createdProjectInvitation.id}`);
 

    res.status(201).json(createdProjectInvitation);
 

  } catch (error) {
 

    console.error(`[${new Date().toISOString()}] Error creating project_invitation: ${error.message}`);
 

    res.status(500).json({ message: 'Error creating project_invitation', error: error.message });
 

  }
 

});
 


 

// PUT update existing project_invitation
 

router.put('/:id', async (req, res) => {
 

  try {
 

    console.log(`[${new Date().toISOString()}] Updating project_invitation with ID: ${req.params.id}`);
 

    
 

    // Extract project_invitation data from request body
 

    const updatedProjectInvitation = req.body;
 

    
 

    // Validate required fields
 

    if (!updatedProjectInvitation.projectId || !updatedProjectInvitation.description || !updatedProjectInvitation.key_research_area) {
 

      return res.status(400).json({ message: 'Missing required project invitation details' });
 

    }
 

    
 

    // Check if project_invitation exists
 

    const { data: existingProjectInvitation, error: checkError } = await supabase
 

      .from('project_invitations')
 

      .select('id')
 

      .eq('id', req.params.id)
 

      .single();
 

    
 

    if (checkError || !existingProjectInvitation) {
 

      return res.status(404).json({ message: 'Project invitation not found' });
 

    }
 

    
 

    // Update project_invitation in Supabase
 

    const { data: updatedData, error } = await supabase
 

      .from('project_invitations')
 

      .update(updatedProjectInvitation)
 

      .eq('id', req.params.id)
 

      .select()
 

      .single();
 

    
 

    if (error) throw error;
 

    
 

    console.log(`[${new Date().toISOString()}] Project invitation updated successfully: ${req.params.id}`);
 

    res.json(updatedData);
 

  } catch (error) {
 

    console.error(`[${new Date().toISOString()}] Error updating project_invitation: ${error.message}`);
 

    res.status(500).json({ message: 'Error updating project_invitation', error: error.message });
 

  }
 

});
 


 

// DELETE a project_invitation
 

router.delete('/:id', async (req, res) => {
 

  try {
 

    console.log(`[${new Date().toISOString()}] Deleting project_invitation with ID: ${req.params.id}`);
 

    
 

    // Check if project_invitation exists
 

    const { data: existingProjectInvitation, error: checkError } = await supabase
 

      .from('project_invitations')
 

      .select('*')
 

      .eq('id', req.params.id)
 

      .single();
 

    
 

    if (checkError || !existingProjectInvitation) {
 

      return res.status(404).json({ message: 'Project invitation not found' });
 

    }
 

    
 

    // Delete project_invitation from Supabase
 

    const { error } = await supabase
 

      .from('project_invitations')
 

      .delete()
 

      .eq('id', req.params.id);
 

    
 

    if (error) throw error;
 

    
 

    console.log(`[${new Date().toISOString()}] Project invitation deleted successfully: ${req.params.id}`);
 

    res.json(existingProjectInvitation);
 

  } catch (error) {
 

    console.error(`[${new Date().toISOString()}] Error deleting project_invitation: ${error.message}`);
 

    res.status(500).json({ message: 'Error deleting project_invitation', error: error.message });
 

  }
 

});
 


 

module.exports = router;
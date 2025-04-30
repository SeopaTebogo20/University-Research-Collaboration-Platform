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

// Generate a new project ID
async function generateProposalId() {
    try {
      // Get all projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (projects && projects.length > 0) {
        // Extract the numeric part of the last ID (assuming format is PRJ001, PRJ002, etc.)
        const lastId = projects[0].id;
        const numericPart = parseInt(lastId.replace('PRP', ''));
        return `PRP${String(numericPart + 1).padStart(3, '0')}`;
      } else {
        // If no projects exist yet, start with PRJ001
        return 'PRP001';
      }
    } catch (error) {
      console.error('Error generating proposal ID:', error);
      throw error;
    }
  }

  // GET all proposal;
router.get('/', async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Fetching all proposal`);
      
      // Get all projects from Supabase
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { descending: false });
      
      if (error) throw error;
      
      res.json(projects);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching projects: ${error.message}`);
      res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
  });


// PUT update existing project
router.put('/:id', async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Updating proposal with ID: ${req.params.id}`);
      
      // Extract project data from request body
      const updatedProject = req.body;
      
      // Validate required fields
      if (!updatedProject.project_title || !updatedProject.description || !updatedProject.key_research_area) {
        return res.status(400).json({ message: 'Missing required proposal details' });
      }
      
      // Check if project exists
      const { data: existingProject, error: checkError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', req.params.id)
        .single();
      
      if (checkError || !existingProject) {
        return res.status(404).json({ message: 'Proposal not found' });
      }
      
      // Update project in Supabase
      const { data: updatedData, error } = await supabase
        .from('projects')
        .update(updatedProject)
        .eq('id', req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`[${new Date().toISOString()}] Proposal updated successfully: ${req.params.id}`);
      res.json(updatedData);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating proposal: ${error.message}`);
      res.status(500).json({ message: 'Error updating proposal', error: error.message });
    }
  });

  module.exports = router;
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

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

// Generate a unique project ID with timestamp and random components
async function generateProjectId() {
  try {
    // Get current date/time components
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Generate a random string component
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Generate a UUID and take first 6 characters
    const uuidComponent = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase();
    
    // Combine all components to create a unique ID
    const projectId = `PRJ-${day}-${hours}`;
    
    // Verify uniqueness in database (though collision is extremely unlikely)
    const { data: existingProject, error } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (existingProject) {
      // If by some miracle this ID exists, recursively generate a new one
      console.warn(`[${new Date().toISOString()}] ID collision detected for ${projectId}, generating new ID`);
      return await generateProjectId();
    }
    
    return projectId;
  } catch (error) {
    console.error('Error generating project ID:', error);
    throw error;
  }
}

// GET all projects
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all projects`);
    
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

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching project with ID: ${req.params.id}`);
    
    // Get project by ID from Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      // If the error is 'No rows found', return 404
      if (error.message.includes('No rows found')) {
        return res.status(404).json({ message: 'Project not found' });
      }
      throw error;
    }
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching project: ${error.message}`);
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// POST create new project
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new project`);
    
    // Extract project data from request body
    const newProject = req.body;
    
    // Validate required fields
    if (!newProject.project_title || !newProject.description || !newProject.key_research_area) {
      return res.status(400).json({ message: 'Missing required project details' });
    }
    
    // Generate new project ID if not provided
    if (!newProject.id) {
      newProject.id = await generateProjectId();
    }
    
    // Set default values if not provided
    if (!newProject.researcher_name) {
      newProject.researcher_name = "Dr. Sarah Johnson";
    }
    if (!newProject.start_date) {
      newProject.start_date = new Date().toISOString().split('T')[0];
    }
    if (!newProject.end_date) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      newProject.end_date = endDate.toISOString().split('T')[0];
    }
    if (newProject.funding_available === undefined) {
      newProject.funding_available = false;
    }
    if (!newProject.experience_level) {
      newProject.experience_level = 'Intermediate';
    }
    
    // Insert project into Supabase
    const { data: createdProject, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Project created successfully with ID: ${createdProject.id}`);
    res.status(201).json(createdProject);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating project: ${error.message}`);
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// PUT update existing project
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating project with ID: ${req.params.id}`);
    
    // Extract project data from request body
    const updatedProject = req.body;
    
    // Validate required fields
    if (!updatedProject.project_title || !updatedProject.description || !updatedProject.key_research_area) {
      return res.status(400).json({ message: 'Missing required project details' });
    }
    
    // Check if project exists
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Update project in Supabase
    const { data: updatedData, error } = await supabase
      .from('projects')
      .update(updatedProject)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Project updated successfully: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating project: ${error.message}`);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// DELETE a project
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting project with ID: ${req.params.id}`);
    
    // Check if project exists
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete project from Supabase
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Project deleted successfully: ${req.params.id}`);
    res.json(existingProject);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting project: ${error.message}`);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// GET projects by researcher_name
router.get('/researcher/:name', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching projects for researcher: ${req.params.name}`);
    
    // Get projects by researcher name from Supabase
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .ilike('researcher_name', `%${req.params.name}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(projects);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching researcher projects: ${error.message}`);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// GET projects by research area
router.get('/research-area/:area', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching projects for research area: ${req.params.area}`);
    
    // Get projects by research area from Supabase
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .ilike('key_research_area', `%${req.params.area}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(projects);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching research area projects: ${error.message}`);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

module.exports = router;
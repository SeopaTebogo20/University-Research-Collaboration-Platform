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

// GET all projects
router.get('/', async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Fetching all users`);
      
      // Get all projects from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { descending: false });
      
      if (error) throw error;
      
      res.json(profiles);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching users: ${error.message}`);
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  });

  // PUT update existing project
router.put('/:id', async (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Updating users with ID: ${req.params.id}`);
      
      // Extract project data from request body
      const updatedProfile = req.body;
      
      // Validate required fields
      if (!updatedProfile.name || !updatedProfile.role || !updatedProfile.department) {
        return res.status(400).json({ message: 'Missing required user details' });
      }
      
      // Check if project exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', req.params.id)
        .single();
      
      if (checkError || !existingProfile) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Update project in Supabase
      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', req.params.id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`[${new Date().toISOString()}] User updated successfully: ${req.params.id}`);
      res.json(updatedData);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error updating User: ${error.message}`);
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  });

  module.exports = router;
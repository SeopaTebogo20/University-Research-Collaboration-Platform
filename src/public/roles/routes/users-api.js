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

// GET all users
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all users`);
    
    // Process query parameters for filtering
    const { role, 'promoted-role': promotedRole, search } = req.query;
    
    // Start building the query
    let query = supabase.from('profiles').select('*');
    
    // Apply filters if they exist
    if (role && role !== 'all') {
      query = query.eq('role', role);
    }
    
    if (promotedRole && promotedRole !== 'all') {
      query = query.eq('promoted-role', promotedRole);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Execute the query with ordering
    const { data: profiles, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(profiles);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching users: ${error.message}`);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET a single user by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching user with ID: ${req.params.id}`);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching user: ${error.message}`);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// PUT update existing user
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating user with ID: ${req.params.id}`);
    
    // Extract user data from request body
    const updatedProfile = req.body;
    
    // Validate required fields
    if (!updatedProfile.name || !updatedProfile.email || !updatedProfile.role) {
      return res.status(400).json({ message: 'Missing required user details' });
    }
    
    // Check if user exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingProfile) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user in Supabase
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
    console.error(`[${new Date().toISOString()}] Error updating user: ${error.message}`);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// PATCH update user status
router.patch('/:id/status', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating status for user ID: ${req.params.id}`);
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    // Update only the status field
    const { data, error } = await supabase
      .from('profiles')
      .update({ 'promoted-role': status })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] User status updated successfully: ${req.params.id}`);
    res.json(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating user status: ${error.message}`);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

module.exports = router;
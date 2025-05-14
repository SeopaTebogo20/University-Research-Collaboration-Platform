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

// GET all funding records
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all funding records`);
    
    let query = supabase.from('funding').select('*');
    
    // Filter by project_id if provided
    if (req.query.project_id) {
      query = query.eq('project_id', req.query.project_id);
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }
    
    // Order by creation date
    query = query.order('created_at', { ascending: false });
    
    const { data: fundingRecords, error } = await query;
    
    if (error) throw error;
    
    res.json(fundingRecords);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching funding records: ${error.message}`);
    res.status(500).json({ message: 'Error fetching funding records', error: error.message });
  }
});

// GET single funding record by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching funding record with ID: ${req.params.id}`);
    
    const { data: fundingRecord, error } = await supabase
      .from('funding')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      if (error.message.includes('No rows found')) {
        return res.status(404).json({ message: 'Funding record not found' });
      }
      throw error;
    }
    
    if (!fundingRecord) {
      return res.status(404).json({ message: 'Funding record not found' });
    }
    
    res.json(fundingRecord);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching funding record: ${error.message}`);
    res.status(500).json({ message: 'Error fetching funding record', error: error.message });
  }
});

// POST create new funding record
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new funding record`);
    
    const newFunding = req.body;
    
    // Validate required fields
    if (!newFunding.project_id || !newFunding.title || !newFunding.funder || 
        !newFunding.total_amount || !newFunding.expiration_date) {
      return res.status(400).json({ message: 'Missing required funding details' });
    }
    
    // Insert funding record into Supabase
    const { data: createdFunding, error } = await supabase
      .from('funding')
      .insert([newFunding])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Funding record created successfully with ID: ${createdFunding.id}`);
    res.status(201).json(createdFunding);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating funding record: ${error.message}`);
    res.status(500).json({ message: 'Error creating funding record', error: error.message });
  }
});

// PUT update existing funding record
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating funding record with ID: ${req.params.id}`);
    
    const updatedFunding = req.body;
    
    // Validate required fields
    if (!updatedFunding.project_id || !updatedFunding.title || !updatedFunding.funder || 
        !updatedFunding.total_amount || !updatedFunding.expiration_date) {
      return res.status(400).json({ message: 'Missing required funding details' });
    }
    
    // Check if funding record exists
    const { data: existingFunding, error: checkError } = await supabase
      .from('funding')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingFunding) {
      return res.status(404).json({ message: 'Funding record not found' });
    }
    
    // Update funding record in Supabase
    const { data: updatedRecord, error } = await supabase
      .from('funding')
      .update(updatedFunding)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Funding record updated successfully: ${req.params.id}`);
    res.json(updatedRecord);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating funding record: ${error.message}`);
    res.status(500).json({ message: 'Error updating funding record', error: error.message });
  }
});

// DELETE a funding record
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting funding record with ID: ${req.params.id}`);
    
    // Check if funding record exists
    const { data: existingFunding, error: checkError } = await supabase
      .from('funding')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingFunding) {
      return res.status(404).json({ message: 'Funding record not found' });
    }
    
    // Delete funding record from Supabase
    const { error } = await supabase
      .from('funding')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Funding record deleted successfully: ${req.params.id}`);
    res.json(existingFunding);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting funding record: ${error.message}`);
    res.status(500).json({ message: 'Error deleting funding record', error: error.message });
  }
});

// GET summary of funding by project with aggregated data
router.get('/summary/projects', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching funding summary by projects`);
    
    // First get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, project_title');
    
    if (projectsError) throw projectsError;
    
    // For each project, get funding summary
    const projectSummaries = await Promise.all(projects.map(async (project) => {
      const { data: fundingRecords, error: fundingError } = await supabase
        .from('funding')
        .select('*')
        .eq('project_id', project.id);
      
      if (fundingError) throw fundingError;
      
      // Calculate total funding, spent, and remaining for the project
      const totalFunding = fundingRecords.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
      const totalSpent = fundingRecords.reduce((sum, record) => sum + parseFloat(record.amount_spent), 0);
      const totalRemaining = totalFunding - totalSpent;
      
      return {
        project_id: project.id,
        project_title: project.project_title,
        funding_count: fundingRecords.length,
        total_funding: totalFunding,
        total_spent: totalSpent,
        total_remaining: totalRemaining,
        funding_records: fundingRecords
      };
    }));
    
    res.json(projectSummaries);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching funding summary: ${error.message}`);
    res.status(500).json({ message: 'Error fetching funding summary', error: error.message });
  }
});

module.exports = router;

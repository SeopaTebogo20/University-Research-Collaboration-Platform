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

// Generate a new assigned proposal ID
async function generateAssignedProposalId() {
  try {
    console.log('Generating new assigned proposal ID');
    
    // Get all assigned proposals
    const { data: proposals, error } = await supabase
      .from('assigned_proposals')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
    
    let newId = 'ASG001'; // Default starting ID
    
    if (proposals && proposals.length > 0) {
      // Extract the numeric part of the last ID (assuming format is ASG001, ASG002, etc.)
      const lastId = proposals[0].id;
      console.log('Last ID found:', lastId);
      
      if (lastId && lastId.startsWith('ASG')) {
        const numericPart = parseInt(lastId.replace('ASG', ''));
        if (!isNaN(numericPart)) {
          newId = `ASG${String(numericPart + 1).padStart(3, '0')}`;
        }
      }
    }
    
    console.log('Generated new ID:', newId);
    return newId;
  } catch (error) {
    console.error('Error generating assigned proposal ID:', error);
    // Return a fallback ID with timestamp to avoid null ID issues
    const timestamp = new Date().getTime().toString().slice(-6);
    const fallbackId = `ASG${timestamp}`;
    console.log('Using fallback ID:', fallbackId);
    return fallbackId;
  }
}

// GET all assigned proposals
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all assigned proposals`);
    
    // Get all assigned proposals from Supabase
    const { data: assignedProposals, error } = await supabase
      .from('assigned_proposals')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    res.json(assignedProposals);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching assigned proposals: ${error.message}`);
    res.status(500).json({ message: 'Error fetching assigned proposals', error: error.message });
  }
});

// GET single assigned proposal by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching assigned proposal with ID: ${req.params.id}`);
    
    // Get assigned proposal by ID from Supabase
    const { data: assignedProposal, error } = await supabase
      .from('assigned_proposals')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      // If the error is 'No rows found', return 404
      if (error.message.includes('No rows found')) {
        return res.status(404).json({ message: 'Assigned proposal not found' });
      }
      throw error;
    }
    
    if (!assignedProposal) {
      return res.status(404).json({ message: 'Assigned proposal not found' });
    }
    
    res.json(assignedProposal);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching assigned proposal: ${error.message}`);
    res.status(500).json({ message: 'Error fetching assigned proposal', error: error.message });
  }
});

// POST create new assigned proposal
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new assigned proposal`);
    
    // Extract assigned proposal data from request body
    const newAssignedProposal = req.body;
    
    // Validate required fields
    if (!newAssignedProposal.project_id || !newAssignedProposal.reviewerId || !newAssignedProposal.researcherId) {
      return res.status(400).json({ message: 'Missing required assigned proposal details' });
    }
    
    // Generate new assigned proposal ID - always generate a new ID to ensure it's not null
    const generatedId = await generateAssignedProposalId();
    console.log(`Generated ID: ${generatedId}`);
    newAssignedProposal.id = generatedId;
    
    // Set default values if not provided
    if (!newAssignedProposal.project_name && newAssignedProposal.project_id) {
      // Try to fetch project name from projects table
      try {
        const { data: project } = await supabase
          .from('projects')
          .select('project_title')
          .eq('id', newAssignedProposal.project_id)
          .single();
        
        if (project) {
          newAssignedProposal.project_name = project.project_title;
        }
      } catch (projectError) {
        console.warn(`Could not fetch project name: ${projectError.message}`);
      }
    }
    
    // Set default rating if not provided
    if (newAssignedProposal.rating === undefined) {
      newAssignedProposal.rating = null; // Rating might be added after review
    }
    
    console.log(`Creating assigned proposal with ID: ${newAssignedProposal.id}`);
    
    // Insert assigned proposal into Supabase
    const { data: createdAssignedProposal, error } = await supabase
      .from('assigned_proposals')
      .insert([newAssignedProposal])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Assigned proposal created successfully with ID: ${createdAssignedProposal.id}`);
    res.status(201).json(createdAssignedProposal);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating assigned proposal: ${error.message}`);
    res.status(500).json({ message: 'Error creating assigned proposal', error: error.message });
  }
});

// PUT update existing assigned proposal
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating assigned proposal with ID: ${req.params.id}`);
    
    // Extract assigned proposal data from request body
    const updatedAssignedProposal = req.body;
    
    // Check if assigned proposal exists
    const { data: existingAssignedProposal, error: checkError } = await supabase
      .from('assigned_proposals')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingAssignedProposal) {
      return res.status(404).json({ message: 'Assigned proposal not found' });
    }
    
    // Update assigned proposal in Supabase
    const { data: updatedData, error } = await supabase
      .from('assigned_proposals')
      .update(updatedAssignedProposal)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Assigned proposal updated successfully: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating assigned proposal: ${error.message}`);
    res.status(500).json({ message: 'Error updating assigned proposal', error: error.message });
  }
});

// DELETE an assigned proposal
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting assigned proposal with ID: ${req.params.id}`);
    
    // Check if assigned proposal exists
    const { data: existingAssignedProposal, error: checkError } = await supabase
      .from('assigned_proposals')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingAssignedProposal) {
      return res.status(404).json({ message: 'Assigned proposal not found' });
    }
    
    // Delete assigned proposal from Supabase
    const { error } = await supabase
      .from('assigned_proposals')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Assigned proposal deleted successfully: ${req.params.id}`);
    res.json(existingAssignedProposal);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting assigned proposal: ${error.message}`);
    res.status(500).json({ message: 'Error deleting assigned proposal', error: error.message });
  }
});

// GET assigned proposals by project_id
router.get('/project/:projectId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching assigned proposals for project: ${req.params.projectId}`);
    
    // Get assigned proposals by project ID from Supabase
    const { data: assignedProposals, error } = await supabase
      .from('assigned_proposals')
      .select('*')
      .eq('project_id', req.params.projectId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    res.json(assignedProposals);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching project assigned proposals: ${error.message}`);
    res.status(500).json({ message: 'Error fetching assigned proposals', error: error.message });
  }
});

// GET assigned proposals by reviewerId
router.get('/reviewer/:reviewerId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching assigned proposals for reviewer: ${req.params.reviewerId}`);
    
    // Get assigned proposals by reviewer ID from Supabase
    const { data: assignedProposals, error } = await supabase
      .from('assigned_proposals')
      .select('*')
      .eq('reviewerId', req.params.reviewerId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    res.json(assignedProposals);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching reviewer assigned proposals: ${error.message}`);
    res.status(500).json({ message: 'Error fetching assigned proposals', error: error.message });
  }
});

// GET assigned proposals by researcherId
router.get('/researcher/:researcherId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching assigned proposals for researcher: ${req.params.researcherId}`);
    
    // Get assigned proposals by researcher ID from Supabase
    const { data: assignedProposals, error } = await supabase
      .from('assigned_proposals')
      .select('*')
      .eq('researcherId', req.params.researcherId)
      .order('id', { ascending: true });
    
    if (error) throw error;
    
    res.json(assignedProposals);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching researcher assigned proposals: ${error.message}`);
    res.status(500).json({ message: 'Error fetching assigned proposals', error: error.message });
  }
});

// PUT update review details (rating and review_message)
router.put('/:id/review', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating review for assigned proposal with ID: ${req.params.id}`);
    
    // Extract review data from request body
    const { rating, review_message } = req.body;
    
    // Validate required fields
    if (rating === undefined || !review_message) {
      return res.status(400).json({ message: 'Missing required review details' });
    }
    
    // Check if assigned proposal exists
    const { data: existingAssignedProposal, error: checkError } = await supabase
      .from('assigned_proposals')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingAssignedProposal) {
      return res.status(404).json({ message: 'Assigned proposal not found' });
    }
    
    // Update review details in Supabase
    const { data: updatedData, error } = await supabase
      .from('assigned_proposals')
      .update({ rating, review_message })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Review updated successfully for assigned proposal: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating review: ${error.message}`);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

module.exports = router;
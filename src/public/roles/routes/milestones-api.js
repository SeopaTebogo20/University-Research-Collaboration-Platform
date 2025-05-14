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

// Generate a new milestone ID
async function generateMilestoneId() {
  try {
    // Get all milestones
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (milestones && milestones.length > 0) {
      // Extract the numeric part of the last ID (assuming format is MIL001, MIL002, etc.)
      const lastId = milestones[0].id;
      const numericPart = parseInt(lastId.replace('MIL', ''));
      return `MIL${String(numericPart + 1).padStart(3, '0')}`;
    } else {
      // If no milestones exist yet, start with MIL001
      return 'MIL001';
    }
  } catch (error) {
    console.error('Error generating milestone ID:', error);
    throw error;
  }
}

// Helper function to get assignee name from ID
async function getAssigneeName(assigneeId) {
  if (!assigneeId) return null;
  
  try {
    const { data, error } = await supabase
      .from('collaborators')
      .select('name')
      .eq('id', assigneeId)
      .single();
      
    if (error || !data) {
      console.error(`Error fetching assignee: ${error?.message || 'No data found'}`);
      return null;
    }
    
    return data.name || `User ${assigneeId}`;
  } catch (error) {
    console.error(`Error fetching assignee name: ${error.message}`);
    return null;
  }
}

// GET all milestones
router.get('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching all milestones`);
    
    // Get project_id from query parameter if provided
    const projectId = req.query.project_id;
    
    let query = supabase
      .from('milestones')
      .select('*')
      .order('start_date', { ascending: true });
      
    // If project_id is provided, filter by it
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data: milestones, error } = await query;
    
    if (error) throw error;
    
    res.json(milestones);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching milestones: ${error.message}`);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET single milestone by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching milestone with ID: ${req.params.id}`);
    
    // Get milestone by ID from Supabase
    const { data: milestone, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      // If the error is 'No rows found', return 404
      if (error.message.includes('No rows found')) {
        return res.status(404).json({ message: 'Milestone not found' });
      }
      throw error;
    }
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    res.json(milestone);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching milestone: ${error.message}`);
    res.status(500).json({ message: 'Error fetching milestone', error: error.message });
  }
});

// POST create new milestone
router.post('/', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating new milestone`);
    
    // Extract milestone data from request body
    const newMilestone = req.body;
    
    // Validate required fields
    if (!newMilestone.project_id || !newMilestone.title || !newMilestone.start_date || !newMilestone.end_date) {
      return res.status(400).json({ message: 'Missing required milestone details' });
    }
    
    // Generate new milestone ID if not provided
    if (!newMilestone.id) {
      newMilestone.id = await generateMilestoneId();
    }
    
    // Set default values if not provided
    if (!newMilestone.status) {
      newMilestone.status = 'pending';
    }
    
    // Get assignee name if assignee_id is provided
    if (newMilestone.assignee_id) {
      newMilestone.assignee_name = await getAssigneeName(newMilestone.assignee_id);
    }
    
    // Insert milestone into Supabase
    const { data: createdMilestone, error } = await supabase
      .from('milestones')
      .insert([newMilestone])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Milestone created successfully with ID: ${createdMilestone.id}`);
    res.status(201).json(createdMilestone);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating milestone: ${error.message}`);
    res.status(500).json({ message: 'Error creating milestone', error: error.message });
  }
});

// PUT update existing milestone
router.put('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating milestone with ID: ${req.params.id}`);
    
    // Extract milestone data from request body
    const updatedMilestone = req.body;
    
    // Validate required fields
    if (!updatedMilestone.project_id || !updatedMilestone.title || !updatedMilestone.start_date || !updatedMilestone.end_date) {
      return res.status(400).json({ message: 'Missing required milestone details' });
    }
    
    // Check if milestone exists
    const { data: existingMilestone, error: checkError } = await supabase
      .from('milestones')
      .select('id')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingMilestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Get assignee name if assignee_id is provided
    if (updatedMilestone.assignee_id) {
      updatedMilestone.assignee_name = await getAssigneeName(updatedMilestone.assignee_id);
    }
    
    // Update milestone in Supabase
    const { data: updatedData, error } = await supabase
      .from('milestones')
      .update(updatedMilestone)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Milestone updated successfully: ${req.params.id}`);
    res.json(updatedData);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating milestone: ${error.message}`);
    res.status(500).json({ message: 'Error updating milestone', error: error.message });
  }
});

// DELETE a milestone
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting milestone with ID: ${req.params.id}`);
    
    // Check if milestone exists
    const { data: existingMilestone, error: checkError } = await supabase
      .from('milestones')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingMilestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Delete milestone from Supabase
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    console.log(`[${new Date().toISOString()}] Milestone deleted successfully: ${req.params.id}`);
    res.json(existingMilestone);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting milestone: ${error.message}`);
    res.status(500).json({ message: 'Error deleting milestone', error: error.message });
  }
});

// GET milestones by project_id
router.get('/project/:projectId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching milestones for project: ${req.params.projectId}`);
    
    // Get milestones by project_id from Supabase
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', req.params.projectId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(milestones);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching project milestones: ${error.message}`);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET milestones by assignee_id
router.get('/assignee/:assigneeId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching milestones for assignee: ${req.params.assigneeId}`);
    
    // Get milestones by assignee_id from Supabase
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('assignee_id', req.params.assigneeId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(milestones);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching assignee milestones: ${error.message}`);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET milestones by status
router.get('/status/:status', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching milestones with status: ${req.params.status}`);
    
    // Get milestones by status from Supabase
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('status', req.params.status)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(milestones);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching status milestones: ${error.message}`);
    res.status(500).json({ message: 'Error fetching milestones', error: error.message });
  }
});

// GET upcoming milestones (due in the next n days)
router.get('/upcoming/:days', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching upcoming milestones for next ${req.params.days} days`);
    
    const days = parseInt(req.params.days);
    if (isNaN(days)) {
      return res.status(400).json({ message: 'Invalid days parameter' });
    }
    
    // Calculate the date range
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    // Format dates for SQL query
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = futureDate.toISOString().split('T')[0];
    
    // Get upcoming milestones from Supabase
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .gte('end_date', startDateStr)
      .lte('end_date', endDateStr)
      .not('status', 'eq', 'completed')
      .order('end_date', { ascending: true });
    
    if (error) throw error;
    
    res.json(milestones);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching upcoming milestones: ${error.message}`);
    res.status(500).json({ message: 'Error fetching upcoming milestones', error: error.message });
  }
});

module.exports = router;

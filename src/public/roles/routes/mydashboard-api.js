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

// GET user dashboard widgets
router.get('/widgets/:userId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching dashboard widgets for user: ${req.params.userId}`);
    
    // Get widgets for the specific user
    const { data: widgets, error } = await supabase
      .from('dashboard-widg')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('position_y', { ascending: true })
      .order('position_x', { ascending: true });
    
    if (error) throw error;
    
    res.json(widgets || []);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching dashboard widgets:`, error);
    res.status(500).json({ message: 'Error fetching dashboard widgets', error: error.message });
  }
});

// POST create or update widget
router.post('/widgets', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Creating/updating dashboard widget:`, req.body);
    
    const widget = req.body;
    
    if (!widget.user_id || !widget.widget_type) {
      return res.status(400).json({ message: 'Missing required widget details' });
    }
    
    // Validate widget_type is allowed
    const allowedWidgetTypes = ['projects', 'milestones', 'funding', 'calendar', 'recent_activity', 'ai_suggestions'];
    if (!allowedWidgetTypes.includes(widget.widget_type)) {
      return res.status(400).json({ 
        message: `Invalid widget type. Allowed types: ${allowedWidgetTypes.join(', ')}`,
        widget_type: widget.widget_type
      });
    }
    
    // Check if widget already exists for this user
    const { data: existingWidgets, error: queryError } = await supabase
      .from('dashboard-widg')
      .select('id')
      .eq('user_id', widget.user_id)
      .eq('widget_type', widget.widget_type);
    
    if (queryError) throw queryError;
    
    let result;
    
    if (existingWidgets && existingWidgets.length > 0) {
      console.log(`[${new Date().toISOString()}] Widget exists, updating:`, existingWidgets[0].id);
      // Update existing widget
      const { data, error } = await supabase
        .from('dashboard-widg')
        .update(widget)
        .eq('id', existingWidgets[0].id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      console.log(`[${new Date().toISOString()}] Widget doesn't exist, creating new`);
      // Create new widget
      const { data, error } = await supabase
        .from('dashboard-widg')
        .insert([widget])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    console.log(`[${new Date().toISOString()}] Widget saved successfully:`, result);
    res.status(201).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error saving dashboard widget:`, error);
    res.status(500).json({ message: 'Error saving dashboard widget', error });
  }
});

// PUT update widget position
router.put('/widgets/position', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Updating widget positions`);
    
    const { widgets } = req.body;
    
    if (!Array.isArray(widgets) || widgets.length === 0) {
      return res.status(400).json({ message: 'Invalid widget position data' });
    }
    
    // Update each widget position
    const results = await Promise.all(widgets.map(async (widget) => {
      const { data, error } = await supabase
        .from('dashboard-widg')
        .update({
          position_x: widget.position_x,
          position_y: widget.position_y,
          width: widget.width,
          height: widget.height
        })
        .eq('id', widget.id)
        .select();
      
      if (error) throw error;
      return data;
    }));
    
    res.json(results);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating widget positions:`, error);
    res.status(500).json({ message: 'Error updating widget positions', error: error.message });
  }
});

// DELETE widget
router.delete('/widgets/:id', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Deleting widget with ID: ${req.params.id}`);
    
    // Check if widget exists
    const { data: existingWidget, error: checkError } = await supabase
      .from('dashboard-widg')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (checkError || !existingWidget) {
      return res.status(404).json({ message: 'Widget not found' });
    }
    
    // Delete widget
    const { error } = await supabase
      .from('dashboard-widg')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.json(existingWidget);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting widget:`, error);
    res.status(500).json({ message: 'Error deleting widget', error: error.message });
  }
});

// GET summary data for dashboard
router.get('/summary/:userId', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching dashboard summary for user: ${req.params.userId}`);
    
    // Get projects count
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (projectsError) throw projectsError;
    
    // Get milestones stats
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('milestones')
      .select('status');
    
    if (milestonesError) throw milestonesError;
    
    const milestoneStats = {
      total: milestonesData?.length || 0,
      completed: milestonesData?.filter(m => m.status === 'completed').length || 0,
      pending: milestonesData?.filter(m => m.status === 'pending').length || 0,
      inProgress: milestonesData?.filter(m => m.status === 'in-progress').length || 0,
      delayed: milestonesData?.filter(m => m.status === 'delayed').length || 0
    };
    
    // Get funding stats
    const { data: fundingData, error: fundingError } = await supabase
      .from('funding')
      .select('total_amount, amount_spent');
    
    if (fundingError) throw fundingError;
    
    const fundingStats = {
      total: fundingData?.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0) || 0,
      spent: fundingData?.reduce((sum, item) => sum + parseFloat(item.amount_spent || 0), 0) || 0
    };
    
    fundingStats.remaining = fundingStats.total - fundingStats.spent;
    
    // Combine all stats
    const summary = {
      projects: {
        count: projectsCount || 0
      },
      milestones: milestoneStats,
      funding: fundingStats
    };
    
    res.json(summary);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching dashboard summary:`, error);
    res.status(500).json({ message: 'Error fetching dashboard summary', error: error.message });
  }
});

module.exports = router;

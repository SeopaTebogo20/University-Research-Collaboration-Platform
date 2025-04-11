import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import { createClient } from '@supabase/supabase-js';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the Express application
const app = express();

// Initialize Supabase client with a more explicit configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create client for admin operations (server-side only)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Create client for user operations (can be exposed to client)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Custom middleware for logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Custom middleware for serving CSS files with correct MIME type
app.use((req, res, next) => {
  if (req.url.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

// Supabase Auth API endpoints
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] Login attempt for user: ${email}`);
    
    // Call Supabase authentication service
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error(`[${new Date().toISOString()}] Login failed for ${email}: ${error.message}`);
      
      // Check if error is due to unconfirmed email - look for specific error messages
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        // This means the user exists but hasn't confirmed their email
        return res.status(403).json({ 
          message: 'Please confirm your email address before logging in. Check your inbox for a verification link.',
          emailVerified: false
        });
      }
      
      return res.status(400).json({ message: error.message });
    }
    
    console.log(`[${new Date().toISOString()}] Login successful for user: ${email}`);
    
    // Store session in express session
    req.session.user = data.user;
    req.session.access_token = data.session.access_token;
    req.session.refresh_token = data.session.refresh_token;
    
    return res.status(200).json({ 
      message: 'Login successful', 
      user: data.user,
      session: data.session,
      redirectUrl: '/dashboard' // Add redirect URL to response
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error: ${error.message}`);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    // Extract all form data
    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      phone,
      role,
      department,
      academicRole,
      researchArea,
      researchExperience,
      qualifications,
      currentProject
    } = req.body;
    
    console.log(`[${new Date().toISOString()}] Starting signup process for: ${email}`);
    
    // Basic validation
    const errors = {};
    
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!role) errors.role = 'Role is required';
    
    // Role-specific validation - only validate researcher required fields
    if (role === 'researcher') {
      if (!researchArea) errors.researchArea = 'Research Area is required for researchers';
      if (!qualifications) errors.qualifications = 'Qualifications are required for researchers';
      if (!currentProject) errors.currentProject = 'Current Project is required for researchers';
    }
    
    if (Object.keys(errors).length > 0) {
      console.error(`[${new Date().toISOString()}] Signup validation failed for ${email}:`, errors);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Create user metadata with all fields - store everything in one place, including email
    const userMetadata = {
      name,
      email, // Explicitly include email in metadata
      role,
      phone: phone || ''
    };
    
    // Add common fields for all roles - accept empty strings
    userMetadata.department = department || '';
    userMetadata.academicRole = academicRole || '';
    
    // Add specific fields based on role
    if (role === 'researcher' || role === 'reviewer') {
      userMetadata.researchArea = researchArea || '';
      userMetadata.qualifications = qualifications || '';
      
      // For research experience, ensure it's a number or 0
      userMetadata.researchExperience = researchExperience ? parseInt(researchExperience) : 0;
    }
    
    // Add researcher-specific fields
    if (role === 'researcher') {
      userMetadata.currentProject = currentProject || '';
    }
    
    console.log(`[${new Date().toISOString()}] User metadata prepared`);
    
    // Get the base URL for the redirect
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Use the regular signup method which automatically sends verification email
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: `${baseUrl}/login?verified=true`
      }
    });
    
    if (error) {
      console.error(`[${new Date().toISOString()}] Supabase signup error for ${email}: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
    
    if (!data || !data.user) {
      console.error(`[${new Date().toISOString()}] No user data returned from Supabase signup`);
      return res.status(500).json({ message: 'No user data returned from signup process' });
    }
    
    console.log(`[${new Date().toISOString()}] ✅ USER CREATED SUCCESSFULLY: ${data.user.id} ✅`);
    console.log(`[${new Date().toISOString()}] 📧 CONFIRMATION EMAIL AUTOMATICALLY SENT BY SUPABASE TO: ${email} 📧`);
    
    return res.status(201).json({ 
      message: 'Account created successfully. Please check your email to verify your account.', 
      user: data.user,
      emailConfirmationRequired: true
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Signup error: ${error.message}`);
    console.error(`[${new Date().toISOString()}] Error stack: ${error.stack}`);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Endpoint to resend email verification
app.post('/api/resend-verification', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] Resending verification email to: ${email}`);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Use Supabase's built-in resend email verification function
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${baseUrl}/login?verified=true`
      }
    });
    
    if (error) {
      console.error(`[${new Date().toISOString()}] Error resending verification: ${error.message}`);
      return res.status(400).json({ message: error.message });
    }
    
    console.log(`[${new Date().toISOString()}] Verification email resent to: ${email}`);
    
    return res.status(200).json({ 
      message: 'Verification email sent. Please check your inbox.',
      success: true
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Resend verification error: ${error.message}`);
    return res.status(500).json({ message: 'Error sending verification email' });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  try {
    // Get the session from the request
    const accessToken = req.session.access_token;
    
    // Call Supabase to invalidate the session if token exists
    if (accessToken) {
      console.log("Attempting to logout user from Supabase");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Supabase logout error:", error);
        return res.status(400).json({ message: error.message });
      }
      
      console.log("Supabase logout successful");
    }
    
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout' });
  }
});

// Check auth status endpoint
app.get('/api/auth/status', (req, res) => {
  if (req.session.user && req.session.access_token) {
    return res.status(200).json({ 
      authenticated: true, 
      user: req.session.user 
    });
  }
  return res.status(200).json({ authenticated: false });
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user || !req.session.access_token) {
    return res.redirect('/login');
  }
  next();
};

// Protected routes example
app.get('/protected', requireAuth, (req, res) => {
  res.send('This is a protected route');
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'signup.html'));
});

// Serve dashboard HTML file
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(join(__dirname, 'public', 'dashboard.html'));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(join(__dirname, 'public', 'not-found.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Server running on port ${PORT}`);
  console.log(`[${timestamp}] 📊 User registration monitoring active`);
  console.log(`[${timestamp}] 📝 Visit http://localhost:3000/signup to register new users`);
});
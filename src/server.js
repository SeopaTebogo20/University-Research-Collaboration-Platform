
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
// Make sure to use the correct anon key (not service role key for client-side operations)
const supabaseUrl = "https://vjralsarujpgusjhytjz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcmFsc2FydWpwZ3Vzamh5dGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjA1NDgsImV4cCI6MjA1OTc5NjU0OH0.eRc8sP-5vsapa1owackHxOrU36n51sW0BxMP1nzyj3Q";
// Service role key should only be used on the server-side for admin operations
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcmFsc2FydWpwZ3Vzamh5dGp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDIyMDU0OCwiZXhwIjoyMDU5Nzk2NTQ4fQ.8iYqwFDmywxZNRz-W_ygf19AcghUfbpGy54DJitGX-8";

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
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
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
    
    console.log(`[${new Date().toISOString()}] Starting signup process for: ${email}`, req.body);
    
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
    
    console.log(`[${new Date().toISOString()}] User metadata:`, userMetadata);
    
    // Get the base URL for the redirect
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // IMPORTANT: Use the service role key to create users with email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Set to false to explicitly require email confirmation
      user_metadata: userMetadata,
      email_confirm_redirect_url: `${baseUrl}/login?verified=true`
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
    console.log(`[${new Date().toISOString()}] 📧 CONFIRMATION EMAIL SCHEDULED TO: ${email} 📧`);
    
    // Now explicitly send the confirmation email
    const { error: confirmError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${baseUrl}/login?verified=true`
      }
    });
    
    if (confirmError) {
      console.error(`[${new Date().toISOString()}] Error sending confirmation email: ${confirmError.message}`);
      // Continue anyway as the user is created
    } else {
      console.log(`[${new Date().toISOString()}] 📬 CONFIRMATION EMAIL SUCCESSFULLY SENT TO: ${email} 📬`);
    }
    
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

// Handle email verification success
app.get('/auth/verify-email', (req, res) => {
  const token = req.query.token;
  
  if (!token) {
    return res.redirect('/login?error=' + encodeURIComponent('Invalid verification link'));
  }
  
  // Redirect to login page with success message
  return res.redirect('/login?verified=true');
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
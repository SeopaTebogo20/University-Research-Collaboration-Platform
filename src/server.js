require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios'); // You'll need to install axios
const projectsRouter = require('./public/roles/routes/projects-api'); 
const invitationsRouter = require('./public/roles/routes/invitations-api'); 
const invitationRouter = require('./public/roles/routes/received_invitations-api'); 
const proposalRouter = require('./public/roles/routes/assigned-proposals-api'); 
const usersRouter = require('./public/roles/routes/users-api');
const collaboratorsRouter = require('./public/roles/routes/collaborators-api');  
const milestonesRouter = require('./public/roles/routes/milestones-api');
const fundingRouter = require('./public/roles/routes/funding-api');
const jwt = require('jsonwebtoken'); // You'll need to install jsonwebtoken

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

// Google OAuth Configuration
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecrete = process.env.GOOGLE_CLIENT_SECRET;
const redirectURl= process.env.NODE_ENV === 'production' 
  ?  process.env.PRODUCTION_REDIRECT_URL
  : 'http://localhost:3000/auth/google/callback';

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Updated session configuration for better production support
// Updated session configuration for Azure
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true, // Change to true to ensure session is saved
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true
  }
}));

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/received_invitations', invitationRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/users', usersRouter);
app.use('/api/funding', fundingRouter);
app.use('/api/milestones', milestonesRouter);
app.use('/api/collaborators', collaboratorsRouter);

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

// Google Auth Endpoints
app.get('/auth/google', (req, res) => {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectURl);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', 'email profile');
  authUrl.searchParams.append('prompt', 'select_account');
  
  // Store the original redirect destination if provided
  if (req.query.redirect) {
    req.session.redirectAfterLogin = req.query.redirect;
  }
  
  // Log the redirect URL for debugging
  console.log(`[${new Date().toISOString()}] Redirecting to Google OAuth with URL: ${redirectURl}`);
  
  res.redirect(authUrl.toString());
});

// Add this helper function near the top of your file, after your middleware definitions
function getDashboardUrlByRole(role) {
  // Normalize role to lowercase for case-insensitive comparison
  const normalizedRole = role ? role.toLowerCase() : 'researcher';
  
  switch (normalizedRole) {
    case 'admin':
      return '/roles/admin/dashboard.html';
    case 'reviewer':
      return '/roles/reviewer/dashboard.html';
    case 'researcher':
      return '/roles/researcher/dashboard.html';
    default:
      return '/roles/researcher/dashboard.html';
  }
}

// Replace your existing Google Auth Callback with this updated version
app.get('/auth/google/callback', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Google callback received with code: ${req.query.code ? 'present' : 'missing'}`);
  
  const { code } = req.query;
  
  if (!code) {
    console.log(`[${new Date().toISOString()}] No code provided in Google callback`);
    return res.redirect('/login?error=google_auth_failed');
  }
  
  try {
    console.log(`[${new Date().toISOString()}] Starting token exchange with Google`);
    
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecrete,
      redirect_uri: redirectURl,
      grant_type: 'authorization_code'
    });
    
    console.log(`[${new Date().toISOString()}] Token exchange completed successfully`);
    
    // Get user info with the access token
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });
    
    const { email, name, picture, sub: googleId } = userInfoResponse.data;
    
    console.log(`[${new Date().toISOString()}] Google login attempt for: ${email}`);
    
    // Validate Wits University student email format: digits@students.wits.ac.za
    const emailRegex = /^\d+@students\.wits\.ac\.za$/i;
    if (!emailRegex.test(email)) {
      console.log(`[${new Date().toISOString()}] Rejected login: ${email} does not match Wits student email format`);
      return res.redirect('/login?error=invalid_email_domain&message=Please use your Wits student email (student number@students.wits.ac.za)');
    }
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error(`[${new Date().toISOString()}] Error checking for existing users: ${userError.message}`);
      return res.redirect('/login?error=server_error');
    }
    
    // Find user by email
    const existingUser = userData && userData.users && userData.users.find(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    // If user doesn't exist, store Google data in session and redirect to special signup page
    if (!existingUser) {
      console.log(`[${new Date().toISOString()}] New Google user, redirecting to complete profile: ${email}`);
      
      // Create Google profile object
      const googleProfile = {
        email,
        name,
        picture,
        googleId
      };
      
      // Use JWT token approach instead of relying solely on session
      const token = jwt.sign(googleProfile, process.env.SESSION_SECRET, { expiresIn: '15m' });
      
      // Store in session as well for redundancy
      req.session.googleProfile = googleProfile;
      
      // Ensure session is saved before redirect
      req.session.save((err) => {
        if (err) {
          console.error(`[${new Date().toISOString()}] Error saving session: ${err.message}`);
          // Fall back to token approach
          return res.redirect(`/signupGoogle?token=${token}`);
        }
        
        console.log(`[${new Date().toISOString()}] Google profile stored in session, redirecting to signupGoogle`);
        // Include token as backup
        return res.redirect(`/signupGoogle?token=${token}`);
      });
      
      return;
    }
    
    // Existing user: proceed with normal login flow
    console.log(`[${new Date().toISOString()}] Existing user found for Google login: ${email}`);
    
    // Sign in the user with Supabase
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });
    
    if (signInError) {
      console.error(`[${new Date().toISOString()}] Error signing in Google user: ${signInError.message}`);
      return res.redirect('/login?error=login_failed');
    }
    
    // Extract authentication token from the magic link
    const authToken = new URL(signInData.properties.action_link).searchParams.get('token');
    
    // Exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: authToken,
      type: 'magiclink'
    });
    
    if (sessionError) {
      console.error(`[${new Date().toISOString()}] Error creating session for Google user: ${sessionError.message}`);
      return res.redirect('/login?error=session_creation_failed');
    }
    
    // Store session in express session
    req.session.user = sessionData.user;
    req.session.access_token = sessionData.session.access_token;
    req.session.refresh_token = sessionData.session.refresh_token;
    
    console.log(`[${new Date().toISOString()}] Google login successful for: ${email}`);
    
    // Get the user's role from their metadata
    const userRole = sessionData.user?.user_metadata?.role || 'researcher'; // Default to researcher if no role found
    
    // Get the appropriate dashboard URL based on role
    const dashboardUrl = getDashboardUrlByRole(userRole);
    
    // Use original redirect destination if it exists, otherwise use role-specific dashboard
    const redirectTo = req.session.redirectAfterLogin || dashboardUrl;
    delete req.session.redirectAfterLogin;
    
    // Ensure session is saved before redirect
    req.session.save((err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error saving session after login: ${err.message}`);
      }
      
      console.log(`[${new Date().toISOString()}] Redirecting user to: ${redirectTo} based on role: ${userRole}`);
      return res.redirect(redirectTo);
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Google auth error: ${error.message}`);
    console.error(`[${new Date().toISOString()}] Error stack: ${error.stack}`);
    return res.redirect('/login?error=google_auth_error');
  }
});

// Updated signupGoogle route
app.get('/signupGoogle', (req, res) => {
  console.log(`[${new Date().toISOString()}] SignupGoogle page requested`);
  
  // If token exists in query, use it as a backup
  if (req.query.token) {
    try {
      console.log(`[${new Date().toISOString()}] Found token in URL, attempting to verify`);
      const googleProfile = jwt.verify(req.query.token, process.env.SESSION_SECRET);
      
      // Store the profile in session
      req.session.googleProfile = googleProfile;
      console.log(`[${new Date().toISOString()}] Set Google profile from token to session`, googleProfile);
      
      // Force save the session
      req.session.save((err) => {
        if (err) {
          console.error(`[${new Date().toISOString()}] Error saving session: ${err.message}`);
        }
        
        console.log(`[${new Date().toISOString()}] Serving signupGoogle.html for: ${googleProfile.email}`);
        res.sendFile(path.join(__dirname, 'public', 'signupGoogle.html'));
      });
      return;
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Invalid or expired token: ${err.message}`);
      return res.redirect('/login?error=invalid_token');
    }
  }
  
  // Check if profile exists in session
  if (!req.session.googleProfile) {
    console.error(`[${new Date().toISOString()}] Google profile not found in session`);
    return res.redirect('/login?error=missing_google_profile');
  }
  
  console.log(`[${new Date().toISOString()}] Serving signupGoogle.html for: ${req.session.googleProfile.email}`);
  res.sendFile(path.join(__dirname, 'public', 'signupGoogle.html'));
});

// Add new endpoint to complete Google signup with additional profile information
// Add new endpoint to complete Google signup with additional profile information
app.post('/api/signup-google', async (req, res) => {
  try {
    // Check if Google profile exists in session
    if (!req.session.googleProfile) {
      return res.status(400).json({ message: 'Google profile data not found. Please try logging in with Google again.' });
    }
    
    const googleProfile = req.session.googleProfile;
    
    // Extract form data (additional profile fields)
    const { 
      role,
      department,
      academicRole,
      researchArea,
      researchExperience,
      qualifications,
      currentProject
    } = req.body;
    
    console.log(`[${new Date().toISOString()}] Completing Google signup for: ${googleProfile.email}`);
    
    // Basic validation
    const errors = {};
    
    if (!role) errors.role = 'Role is required';
    
    // Role-specific validation - only validate researcher required fields
    if (role === 'researcher') {
      if (!researchArea) errors.researchArea = 'Research Area is required for researchers';
      if (!qualifications) errors.qualifications = 'Qualifications are required for researchers';
      if (!currentProject) errors.currentProject = 'Current Project is required for researchers';
    }
    
    if (Object.keys(errors).length > 0) {
      console.error(`[${new Date().toISOString()}] Google signup validation failed for ${googleProfile.email}:`, errors);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Extract student number from email
    const studentNumber = googleProfile.email.split('@')[0];
    
    // Create a random password since Supabase requires one (user won't use it)
    const randomPassword = Math.random().toString(36).slice(-10);
    
    // Create user metadata with all fields
    const userMetadata = {
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      picture: googleProfile.picture,
      role,
      authProvider: 'google',
      studentNumber,
      phone: null // Set phone to null for Google signups
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
    
    // Create new user in Supabase with pre-confirmed email (since Google already verified it)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: googleProfile.email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: userMetadata
    });
    
    if (createError) {
      console.error(`[${new Date().toISOString()}] Error creating user from Google signup: ${createError.message}`);
      return res.status(400).json({ message: createError.message });
    }
    
    console.log(`[${new Date().toISOString()}] ✅ GOOGLE USER CREATED SUCCESSFULLY: ${newUser.user.id} ✅`);
    
    // Sign in the user with Supabase
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: googleProfile.email
    });
    
    if (signInError) {
      console.error(`[${new Date().toISOString()}] Error signing in Google user after signup: ${signInError.message}`);
      return res.status(400).json({ message: signInError.message });
    }
    
    // Extract authentication token from the magic link
    const authToken = new URL(signInData.properties.action_link).searchParams.get('token');
    
    // Exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: authToken,
      type: 'magiclink'
    });
    
    if (sessionError) {
      console.error(`[${new Date().toISOString()}] Error creating session after Google signup: ${sessionError.message}`);
      return res.status(400).json({ message: sessionError.message });
    }
    
    // Store session in express session
    req.session.user = sessionData.user;
    req.session.access_token = sessionData.session.access_token;
    req.session.refresh_token = sessionData.session.refresh_token;
    
    // Clear Google profile from session as it's no longer needed
    delete req.session.googleProfile;
    
    // Determine the redirect URL based on the user's role
    let redirectUrl;
    switch (role) {
      case 'admin':
        redirectUrl = '/roles/admin/dashboard.html';
        break;
      case 'reviewer':
        redirectUrl = '/roles/reviewer/dashboard.html';
        break;
      case 'researcher':
        redirectUrl = '/roles/researcher/dashboard.html';
    }
    
    return res.status(201).json({ 
      message: 'Account created successfully!', 
      user: newUser.user,
      redirectUrl
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Google signup error: ${error.message}`);
    console.error(`[${new Date().toISOString()}] Error stack: ${error.stack}`);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Updated endpoint to get Google profile data from session
app.get('/api/auth/google-profile', (req, res) => {
  // First check session
  if (req.session.googleProfile) {
    return res.status(200).json({ 
      profile: req.session.googleProfile 
    });
  }
  
  // If not in session, check for token in query
  if (req.query.token) {
    try {
      const googleProfile = jwt.verify(req.query.token, process.env.SESSION_SECRET);
      
      // Store in session for future requests
      req.session.googleProfile = googleProfile;
      req.session.save();
      
      return res.status(200).json({ 
        profile: googleProfile 
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Invalid token in profile request: ${err.message}`);
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
  
  return res.status(404).json({ message: 'Google profile not found in session' });
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
    
    // Get the user's role from their metadata
    const userRole = data.user?.user_metadata?.role || 'researcher';
    
    // Get the appropriate dashboard URL based on role
    const dashboardUrl = getDashboardUrlByRole(userRole);
    
    // Ensure session is saved before sending response
    req.session.save((err) => {
      if (err) {
        console.error(`[${new Date().toISOString()}] Error saving session after login: ${err.message}`);
      }
      
      return res.status(200).json({ 
        message: 'Login successful', 
        user: data.user,
        session: data.session,
        redirectUrl: dashboardUrl // Use role-specific dashboard
      });
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error: ${error.message}`);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Add this new endpoint for checking if an email already exists
app.get('/api/check-email', async (req, res) => {
  const { email } = req.query;
  
  if (!email) {
    return res.status(400).json({ message: 'Email parameter is required' });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] Checking if email exists: ${email}`);
    
    // Use Supabase to check if the email exists by trying to get user by email
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error(`[${new Date().toISOString()}] Error checking email: ${error.message}`);
      return res.status(500).json({ message: 'Error checking email existence' });
    }
    
    // Check if the email exists in the returned users
    const emailExists = data && data.users && data.users.some(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    console.log(`[${new Date().toISOString()}] Email ${email} exists: ${emailExists}`);
    
    return res.status(200).json({ exists: emailExists });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Email check error: ${error.message}`);
    return res.status(500).json({ message: 'Server error checking email existence' });
  }
});

// Also modify the signup endpoint to check for existing emails before creating a user
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
    
    // First check if email already exists in the system
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error(`[${new Date().toISOString()}] Error checking for existing users: ${userError.message}`);
      return res.status(500).json({ message: 'Error checking for existing users' });
    }
    
    // Check if email already exists
    const emailExists = userData && userData.users && userData.users.some(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (emailExists) {
      console.log(`[${new Date().toISOString()}] Email ${email} already exists. Preventing duplicate registration.`);
      return res.status(409).json({ 
        message: 'This email is already registered. Please use a different email or login with your existing account.',
        errors: { email: 'Email already registered' }
      });
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
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://' + req.get('host')
      : `${req.protocol}://${req.get('host')}`;
    
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
      
      // Check if error is related to duplicate emails
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return res.status(409).json({ 
          message: 'This email is already registered. Please use a different email or login with your existing account.',
          errors: { email: 'Email already registered' }
        });
      }
      
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
    
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://' + req.get('host')
      : `${req.protocol}://${req.get('host')}`;
    
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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve dashboard HTML file
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'not-found.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✅ Server running on port ${PORT}`);
  console.log(`[${timestamp}] 📊 User registration monitoring active`);
  console.log(`[${timestamp}] 📝 Visit http://localhost:3000/signup to register new users`);
});

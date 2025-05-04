require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const projectsRouter = require('./public/roles/routes/projects-api'); 
const invitationsRouter = require('./public/roles/routes/invitations-api'); 
const invitationRouter = require('./public/roles/routes/received_invitations-api'); 
const proposalRouter = require('./public/roles/routes/assigned-proposals-api'); 
const usersRouter = require('./public/roles/routes/users-api');
const collaboratorsRouter = require('./public/roles/routes/collaborators-api');  
const jwt = require('jsonwebtoken');

// Create the Express application
const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

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

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000,
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
app.use('/api/collaborators', collaboratorsRouter);

// Custom middleware for logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Helper function to get dashboard URL by role
function getDashboardUrlByRole(role) {
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

function storeUserInSession(req, userData, sessionData) {
  console.log('\n=== Storing user in session storage ===');
  console.log('User ID:', userData.id);
  console.log('User Email:', userData.email);
  console.log('User Metadata:', userData.user_metadata || {});
  
  // Store essential user data in session
  req.session.user = {
    id: userData.id,
    email: userData.email,
    user_metadata: userData.user_metadata || {},
    role: userData.user_metadata?.role || 'researcher'
  };
  
  // Store access and refresh tokens
  req.session.access_token = sessionData.access_token;
  req.session.refresh_token = sessionData.refresh_token;
  
  // Store additional user data that might be needed
  req.session.userData = {
    name: userData.user_metadata?.name || '',
    picture: userData.user_metadata?.picture || '',
    department: userData.user_metadata?.department || '',
    researchArea: userData.user_metadata?.researchArea || ''
  };

  console.log('\n=== Session storage after storing user ===');
  console.log('Session User:', req.session.user);
  console.log('Session UserData:', req.session.userData);
  console.log('Session has access_token:', !!req.session.access_token);
  console.log('Session has refresh_token:', !!req.session.refresh_token);
  console.log('=========================================\n');
}

app.post('/api/logout', async (req, res) => {
  try {
    console.log('\n=== Logging out user ===');
    console.log('Current session before logout:', {
      user: req.session.user,
      tokens: {
        access_token: !!req.session.access_token,
        refresh_token: !!req.session.refresh_token
      }
    });

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
      console.log("Session destroyed successfully");
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout' });
  }
});

// Add this near your other middleware
app.use((req, res, next) => {
  // Log session changes
  const originalSession = JSON.parse(JSON.stringify(req.session));
  
  res.on('finish', () => {
    if (!req.session) return;
    
    const newSession = JSON.parse(JSON.stringify(req.session));
    if (JSON.stringify(originalSession) !== JSON.stringify(newSession)) {
      console.log('\n=== Session changed during request ===');
      console.log('Route:', req.method, req.originalUrl);
      console.log('Session changes:', {
        before: originalSession,
        after: newSession
      });
    }
  });
  
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
  
  if (req.query.redirect) {
    req.session.redirectAfterLogin = req.query.redirect;
  }
  
  res.redirect(authUrl.toString());
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/login?error=google_auth_failed');
  }
  
  try {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecrete,
      redirect_uri: redirectURl,
      grant_type: 'authorization_code'
    });
    
    // Get user info with the access token
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });
    
    const { email, name, picture, sub: googleId } = userInfoResponse.data;
    
    // Validate Wits University student email format
    const emailRegex = /^\d+@students\.wits\.ac\.za$/i;
    if (!emailRegex.test(email)) {
      return res.redirect('/login?error=invalid_email_domain&message=Please use your Wits student email (student number@students.wits.ac.za)');
    }
    
    // Check if user exists in Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      return res.redirect('/login?error=server_error');
    }
    
    // Find user by email
    const existingUser = userData && userData.users && userData.users.find(user => 
      user.email && user.email.toLowerCase() === email.toLowerCase()
    );
    
    // If user doesn't exist, store Google data in session and redirect to special signup page
    if (!existingUser) {
      const googleProfile = {
        email,
        name,
        picture,
        googleId
      };
      
      const token = jwt.sign(googleProfile, process.env.SESSION_SECRET, { expiresIn: '15m' });
      req.session.googleProfile = googleProfile;
      
      req.session.save((err) => {
        if (err) {
          return res.redirect(`/signupGoogle?token=${token}`);
        }
        return res.redirect(`/signupGoogle?token=${token}`);
      });
      return;
    }
    
    // Existing user: proceed with normal login flow
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });
    
    if (signInError) {
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
      return res.redirect('/login?error=session_creation_failed');
    }
    
    // Store user data in session
    storeUserInSession(req, sessionData.user, sessionData.session);
    
    // Get the user's role from their metadata
    const userRole = sessionData.user?.user_metadata?.role || 'researcher';
    const dashboardUrl = getDashboardUrlByRole(userRole);
    const redirectTo = req.session.redirectAfterLogin || dashboardUrl;
    delete req.session.redirectAfterLogin;
    
    req.session.save((err) => {
      if (err) {
        console.error(`Error saving session after login: ${err.message}`);
      }
      return res.redirect(redirectTo);
    });
  } catch (error) {
    console.error(`Google auth error: ${error.message}`);
    return res.redirect('/login?error=google_auth_error');
  }
});

// Signup with Google page
app.get('/signupGoogle', (req, res) => {
  if (req.query.token) {
    try {
      const googleProfile = jwt.verify(req.query.token, process.env.SESSION_SECRET);
      req.session.googleProfile = googleProfile;
      
      req.session.save((err) => {
        if (err) {
          console.error(`Error saving session: ${err.message}`);
        }
        res.sendFile(path.join(__dirname, 'public', 'signupGoogle.html'));
      });
      return;
    } catch (err) {
      return res.redirect('/login?error=invalid_token');
    }
  }
  
  if (!req.session.googleProfile) {
    return res.redirect('/login?error=missing_google_profile');
  }
  
  res.sendFile(path.join(__dirname, 'public', 'signupGoogle.html'));
});

// Complete Google signup
app.post('/api/signup-google', async (req, res) => {
  try {
    if (!req.session.googleProfile) {
      return res.status(400).json({ message: 'Google profile data not found. Please try logging in with Google again.' });
    }
    
    const googleProfile = req.session.googleProfile;
    const { 
      role,
      department,
      academicRole,
      researchArea,
      researchExperience,
      qualifications,
      currentProject
    } = req.body;
    
    // Basic validation
    const errors = {};
    if (!role) errors.role = 'Role is required';
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Extract student number from email
    const studentNumber = googleProfile.email.split('@')[0];
    const randomPassword = Math.random().toString(36).slice(-10);
    
    // Create user metadata
    const userMetadata = {
      name: googleProfile.name,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      picture: googleProfile.picture,
      role,
      authProvider: 'google',
      studentNumber,
      phone: null
    };
    
    // Add common fields
    userMetadata.department = department || '';
    userMetadata.academicRole = academicRole || '';
    
    // Add specific fields based on role
    if (role === 'researcher' || role === 'reviewer') {
      userMetadata.researchArea = researchArea || '';
      userMetadata.qualifications = qualifications || '';
      userMetadata.researchExperience = researchExperience ? parseInt(researchExperience) : 0;
    }
    
    if (role === 'researcher') {
      userMetadata.currentProject = currentProject || '';
    }
    
    // Create new user in Supabase
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: googleProfile.email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: userMetadata
    });
    
    if (createError) {
      return res.status(400).json({ message: createError.message });
    }
    
    // Sign in the user with Supabase
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: googleProfile.email
    });
    
    if (signInError) {
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
      return res.status(400).json({ message: sessionError.message });
    }
    
    // Store user data in session
    storeUserInSession(req, sessionData.user, sessionData.session);
    
    // Clear Google profile from session
    delete req.session.googleProfile;
    
    // Determine the redirect URL based on the user's role
    const redirectUrl = getDashboardUrlByRole(role);
    
    return res.status(201).json({ 
      message: 'Account created successfully!', 
      user: newUser.user,
      redirectUrl
    });
  } catch (error) {
    console.error(`Google signup error: ${error.message}`);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Regular login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    // Call Supabase authentication service
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        return res.status(403).json({ 
          message: 'Please confirm your email address before logging in. Check your inbox for a verification link.',
          emailVerified: false
        });
      }
      return res.status(400).json({ message: error.message });
    }
    
    // Store user data in session
    storeUserInSession(req, data.user, data.session);
    
    // Get the user's role from their metadata
    const userRole = data.user?.user_metadata?.role || 'researcher';
    const dashboardUrl = getDashboardUrlByRole(userRole);
    
    req.session.save((err) => {
      if (err) {
        console.error(`Error saving session after login: ${err.message}`);
      }
      
      return res.status(200).json({ 
        message: 'Login successful', 
        user: data.user,
        session: data.session,
        redirectUrl: dashboardUrl
      });
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Regular signup endpoint
app.post('/api/signup', async (req, res) => {
  try {
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
    
    // Basic validation
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!role) errors.role = 'Role is required';
    
    if (role === 'researcher') {
      if (!researchArea) errors.researchArea = 'Research Area is required for researchers';
      if (!qualifications) errors.qualifications = 'Qualifications are required for researchers';
      if (!currentProject) errors.currentProject = 'Current Project is required for researchers';
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Create user metadata
    const userMetadata = {
      name,
      email,
      role,
      phone: phone || ''
    };
    
    // Add common fields
    userMetadata.department = department || '';
    userMetadata.academicRole = academicRole || '';
    
    // Add specific fields based on role
    if (role === 'researcher' || role === 'reviewer') {
      userMetadata.researchArea = researchArea || '';
      userMetadata.qualifications = qualifications || '';
      userMetadata.researchExperience = researchExperience ? parseInt(researchExperience) : 0;
    }
    
    if (role === 'researcher') {
      userMetadata.currentProject = currentProject || '';
    }
    
    // Get the base URL for the redirect
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://' + req.get('host')
      : `${req.protocol}://${req.get('host')}`;
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: `${baseUrl}/login?verified=true`
      }
    });
    
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return res.status(409).json({ 
          message: 'This email is already registered. Please use a different email or login with your existing account.',
          errors: { email: 'Email already registered' }
        });
      }
      return res.status(400).json({ message: error.message });
    }
    
    if (!data || !data.user) {
      return res.status(500).json({ message: 'No user data returned from signup process' });
    }
    
    return res.status(201).json({ 
      message: 'Account created successfully. Please check your email to verify your account.', 
      user: data.user,
      emailConfirmationRequired: true
    });
  } catch (error) {
    console.error(`Signup error: ${error.message}`);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// Auth status endpoint
app.get('/api/auth/status', (req, res) => {
  if (req.session.user && req.session.access_token) {
    return res.status(200).json({ 
      authenticated: true, 
      user: req.session.user,
      userData: req.session.userData
    });
  }
  return res.status(200).json({ authenticated: false });
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
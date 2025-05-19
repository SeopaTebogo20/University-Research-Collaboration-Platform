function getDashboardUrlByRole(role) {
  const normalizedRole = role.toLowerCase();
  switch (normalizedRole) {
    case 'admin': return '/roles/admin/dashboard.html';
    case 'reviewer': return '/roles/reviewer/dashboard.html';
    case 'researcher': return '/roles/researcher/dashboard.html';
    default: return '/roles/researcher/dashboard.html';
  }
}

function storeUserInSession(user) {
  try {
    sessionStorage.setItem('user', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'researcher',
      name: user.user_metadata?.name || '',
      picture: user.user_metadata?.picture || ''
    }));

    if (user.session) {
      sessionStorage.setItem('access_token', user.session.access_token);
      sessionStorage.setItem('refresh_token', user.session.refresh_token);
    }
  } catch (error) {
    console.error('Error storing user in sessionStorage:', error);
  }
}

module.exports = {
  getDashboardUrlByRole,
  storeUserInSession
};

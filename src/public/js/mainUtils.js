function checkMobileView(window, document) {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  const authButtons = document.querySelector('.navbar .auth-buttons');

  if (!mobileMenuButton) return;

  if (window.innerWidth <= 768) {
    mobileMenuButton.style.display = 'block';
    navLinks?.classList.add('hidden-mobile');
    authButtons?.classList.add('hidden-mobile');
  } else {
    mobileMenuButton.style.display = 'none';
    navLinks?.classList.remove('hidden-mobile');
    authButtons?.classList.remove('hidden-mobile');
  }
}

module.exports = { checkMobileView };

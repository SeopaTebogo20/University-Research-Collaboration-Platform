const { checkMobileView } = require('../src/public/js/mainUtils');

describe('checkMobileView', () => {
  let windowMock;
  let documentMock;

  beforeEach(() => {
    const createElement = (id) => ({
      id,
      style: { display: '' },
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    });

    documentMock = {
      getElementById: jest.fn((id) => {
        if (id === 'mobile-menu-button') return mobileMenuButton;
        if (id === 'mobile-nav') return { classList: { add: jest.fn(), remove: jest.fn() } };
        return null;
      }),
      querySelector: jest.fn((selector) => {
        switch (selector) {
          case '.nav-links':
            return navLinks;
          case '.navbar':
            return navbar;
          case '.navbar .auth-buttons':
            return authButtons;
          default:
            return null;
        }
      }),
    };

    mobileMenuButton = createElement('mobile-menu-button');
    navLinks = createElement('nav-links');
    navbar = createElement('navbar');
    authButtons = createElement('auth-buttons');
  });

  test('should show mobile menu button on small screens', () => {
    windowMock = { innerWidth: 600 };

    checkMobileView(windowMock, documentMock);

    expect(mobileMenuButton.style.display).toBe('block');
    expect(navLinks.classList.add).toHaveBeenCalledWith('hidden-mobile');
    expect(authButtons.classList.add).toHaveBeenCalledWith('hidden-mobile');
  });

  test('should hide mobile menu button on large screens', () => {
    windowMock = { innerWidth: 1024 };

    checkMobileView(windowMock, documentMock);

    expect(mobileMenuButton.style.display).toBe('none');
    expect(navLinks.classList.remove).toHaveBeenCalledWith('hidden-mobile');
    expect(authButtons.classList.remove).toHaveBeenCalledWith('hidden-mobile');
  });

  test('does nothing if mobileMenuButton is missing', () => {
    documentMock.getElementById = jest.fn(() => null);
    windowMock = { innerWidth: 600 };

    expect(() => checkMobileView(windowMock, documentMock)).not.toThrow();
  });
});

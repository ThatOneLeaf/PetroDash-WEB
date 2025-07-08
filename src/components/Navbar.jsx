import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import Modal from '../components/modal'; 
import LoginPage from '../pages/Login_page/Login_page';
import Btn from '../components/ButtonComp';
import logo from '../assets/petrodashlogo.png';
// Simple hamburger icon component
function Hamburger({ open, onClick }) {
  return (
    <button
      aria-label="Open menu"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        width: 40,
        height: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 1201,
      }}
    >
      <span style={{
        width: 28,
        height: 3,
        background: '#182959',
        borderRadius: 2,
        margin: '3px 0',
        transition: '0.3s',
        transform: open ? 'rotate(45deg) translate(5px, 6px)' : 'none'
      }} />
      <span style={{
        width: 28,
        height: 3,
        background: '#182959',
        borderRadius: 2,
        margin: '3px 0',
        transition: '0.3s',
        opacity: open ? 0 : 1
      }} />
      <span style={{
        width: 28,
        height: 3,
        background: '#182959',
        borderRadius: 2,
        margin: '3px 0',
        transition: '0.3s',
        transform: open ? 'rotate(-45deg) translate(6px, -6px)' : 'none'
      }} />
    </button>
  );
}

function Navbar({ isSticky = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [scrolled, setScrolled] = useState(false);
  const [isNavbarLogin, setLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isSticky) return;

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Auto-close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);
  
  const toggleModal = () => {
    setLoginModal(!isNavbarLogin);
  };

  // Animation styles
  const navAnimStyle = isSticky
    ? {
        transition: 'box-shadow 0.3s ease, background 0.3s, border-bottom 0.3s',
        backgroundColor: scrolled ? 'white' : 'transparent',
        borderBottom: scrolled ? '1px solid #e0e0e0' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
      }
    : {};

  return (
    <>
      <style>
        {`
          .navbar-logo {
            opacity: 0;
            animation: logoFadeIn 0.8s 0.2s forwards;
          }
          @keyframes logoFadeIn {
            to { opacity: 1; }
          }
          .navbar-center-btn {
            position: relative;
            transition: color 0.2s;
          }
          .navbar-center-btn::after {
            content: '';
            position: absolute;
            left: 0; right: 0; bottom: -2px;
            height: 2px;
            background: #182959;
            transform: scaleX(0);
            transition: transform 0.3s cubic-bezier(.4,0,.2,1);
            transform-origin: center;
          }
          .navbar-center-btn:hover::after,
          .navbar-center-btn:focus::after {
            transform: scaleX(1);
          }
          .navbar-center-btn:hover,
          .navbar-center-btn:focus {
            color: #182959;
          }          @media (max-width: 900px) {
            .navbar-login-desktop {
              display: none !important;
            }
            .navbar-hamburger {
              display: flex !important;
            }
          }
          @media (min-width: 901px) {
            .navbar-hamburger {
              display: none !important;
            }
          }
        `}
      </style>
      <div style={{
        height: isSticky ? '72px' : 'auto'
      }}>        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2.5rem 2rem',
          position: isSticky ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '82px',
          zIndex: 1000,
          boxSizing: 'border-box',
          ...navAnimStyle
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', flex: '0 0 auto' }}>
            <img
              src={logo}
              alt="PetroDash"
              style={{ height: '90px', padding: '1rem 0' }}
              className="navbar-logo"
            />
          </Link>
          
          {/* Desktop LOGIN button */}
          <div className="navbar-login-desktop" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            flex: '0 0 auto',
            zIndex: 1202 
          }}>
            <Btn color="green" label="LOGIN" onClick={toggleModal} rounded fontsize='0.8rem'/>
          </div>

          {/* Hamburger for mobile */}
          <div className="navbar-hamburger" style={{ display: 'none', zIndex: 1202 }}>
            <Hamburger open={mobileMenuOpen} onClick={() => setMobileMenuOpen(v => !v)} />
          </div>

          {/* Mobile menu overlay */}
          {mobileMenuOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.25)',
                zIndex: 1200,
                transition: 'background 0.3s',
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          {/* Mobile menu drawer */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: mobileMenuOpen ? 0 : '-80vw',
              width: '80vw',
              maxWidth: 340,
              height: '100vh',
              background: '#fff',
              boxShadow: '0 0 24px 0 rgba(0,0,0,0.15)',
              zIndex: 1203,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              padding: '2rem 1.5rem 2rem 1.5rem',
              gap: '1.5rem',
              transition: 'right 0.35s cubic-bezier(.4,0,.2,1)',
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
            }}
          >
            {/* Close button */}
            <button
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                alignSelf: 'flex-end',
                background: 'none',
                border: 'none',
                fontSize: 28,
                color: '#182959',
                cursor: 'pointer',
                marginBottom: '1.5rem',
                marginTop: '-1rem',
                marginRight: '-0.5rem',
                padding: 0,
                lineHeight: 1,
              }}
            >
              &times;
            </button>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 24, alignSelf: 'center' }} onClick={() => setMobileMenuOpen(false)}>
              <img
                src="src/assets/petrodashlogo.png"
                alt="PetroDash"
                style={{ height: '40px' }}
              />            </Link>
            
            <div style={{ marginTop: '2rem', alignSelf: 'stretch' }}>
              {/* Full width, green LOGIN button for mobile */}
              <Btn
                color="green"
                label="LOGIN"
                style={{ width: '100%' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleModal();
                }}
              />
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              textAlign: 'center',
              color: '#aaa',
              fontSize: '0.9rem',
              marginTop: 'auto',
              paddingTop: '2rem'
            }}>
              &copy; {new Date().getFullYear()} PetroDash
            </div>
          </div>
          
          {isNavbarLogin && (
            <Modal onClose={toggleModal}>
              <LoginPage />
            </Modal>
          )}
        </nav>
      </div>
    </>
  );
}

export default Navbar;

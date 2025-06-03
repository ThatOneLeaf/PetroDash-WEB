import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Modal from '../components/modal'; 
import LoginPage from '../pages/Login_page/Login_page';
import Btn from '../components/ButtonComp';

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

function Navbar({ 
  isSticky = false, 
  onAboutClick, 
  onDisclosureClick, 
  onContactClick 
}) {
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
            transform-origin: left;
          }
          .navbar-center-btn:hover::after,
          .navbar-center-btn:focus::after {
            transform: scaleX(1);
          }
          .navbar-center-btn:hover,
          .navbar-center-btn:focus {
            color: #182959;
          }
          @media (max-width: 900px) {
            .navbar-center-desktop {
              display: none !important;
            }
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
      }}>
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          position: isSticky ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '72px',
          zIndex: 1000,
          boxSizing: 'border-box',
          ...navAnimStyle
        }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', zIndex: 1202 }}>
            <img
              src="src\assets\petrodashlogo.png"
              alt="PetroDash"
              style={{ height: '40px' }}
              className="navbar-logo"
            />
          </Link>

          {/* Desktop Center Navigation */}
          <div className="navbar-center-desktop" style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <button 
              onClick={onAboutClick}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '14px'
              }}
            >
              ABOUT
            </button>
            <button 
              onClick={onDisclosureClick}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '14px'
              }}
            >
              DISCLOSURE
            </button>
            <button 
              onClick={onContactClick}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '14px'
              }}
            >
              CONTACT US
            </button>
          </div>
          
          <Btn color="green" label="LOGIN" onClick={toggleModal} />

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
              alignItems: 'flex-start',
              padding: '2rem 1.5rem',
              gap: '2rem',
              transition: 'right 0.35s cubic-bezier(.4,0,.2,1)',
            }}
          >
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginBottom: 24 }} onClick={() => setMobileMenuOpen(false)}>
              <img
                src="src\\assets\\petrodashlogo.png"
                alt="PetroDash"
                style={{ height: '40px' }}
              />
            </Link>
            <button 
              onClick={() => { setMobileMenuOpen(false); onAboutClick && onAboutClick(); }}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '16px',
                marginBottom: 16,
                textAlign: 'left'
              }}
            >
              ABOUT
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onDisclosureClick && onDisclosureClick(); }}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '16px',
                marginBottom: 16,
                textAlign: 'left'
              }}
            >
              DISCLOSURE
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onContactClick && onContactClick(); }}
              className="navbar-center-btn"
              style={{ 
                background: 'none',
                border: 'none',
                color: '#333',
                cursor: 'pointer',
                fontFamily: 'Inter',
                fontSize: '16px',
                marginBottom: 16,
                textAlign: 'left'
              }}
            >
              CONTACT US
            </button>
            <Btn color="#2E7D32" label="LOGIN" onClick={() => { setMobileMenuOpen(false); toggleModal(); }} />
          </div>
          
          <Btn color="green" label="LOGIN" onClick={toggleModal} />

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

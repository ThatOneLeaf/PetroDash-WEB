import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar({ 
  isSticky = false, 
  onAboutClick, 
  onDisclosureClick, 
  onContactClick 
}) {
  const [scrolled, setScrolled] = useState(false);

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
            background: #2E7D32;
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
            color: #2E7D32;
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
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <img
              src="src\assets\petrodashlogo.png"
              alt="PetroDash"
              style={{ height: '40px' }}
              className="navbar-logo"
            />
          </Link>

          <div style={{ 
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

          <Link to="/login">
            <button style={{
              backgroundColor: '#2E7D32',
              color: 'white',
              padding: '8px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontSize: '15px',
              fontWeight: 'medium',
              letterSpacing: '0.17px',
              textTransform: 'uppercase',
              transition: 'background 0.2s'
            }}>
              LOGIN
            </button>
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Navbar;

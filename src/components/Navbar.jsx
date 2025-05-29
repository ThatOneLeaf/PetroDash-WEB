import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar({ isSticky = false }) {
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

  return (
    <div style={{
      height: isSticky ? '72px' : 'auto'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        position: isSticky ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '72px',
        zIndex: 1000,
        boxSizing: 'border-box',
        boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="src\assets\petrodashlogo.png" alt="PetroDash" style={{ height: '40px' }} />
        </Link>

        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <Link to="/about" style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            fontFamily: 'Inter', 
            fontSize: '15px',
            fontWeight: 'medium',
            letterSpacing: '0.17px',
            textTransform: 'uppercase'
          }}>
            ABOUT
          </Link>
          <Link to="/disclosure" style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            fontFamily: 'Inter', 
            fontSize: '15px',
            fontWeight: 'medium',
            letterSpacing: '0.17px',
            textTransform: 'uppercase'
          }}>
            DISCLOSURE
          </Link>
          <Link to="/contact" style={{ 
            textDecoration: 'none', 
            color: 'inherit', 
            fontFamily: 'Inter', 
            fontSize: '15px',
            fontWeight: 'medium',
            letterSpacing: '0.17px',
            textTransform: 'uppercase'
          }}>
            CONTACT US
          </Link>
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
            textTransform: 'uppercase'
          }}>
            LOGIN
          </button>
        </Link>
      </nav>
    </div>
  );
}

export default Navbar;

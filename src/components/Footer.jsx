import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#1a237e',
      color: 'white',
      padding: '3rem 4rem 0',
      marginBottom: 0  // Ensure no bottom margin
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '3rem'
      }}>
        {/* Logo and Address */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <img src="src\assets\petrodashlogodark.png" alt="PetroDash" style={{ height: '40px' }} />
          <p style={{ 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: 'white'
          }}>
            PetroEnergy Resources Corporation<br />
            7F JMT Building, ADB Avenue,<br />
            Ortigas Center, Pasig City
          </p>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '3rem'
        }}>
          <Link to="/about" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontFamily: 'Inter',
            fontSize: '14px'
          }}>ABOUT US</Link>
          <Link to="/disclosure" style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontFamily: 'Inter',
            fontSize: '14px'
          }}>DISCLOSURE</Link>
          {/* CONTACT US link removed */}
        </div>
      </div>

      {/* Copyright with white background */}
      <div style={{
        backgroundColor: 'white',
        color: '#1a237e',
        fontSize: '14px',
        textAlign: 'center',
        padding: '1rem 0',
        margin: 0,  // Remove any margin
        width: '100%'  // Ensure full width
      }}>
        © 2025 PetroEnergy Resources Corporation. All Rights Reserved. Privacy Policy
      </div>
    </footer>
  );
}

export default Footer;
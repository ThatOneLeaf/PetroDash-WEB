import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      color: 'white',
      padding: '3rem 4rem 0',
      marginBottom: 0  // Ensure no bottom margin
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>

        {/* Navigation Links 
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
        </div>
        
        */}
        
      </div>

      {/* Copyright with white background */}
      <div style={{
        backgroundColor: 'white',
        color: 'gray',
        fontSize: '14px',
        textAlign: 'center',
        padding: '1rem 0',
        margin: 0,  // Remove any margin
        width: '100%',  // Ensure full width
        opacity: 0.5,  // Slightly transparent
      }}>
        © 2025 PetroEnergy Resources Corporation. All Rights Reserved. Privacy Policy
      </div>
    </footer>
  );
}

export default Footer;
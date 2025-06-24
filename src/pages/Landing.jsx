import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import image1 from '../assets/petroenergy_1.jpg';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoginIcon from '@mui/icons-material/Login';
import Modal from '../components/modal'; 
import LoginPage from './Login_page/Login_page';
import Btn from '../components/ButtonComp'

function Landing() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [isLoginModal, setLoginModal] = useState(false);

  const toggleModal = () => {
    setLoginModal(!isLoginModal);
  };
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>      <Navbar isSticky={true} />
        <div className="hero-section" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '2rem 1rem' : isTablet ? '3rem 2rem' : '4rem 6rem',
        gap: isMobile ? '2rem' : '4rem',
        minHeight: '80vh'
      }}>
        <div className="hero-text" style={{
          flex: 1,
          textAlign: isMobile ? 'center' : 'left',
          maxWidth: isMobile ? '100%' : '50%'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3.5rem',
            marginBottom: isMobile ? '1rem' : '1.5rem',
            fontStyle: 'italic',
            lineHeight: '1.2',
            fontWeight: 'bold'
          }}>
            <span style={{ fontWeight: 'bold' }}>PetroEnergy</span>, building a more sustainable and ethical future
          </h1>
          
          <p style={{
            color: '#666',
            marginBottom: isMobile ? '2rem' : '2.5rem',
            fontSize: isMobile ? '1rem' : '1.1rem',
            lineHeight: '1.6'
          }}>
            ESG is a vital framework that helps investors assess sustainability risks and guides businesses in operating responsibly for long-term impact.
          </p>

          <Btn
            color="green"
            label="LOGIN"
            startIcon={<LoginIcon />}
            onClick={toggleModal}
            rounded
            fontsize={isMobile ? "1rem" : "1.2rem"}
          />
        </div>

        <div className="hero-image" style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          maxWidth: isMobile ? '100%' : '50%'
        }}>
          <div style={{
            backgroundColor: "#7694c4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: isMobile ? "250px" : isTablet ? "300px" : "400px",
            maxWidth: isMobile ? "100%" : "500px",
            borderRadius: "24px",
            overflow: "hidden"
          }}>
            <img
              src={image1}
              alt="PetroEnergy Sustainability"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.825,
                borderRadius: "24px"
              }}
            />
          </div>
        </div>
      </div>

      {isLoginModal && (
        <Modal onClose={toggleModal}>
          <LoginPage />
        </Modal>
      )}      
      { /* Additionaal sections 
        <section ref={aboutRef} className="landing-section" style={{
          backgroundColor: '#f5f5f5',
          padding: '6rem 4rem',
          textAlign: 'center'
        }}>
          <p style={{
            maxWidth: '900px',
            margin: '0 auto',
            marginBottom: '4rem',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            color: '#444'
          }}>
            Proin vel lectus condimentum, consequat leo a, euismod mauris. Integer ac mauris nec ex
            elementum pellentesque. Pellentesque habitant morbi tristique senectus et netus et malesuada
            fames ac turpis egestas. Aliquam et iaculis felis. Mauris nec tellus tellus.
          </p>

          <div className="landing-about-images" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem'
          }}>
            {[1, 2, 3].map((index) => (
              <div key={index} style={{
                width: '300px',
                height: '300px',
                backgroundColor: index === 2 ? '#2E7D32' : '#1a237e',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <p>Image {index} Placeholder</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={disclosureRef} className="landing-disclosure" style={{
          backgroundColor: '#2E7D32',
          color: 'white',
          padding: '6rem 4rem',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '4rem'
        }}>
          <div style={{ 
            maxWidth: '600px',
            flex: 1 
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              marginBottom: '1.5rem'
            }}>Disclosure</h2>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Proin vel lectus condimentum, consequat leo a, euismod mauris. Integer ac mauris nec ex elementum
              pellentesque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
              Aliquam et iaculis felis. Mauris nec tellus tellus.
            </p>
          </div>
          <div className="disclosure-img" style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '12px',
            height: '300px',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <p>Image Placeholder</p>
          </div>
        </section>

        
      */}
      <Footer />
    </Box>
  );
}

export default Landing;

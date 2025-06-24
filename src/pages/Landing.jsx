import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Box } from '@mui/material';
import image1 from '../assets/petroenergy_1.jpg';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LoginIcon from '@mui/icons-material/Login';
import Modal from '../components/modal'; 
import LoginPage from './Login_page/Login_page';
import Btn from '../components/ButtonComp'

function Landing() {
  // Create refs for each section
  const aboutRef = useRef(null);
  const disclosureRef = useRef(null);
  const contactRef = useRef(null);
  const [isLoginModal, setLoginModal] = useState(false);

  // Scroll handler function
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

const toggleModal = () => {
    setLoginModal(!isLoginModal);
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 900px) {
            .landing-main {
              flex-direction: column !important;
              padding: 3rem 1.5rem !important;
              gap: 2rem !important;
            }
            .landing-section {
              padding: 3rem 1.5rem !important;
            }
            .landing-about-images {
              flex-direction: column !important;
              gap: 1.5rem !important;
            }
            .landing-about-images > div {
              width: 100% !important;
              max-width: 350px;
              margin: 0 auto;
              height: 180px !important;
            }
            .landing-disclosure {
              flex-direction: column !important;
              gap: 2rem !important;
              padding: 3rem 1.5rem !important;
            }
            .landing-disclosure > div,
            .landing-disclosure > .disclosure-img {
              width: 100% !important;
              max-width: 100%;
            }
            .landing-contact-flex {
              flex-direction: column !important;
              gap: 2rem !important;
            }
            .landing-contact-flex > div {
              max-width: 100% !important;
            }
          }
          @media (max-width: 600px) {
            .landing-main,
            .landing-section,
            .landing-disclosure {
              padding: 1.5rem 0.5rem !important;
            }
            h1 {
              font-size: 2rem !important;
            }
            h2 {
              font-size: 1.3rem !important;
            }
          }
        `}
      </style>
      <Navbar 
        isSticky={true}
        onAboutClick={() => scrollToSection(aboutRef)}
        onDisclosureClick={() => scrollToSection(disclosureRef)}
        onContactClick={() => scrollToSection(contactRef)}
      />
      
      <main className="landing-main" style={{
        display: 'flex',
        padding: '5.5rem',
        gap: '4rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '2rem',
            fontStyle: 'italic',
            lineHeight: '1.2'
          }}>
            <span style={{ fontWeight: 'bold' }}>PetroEnergy</span>, building a more sustainable and ethical future
          </h1>
          
          <p style={{
            color: '#666',
            marginBottom: '3rem',
            fontSize: '1.1rem',
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
            fontsize="1.2rem"
          />
        </div>

        {isLoginModal && (
          <Modal onClose={toggleModal}>
            <LoginPage />
          </Modal>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              bgcolor: "#7694c4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 400, // Use a fixed px value for reliable sizing
              borderRadius: "24px",
              overflow: "hidden", // Ensures no overflow
              p: 0 // No padding
            }}
          >
            <Box
              component="img"
              src={image1}
              alt="Login"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.825,
                borderRadius: "24px",
                display: "block", // Prevents extra space below
                m: 0, // No margin
                p: 0  // No padding
              }}
            />
          </Box>
        </div>
      </main>
      
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
    </div>
  );
}

export default Landing;

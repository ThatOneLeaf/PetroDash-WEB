import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

function Landing() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden',  // Changed from overflowX to prevent any scroll
      position: 'relative'
    }}>
      <Navbar isSticky={true} />
      
      <main style={{
        display: 'flex',
        padding: '6rem 4rem',
        gap: '4rem'
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '2rem',
            fontStyle: 'italic',
            lineHeight: '1.2'
          }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h1>
          
          <p style={{
            color: '#666',
            marginBottom: '3rem',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Proin vel lectus condimentum, consequat leo a, euismod
            mauris. Integer ac mauris nec ex elementum
            pellentesque.
          </p>

          <Link to="/login">
            <button style={{
              backgroundColor: '#2E7D32',
              color: 'white',
              padding: '12px 32px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontWeight: '500',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              LOGIN
            </button>
          </Link>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '12px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}>
            <p>Image Placeholder</p>
          </div>
        </div>
      </main>

      <section style={{
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

        <div style={{
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

      <section style={{
        backgroundColor: '#2E7D32',
        color: 'white',
        padding: '6rem 4rem',
        width: '100%',
        boxSizing: 'border-box',
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
        <div style={{
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

      <section style={{
        padding: '6rem 4rem'
      }}>
        <h2 style={{
          fontSize: '2rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>Contact Us</h2>
        
        <div style={{
          display: 'flex',
          gap: '4rem',
          justifyContent: 'center'
        }}>
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <form>
              <input
                type="text"
                placeholder="Name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <input
                type="tel"
                placeholder="Phone"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <textarea
                placeholder="Message"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </form>
          </div>

          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '2rem'
            }}>
              <p style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <EmailIcon style={{ 
                  color: '#2E7D32', 
                  fontSize: '32px'
                }} />
                <a href="mailto:ccu@petroenergy.com.ph" style={{ 
                  color: '#2E7D32', 
                  textDecoration: 'none',
                  fontFamily: 'Inter',
                  fontSize: '16px'
                }}>
                  ccu@petroenergy.com.ph
                </a>
              </p>
              <p style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <PhoneIcon style={{ 
                  color: '#2E7D32', 
                  fontSize: '32px'
                }} />
                <span style={{ 
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  padding: '4px 8px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '4px'
                }}>(+632) 8637-2917</span>
              </p>
              <p style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: '1rem'
              }}>
                <LocationOnIcon style={{ 
                  color: '#2E7D32', 
                  fontSize: '32px',
                  marginTop: '4px' 
                }} />
                <span style={{ 
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  lineHeight: '1.6'
                }}>
                  PetroEnergy Resources Corporation<br />
                  7F JMT Building, ADB Avenue,<br />
                  Ortigas Center, Pasig City
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;

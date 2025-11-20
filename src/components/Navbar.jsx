// src/components/Navbar.jsx
import { useState } from "react";
import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import './Navbar.css';
import { Menu } from "lucide-react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


export function AppNavbar({ onLinkClick = null }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLink = (section) => {
    if (onLinkClick) {
      onLinkClick(section);
      setShowMenu(false); // Close mobile menu after clicking
    }
  };

  return (
    <Navbar expand="lg" bg="light" fixed="top" className="shadow-sm border-bottom">
      <Container className="d-flex justify-content-between align-items-center" style={{ height: "28px" }}>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
  <img src="/assets/asset2.png" alt="AKSEMA Logo" style={{ height: '40px' }} />
  <span onClick={() => handleLink('/')} className="fw-bold fs-5 ms-2" >AKSEMA</span>
</Navbar.Brand>

        {/* Desktop Navigation */}
        <Nav className="d-none d-lg-flex align-items-center me-auto ms-5 gap-4">
          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleLink('/')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Homep 首页
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleLink('pricing')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Pricing
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleLink('privacy')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Privacy Policy

            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              onClick={() => handleLink('contact')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Contact
            </button>
          </li>
        </Nav>

        {/* Desktop CTA */}
        <div className="d-none d-lg-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/login')}
          >
            Start Now For Free 
          </Button>
        </div>

        {/* Mobile menu button */}
        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          className="d-lg-none border-0 p-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <Menu size={24} className="text-primary" />
        </Navbar.Toggle>
      </Container>

      {/* Mobile Navigation - Offcanvas */}
      <Offcanvas
        id="offcanvasNavbar"
        show={showMenu}
        onHide={() => setShowMenu(false)}
        placement="end"
        className="offcanvas-custom"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="d-flex flex-column gap-3">
            <button
              type="button"
              onClick={() => handleLink('featuressection')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom text-start p-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleLink('pricing')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom text-start p-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Pricing
            </button>
            <button
              type="button"
              onClick={() => handleLink('about')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom text-start p-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => handleLink('contact')}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom text-start p-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => { navigate('/login'); setShowMenu(false); }}
              className="text-dark text-decoration-none bg-transparent border-0 nav-link-custom text-start p-0"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Sign In
            </button>
          </div>
          <div className="d-flex flex-column gap-2 mt-4">
            <Button 
              variant="primary" 
              onClick={() => { navigate('/login'); setShowMenu(false); }}
            >
              Start Now For Free
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
}

AppNavbar.propTypes = {
  onLinkClick: PropTypes.func,
};

export default AppNavbar;
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  return (
    <>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand to="/"><strong>Aksema Gestion Inventaire System</strong>
          </Navbar.Brand>
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/" className="nav-link">Produits SL3A</Nav.Link>
            <Nav.Link as={Link} to="/produit" className="nav-link">Nouveau Produits</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;

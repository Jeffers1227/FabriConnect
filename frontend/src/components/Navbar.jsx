import { Link, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar-custom sticky-top shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold fs-4">
          FabriConnect
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="mx-2">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/catalog" className="mx-2">Catálogo</Nav.Link>
            
            {token ? (
              <>
                <Nav.Link as={Link} to="/orders" className="mx-2">Mis Pedidos</Nav.Link>
                <Nav.Link onClick={handleLogout} className="mx-2" style={{ cursor: 'pointer' }}>Salir</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/login" className="mx-2">
                <FiUser className="me-1" />
                Mi Cuenta
              </Nav.Link>
            )}
            
            <Nav.Link as={Link} to="/cart" className="mx-2 position-relative">
              <FiShoppingCart size={20} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                3
              </span>
            </Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;

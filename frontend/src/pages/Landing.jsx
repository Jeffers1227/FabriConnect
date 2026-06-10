import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center text-center mt-5 pt-5">
      <h1 className="display-4 fw-bold mb-3">Bienvenido a FabriConnect</h1>
      <p className="lead text-muted mb-5" style={{ maxWidth: '600px' }}>
        Tu plataforma integral para la fabricación y adquisición de componentes técnicos. Conecta con proveedores, gestiona tus pedidos y optimiza tus procesos de producción.
      </p>
      
      <div className="d-flex gap-3">
        <Button as={Link} to="/login" variant="primary" className="btn-primary-custom px-4 py-2 fs-5">
          Iniciar Sesión
        </Button>
        <Button as={Link} to="/register" variant="outline-secondary" className="btn-outline-custom px-4 py-2 fs-5">
          Registrarse
        </Button>
      </div>
    </Container>
  );
};

export default Landing;

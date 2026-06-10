import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-4 mt-auto">
      <Container className="text-center text-muted">
        <small>&copy; {new Date().getFullYear()} FabriConnect. Todos los derechos reservados.</small>
      </Container>
    </footer>
  );
};

export default Footer;

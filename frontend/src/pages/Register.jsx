import { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', rol: 'comprador' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/registro', formData);
      alert('Registro exitoso, por favor inicia sesión');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100 py-5">
      <Card className="card-glass border-0 shadow-sm w-100" style={{ maxWidth: '400px' }}>
        <Card.Body className="p-4 p-md-5">
          <h3 className="text-center fw-bold mb-4">Registro</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre Completo</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required 
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tipo de Usuario</Form.Label>
              <Form.Select 
                value={formData.rol}
                onChange={(e) => setFormData({...formData, rol: e.target.value})}
              >
                <option value="comprador">Comprador</option>
                <option value="proveedor">Proveedor</option>
              </Form.Select>
            </Form.Group>
            
            <Button variant="primary" type="submit" className="btn-primary-custom w-100 py-2 mb-3" disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
            
            <div className="text-center text-muted small">
              ¿Ya tienes una cuenta? <Link to="/login" className="text-primary text-decoration-none fw-bold">Inicia Sesión</Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;

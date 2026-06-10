import { useState } from 'react';
import { Container, Row, Col, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FiShoppingCart, FiTool, FiDownload } from 'react-icons/fi';
import api from '../services/api';

const MOCK_PRODUCT = {
  id: 1,
  name: 'Componente Electrónico XYZ',
  shortDescription: 'Un componente esencial para circuitos de alta frecuencia.',
  price: 49.99,
  availability: 'En Stock (150 unidades)',
  provider: 'TechParts Inc.',
  rating: 4.5,
  deliveryTime: '3-5 días hábiles',
  specs: [
    'Voltaje: 5V',
    'Corriente: 2A',
    'Protocolo de Comunicación: SPI',
    'Dimensiones: 10mm x 10mm x 2mm',
    'Material: Silicio',
  ],
  longDescription: `Este componente electrónico XYZ es ideal para aplicaciones que requieren alta precisión y estabilidad en entornos de alta frecuencia. Su diseño compacto y robusto asegura un rendimiento óptimo y una larga vida útil. Es compatible con una amplia gama de microcontroladores y sistemas embebidos, facilitando su integración en diversos proyectos. Incluye protección contra sobretensiones y cortocircuitos, garantizando la seguridad de su circuito.\n\nPerfecto para prototipos, producción en masa y reparaciones, el Componente Electrónico XYZ es la elección preferida por ingenieros y aficionados por igual.`
};

const ProductDetail = () => {
  const [showModal, setShowModal] = useState(false);
  const [material, setMaterial] = useState('PLA');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFabricacion = async () => {
    if (!localStorage.getItem('token')) {
      setMessage({ type: 'danger', text: 'Debes iniciar sesión para solicitar fabricación a medida.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await api.post('/cad/solicitar-fabricacion', {
        nombreArchivo: `diseño_${MOCK_PRODUCT.name.replace(/\s+/g, '_')}.stl`,
        material
      });
      setMessage({ type: 'success', text: res.data.mensaje || 'Enviado a la cola correctamente' });
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Error al enviar solicitud' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Detalles del Producto</h2>
      </div>

      <Row className="g-5">
        <Col md={6}>
          <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '400px', border: '1px solid #e0e0e0' }}>
             <span className="text-muted fs-4">Imagen del Producto</span>
          </div>
          <div className="d-flex gap-2 mt-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-light rounded" style={{ width: '80px', height: '60px', border: '1px solid #e0e0e0' }}></div>
            ))}
          </div>
        </Col>

        <Col md={6}>
          <h3 className="fw-bold">{MOCK_PRODUCT.name}</h3>
          <p className="text-muted">{MOCK_PRODUCT.shortDescription}</p>
          <h2 className="text-primary fw-bold my-3">S/ {MOCK_PRODUCT.price.toFixed(2)}</h2>
          
          <div className="mb-4 small">
            <div className="mb-1"><strong>Disponibilidad:</strong> {MOCK_PRODUCT.availability}</div>
            <div className="mb-1"><strong>Proveedor:</strong> {MOCK_PRODUCT.provider} <Badge bg="warning" text="dark">★ {MOCK_PRODUCT.rating}</Badge></div>
            <div><strong>Tiempo de Entrega Estimado:</strong> {MOCK_PRODUCT.deliveryTime}</div>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold">Especificaciones Técnicas:</h5>
            <ul className="text-muted ps-3">
              {MOCK_PRODUCT.specs.map((spec, index) => (
                <li key={index} className="mb-1">{spec}</li>
              ))}
            </ul>
          </div>

          <div className="d-flex gap-3 mb-3">
            <Button variant="primary" className="btn-primary-custom flex-grow-1 py-2">
              <FiShoppingCart className="me-2" />
              Añadir al Carrito
            </Button>
            <Button variant="secondary" onClick={handleFabricacion} className="py-2 flex-grow-1" disabled={loading}>
              <FiTool className="me-2" />
              {loading ? 'Procesando...' : 'Solicitar Fabricación a Medida'}
            </Button>
          </div>
          {message.text && (
            <Alert variant={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          <div>
            <h6 className="fw-bold mb-2">Hoja de Datos del Fabricante:</h6>
            <a href="#" className="text-decoration-none d-flex align-items-center text-primary">
              <FiDownload className="me-1" />
              Descargar Hoja de Datos (PDF)
            </a>
          </div>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <h4 className="fw-bold border-bottom pb-2 mb-3">Descripción Detallada</h4>
          <div className="text-muted" style={{ whiteSpace: 'pre-line' }}>
            {MOCK_PRODUCT.longDescription}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;

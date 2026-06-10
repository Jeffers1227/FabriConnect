import { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Microcontrolador XYZ-123', description: 'Microcontrolador de 32 bits, 120MHz, con múltiples puertos I/O y soporte I2C/SPI.', price: 25.00 },
  { id: 2, name: 'Sensor de Temperatura NTC', description: 'Sensor NTC de alta precisión para mediciones en entornos industriales (-40 a 125 °C).', price: 5.50 },
  { id: 3, name: 'Módulo WiFi ESP-01', description: 'Módulo de conexión inalámbrica compacto, ideal para proyectos IoT.', price: 12.00 },
  { id: 4, name: 'Resistencias 10kOhm (x100)', description: 'Paquete de 100 resistencias SMD de 10kOhm con 1% de tolerancia.', price: 3.50 },
  { id: 5, name: 'Pantalla OLED 0.96"', description: 'Pantalla OLED I2C de 128x64 píxeles, luz azul.', price: 18.00 },
];

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="my-5">
      <h2 className="mb-4">Página de Inicio / Búsqueda</h2>
      
      {/* Search Bar */}
      <Row className="mb-5 justify-content-center">
        <Col md={10} lg={8}>
          <InputGroup className="shadow-sm">
            <Form.Control
              size="lg"
              placeholder="Buscar componentes técnicos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-end-0"
              style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
            />
            <Button variant="primary" className="btn-primary-custom" style={{ borderTopRightRadius: '8px', borderBottomRightRadius: '8px', padding: '0 24px' }}>
              <FiSearch size={20} className="me-2"/>
              Buscar
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* Product Grid */}
      <Row className="g-4">
        {filteredProducts.map(product => (
          <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
            <ProductCard {...product} />
          </Col>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center text-muted mt-5">
            No se encontraron componentes que coincidan con la búsqueda.
          </div>
        )}
      </Row>
    </Container>
  );
};

export default Catalog;

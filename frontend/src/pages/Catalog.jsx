import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/productos');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const nombre = product.nombre || '';
    const desc = product.descripcion || '';
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
           desc.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
      {loading ? (
        <div className="text-center text-muted mt-5">Cargando productos...</div>
      ) : (
        <Row className="g-4">
          {filteredProducts.map(product => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard 
                id={product.id}
                name={product.nombre || 'Sin nombre'} 
                description={product.descripcion || 'Sin descripción'} 
                price={parseFloat(product.precio) || 0} 
              />
            </Col>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center text-muted mt-5">
              No se encontraron componentes que coincidan con la búsqueda.
            </div>
          )}
        </Row>
      )}
    </Container>
  );
};

export default Catalog;

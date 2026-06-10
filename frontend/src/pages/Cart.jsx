import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MOCK_CART_ITEMS = [
  { id: 1, name: 'Microcontrolador XYZ-123', provider: 'ElectroTech', quantity: 2, price: 25.00 },
  { id: 2, name: 'Sensor de Temperatura NTC', provider: 'SensorCorp', quantity: 5, price: 5.50 },
  { id: 3, name: 'Módulo WiFi ESP-01', provider: 'Wireless Solutions', quantity: 1, price: 12.00 },
];

const Cart = () => {
  const subtotal = MOCK_CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 7.50;
  const total = subtotal + shipping;

  return (
    <Container className="my-5">
      <h2 className="mb-4">Carrito de Compras</h2>

      <Row className="g-4">
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">Productos en tu carrito</h5>
            <span className="text-muted">{MOCK_CART_ITEMS.length} items</span>
          </div>
          
          <ListGroup variant="flush" className="card-glass shadow-sm rounded border">
            {MOCK_CART_ITEMS.map((item) => (
              <ListGroup.Item key={item.id} className="p-4">
                <Row className="align-items-center">
                  <Col xs={3} sm={2}>
                    <div className="bg-light rounded d-flex align-items-center justify-content-center w-100" style={{ height: '80px' }}>
                      <span className="small text-muted">Img</span>
                    </div>
                  </Col>
                  <Col xs={9} sm={6}>
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <div className="text-muted small mb-2">Proveedor: {item.provider}</div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">Cantidad:</span>
                      <input type="number" defaultValue={item.quantity} className="form-control form-control-sm text-center" style={{ width: '60px' }} min="1" />
                    </div>
                  </Col>
                  <Col xs={12} sm={4} className="d-flex justify-content-between align-items-center mt-3 mt-sm-0 text-sm-end">
                    <h5 className="text-primary fw-bold mb-0 w-100">S/ {(item.price * item.quantity).toFixed(2)}</h5>
                    <Button variant="link" className="text-danger p-0 ms-2">
                      <FiTrash2 size={20} />
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col lg={4}>
          <Card className="card-glass border-0 sticky-top" style={{ top: '100px' }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Resumen del Pedido</h5>
              
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-muted border-bottom pb-3">
                <span>Envío estimado:</span>
                <span>S/ {shipping.toFixed(2)}</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total:</span>
                <span className="fw-bold fs-5 text-primary">S/ {total.toFixed(2)}</span>
              </div>

              <Button as={Link} to="/checkout" variant="primary" className="btn-primary-custom w-100 py-2 fs-6">
                Proceder al pago
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;

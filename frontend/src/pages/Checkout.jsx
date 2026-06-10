import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { FiCreditCard, FiMapPin } from 'react-icons/fi';
import { FaPaypal, FaUniversity } from 'react-icons/fa';

const Checkout = () => {
  return (
    <Container className="my-5">
      <h2 className="mb-4">Confirmación de Pedido y Pago</h2>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="card-glass border-0 mb-4">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold">1. Seleccionar Método de Pago</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <div className="border rounded p-3 mb-2 bg-light d-flex align-items-center">
                  <Form.Check type="radio" name="payment" id="pay-card" defaultChecked className="me-3" />
                  <FiCreditCard className="text-primary me-2" size={24} />
                  <label htmlFor="pay-card" className="fw-bold mb-0 flex-grow-1" style={{ cursor: 'pointer' }}>Tarjeta de Crédito / Débito</label>
                </div>
                <div className="border rounded p-3 mb-2 d-flex align-items-center">
                  <Form.Check type="radio" name="payment" id="pay-paypal" className="me-3" />
                  <FaPaypal className="text-primary me-2" size={24} />
                  <label htmlFor="pay-paypal" className="fw-bold mb-0 flex-grow-1" style={{ cursor: 'pointer' }}>PayPal</label>
                </div>
                <div className="border rounded p-3 d-flex align-items-center">
                  <Form.Check type="radio" name="payment" id="pay-bank" className="me-3" />
                  <FaUniversity className="text-primary me-2" size={24} />
                  <label htmlFor="pay-bank" className="fw-bold mb-0 flex-grow-1" style={{ cursor: 'pointer' }}>Transferencia Bancaria</label>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="card-glass border-0">
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold">2. Confirmar Dirección de Entrega</h5>
            </Card.Header>
            <Card.Body>
              <div className="border rounded p-3 bg-light">
                <div className="d-flex align-items-start">
                  <FiMapPin className="text-primary mt-1 me-2" size={20} />
                  <div>
                    <h6 className="fw-bold mb-1">Dirección Actual</h6>
                    <p className="text-muted mb-3">Calle Ficticia 123, Ciudad Imaginaria, País de Ensueño, CP 00000</p>
                    <Button variant="outline-secondary" size="sm" className="btn-outline-custom">Cambiar Dirección</Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="card-glass border-0 sticky-top" style={{ top: '100px' }}>
            <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
              <h5 className="fw-bold">3. Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between mb-3 text-muted">
                <span>Subtotal:</span>
                <span>S/ 150.00</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-muted border-bottom pb-3">
                <span>Envío:</span>
                <span>S/ 10.00</span>
              </div>
              
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total:</span>
                <span className="fw-bold fs-5 text-primary">S/ 160.00</span>
              </div>

              <Button variant="primary" className="btn-primary-custom w-100 py-3 fs-5" onClick={() => alert('Pago procesado!')}>
                Confirmar Pedido y Pagar
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;

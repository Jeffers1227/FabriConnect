import { Container, Card, Row, Col, Badge, Button } from 'react-bootstrap';

const MOCK_ORDERS = [
  {
    id: '#FC-20240715-001',
    date: '15/07/2024',
    provider: 'Componentes XYZ S.A.',
    total: 125.50,
    address: 'Calle Ficticia 123, Ciudad, País',
    status: 'Entregado',
    items: [
      'Microcontrolador ABC (x2) - S/ 50.00',
      'Sensor de Temperatura DEF (x5) - S/ 75.50'
    ]
  },
  {
    id: '#FC-20240710-002',
    date: '10/07/2024',
    provider: 'Electrónica Mundo Ltda.',
    total: 89.99,
    address: 'Calle Ficticia 123, Ciudad, País',
    status: 'En Proceso',
    items: [
      'Resistencias 10kOhm (x50) - S/ 15.00',
      'Condensadores 100uF (x20) - S/ 20.00',
      'Placa de Desarrollo ESP32 (x1) - S/ 54.99'
    ]
  },
  {
    id: '#FC-20240701-003',
    date: '01/07/2024',
    provider: 'Innovación Tech S.A.',
    total: 250.00,
    address: 'Calle Ficticia 123, Ciudad, País',
    status: 'Entregado',
    items: [
      'Módulo Bluetooth Low Energy (x10) - S/ 150.00',
      'Batería Li-Po 3.7V (x5) - S/ 100.00'
    ]
  }
];

const OrderHistory = () => {
  return (
    <Container className="my-5">
      <h2 className="mb-4">Historial de Pedidos</h2>

      <div className="d-flex flex-column gap-4">
        {MOCK_ORDERS.map((order, index) => (
          <Card key={index} className="card-glass border-0">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="fw-bold mb-0">Pedido {order.id}</h5>
              <Badge bg={order.status === 'Entregado' ? 'success' : 'warning'} text={order.status === 'En Proceso' ? 'dark' : 'light'}>
                Estado: {order.status}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 text-muted small">
                <Col md={6}>
                  <div><strong>Fecha del Pedido:</strong> {order.date}</div>
                  <div><strong>Proveedor:</strong> {order.provider}</div>
                </Col>
                <Col md={6}>
                  <div><strong>Total:</strong> S/ {order.total.toFixed(2)}</div>
                  <div><strong>Dirección de Envío:</strong> {order.address}</div>
                </Col>
              </Row>

              <h6 className="fw-bold mt-4 mb-2">Artículos:</h6>
              <ul className="text-muted small">
                {order.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <Button variant="outline-primary" className="btn-outline-custom">Ver Detalles</Button>
                {order.status === 'Entregado' ? (
                  <Button variant="warning" className="text-dark">Calificar Proveedor</Button>
                ) : (
                  <Button variant="secondary">Seguimiento</Button>
                )}
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
};

export default OrderHistory;

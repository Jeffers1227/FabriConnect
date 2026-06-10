import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, name, description, price }) => {
  return (
    <Card className="h-100 card-glass border-0">
      {/* Placeholder Image */}
      <div 
        className="bg-light d-flex align-items-center justify-content-center text-muted"
        style={{ height: '200px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
      >
        <span className="fs-5">Imagen</span>
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fw-bold">{name}</Card.Title>
        <Card.Text className="text-muted flex-grow-1 small">
          {description.length > 80 ? description.substring(0, 80) + '...' : description}
        </Card.Text>
        <h5 className="text-primary mb-3 fw-bold">S/ {price.toFixed(2)}</h5>
        <Button as={Link} to={`/product/${id}`} variant="primary" className="btn-primary-custom w-100 mt-auto">
          Ver Detalles
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;

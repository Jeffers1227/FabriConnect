import React from 'react';

export default function CartOffcanvas({ cartItems, removeFromCart, setVista }) {
  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0);

  return (
    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasCart" aria-labelledby="offcanvasCartLabel">
      <div className="offcanvas-header bg-primary text-white">
        <h5 className="offcanvas-title" id="offcanvasCartLabel">
          <i className="bi bi-cart3 me-2"></i> Tu Carrito
        </h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      
      <div className="offcanvas-body">
        {cartItems.length === 0 ? (
          <div className="text-center mt-5 text-muted">
            <i className="bi bi-cart-x fs-1"></i>
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <ul className="list-group mb-3">
            {cartItems.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="my-0 fw-bold">{item.nombre}</h6>
                  <small className="text-muted">S/ {parseFloat(item.precio).toFixed(2)}</small>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(index)}>
                  <i className="bi bi-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
        
        {cartItems.length > 0 && (
          <div className="mt-4 border-top pt-3">
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold">Total:</h5>
              <h5 className="fw-bold text-primary">S/ {total.toFixed(2)}</h5>
            </div>
            
            <button 
              className="btn btn-success w-100 fw-bold py-2 shadow-sm"
              data-bs-dismiss="offcanvas" 
              onClick={() => setVista('checkout')}
            >
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { ShoppingCart, Trash2, ArrowRight, PackageX } from 'lucide-react';

export default function CartOffcanvas({ cartItems, removeFromCart, setVista }) {
  const total = cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0);

  return (
    <div className="offcanvas offcanvas-end shadow-lg" tabIndex="-1" id="offcanvasCart" aria-labelledby="offcanvasCartLabel" style={{ backgroundColor: '#0f172a', borderLeft: '1px solid #334155' }}>
      
      {/* HEADER DEL CARRITO */}
      <div className="offcanvas-header border-bottom border-secondary py-4">
        <h5 className="offcanvas-title text-white fw-bold d-flex align-items-center" id="offcanvasCartLabel">
          <ShoppingCart className="me-3 text-info" size={26} /> Tu Carrito de Compras
        </h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      
      {/* CUERPO DEL CARRITO */}
      <div className="offcanvas-body d-flex flex-column p-0">
        {cartItems.length === 0 ? (
          <div className="text-center mt-5 p-4 text-white-50 h-100 d-flex flex-column justify-content-center align-items-center">
            <PackageX size={70} className="mb-4 opacity-25" />
            <h5 className="fw-bold text-white mb-2">Tu carrito está vacío</h5>
            <p className="small mb-4">Aún no has agregado ningún componente o diseño para fabricar.</p>
            <button className="btn btn-outline-info rounded-pill px-4 fw-bold" data-bs-dismiss="offcanvas">
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto p-3">
            <ul className="list-group list-group-flush mb-3">
              {cartItems.map((item, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center bg-transparent border-bottom border-secondary px-0 py-3 animate__animated animate__fadeInRight animate__faster">
                  
                  <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                    {/* Miniatura del producto */}
                    <div className="bg-dark rounded-3 me-3 border border-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0" style={{width: '55px', height: '55px'}}>
                        {item.imagen_url ? (
                            <img src={item.imagen_url} alt={item.nombre} className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <ShoppingCart size={20} className="text-white-50" />
                        )}
                    </div>
                    
                    {/* Info del producto */}
                    <div className="text-truncate pe-2">
                      <h6 className="my-0 fw-bold text-white mb-1 text-truncate" style={{ fontSize: '15px' }}>{item.nombre}</h6>
                      <span className="text-info fw-bold small">S/ {parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón Eliminar */}
                  <button 
                    className="btn btn-sm btn-outline-danger border-0 rounded-circle flex-shrink-0 transition" 
                    onClick={() => removeFromCart(index)}
                    title="Eliminar del carrito"
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* FOOTER: TOTAL Y BOTÓN DE PAGO */}
        {cartItems.length > 0 && (
          <div className="mt-auto border-top border-secondary p-4 bg-dark">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-white-50 fs-6">Total a pagar:</span>
              <h2 className="fw-bold text-white mb-0">S/ {total.toFixed(2)}</h2>
            </div>
            
            <button 
              className="btn btn-info text-dark w-100 fw-bold py-3 shadow-lg rounded-pill d-flex justify-content-center align-items-center transition hover-scale fs-5"
              data-bs-dismiss="offcanvas" 
              onClick={() => setVista('checkout')}
            >
              Proceder al Pago <ArrowRight size={22} className="ms-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
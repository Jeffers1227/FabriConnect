import React, { useState, useEffect } from 'react';

export default function Catalog({ addToCart }) {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="container py-5 mt-5">
      <h2 className="text-white fw-bold mb-5 text-center">Catálogo Tecnológico</h2>
      <div className="row g-4">
        {productos.map((prod) => (
          <div className="col-lg-3 col-md-4" key={prod.id}>
            <div className="card h-100 p-0 border-0 shadow-sm glass-effect">
              {/* Imagen con un degradado encima para que el texto siempre se lea */}
              <div style={{height: '180px', background: '#334155', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                 <i className="bi bi-cpu text-white-50" style={{fontSize: '3rem'}}></i>
              </div>
              <div className="card-body p-4 text-white">
                <span className="badge bg-warning text-dark mb-2 rounded-pill">{prod.proveedor}</span>
                <h5 className="fw-bold text-white">{prod.nombre}</h5>
                <p className="text-white-50 small mb-4">{prod.descripcion}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <h4 className="fw-bold text-white">S/ {parseFloat(prod.precio).toFixed(2)}</h4>
                  <button className="btn btn-premium" onClick={() => addToCart(prod)}>
                    <i className="bi bi-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
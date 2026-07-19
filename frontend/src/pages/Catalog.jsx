import React, { useState, useEffect } from 'react';
import { ShoppingCart, Cpu, Info } from 'lucide-react';

export default function Catalog({ addToCart }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Jalamos los productos reales de la Base de Datos al cargar la página
  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar el catálogo:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
        <div>
          <h2 className="fw-bold text-white mb-1 d-flex align-items-center">
            <Cpu className="me-3 text-info" size={36} /> Catálogo de Componentes
          </h2>
          <p className="text-white-50 mb-0">Piezas de alta calidad para tus proyectos de manufactura y robótica.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-white-50">
          <div className="spinner-border text-info mb-3" role="status"></div>
          <h5>Cargando catálogo en tiempo real...</h5>
        </div>
      ) : (
        <div className="row g-4">
          {productos.map(producto => (
            <div key={producto.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card glass-card h-100 border-0 shadow-lg position-relative overflow-hidden transition-hover" style={{ backgroundColor: '#1e293b', borderRadius: '16px' }}>
                
                {/* LA MAGIA DE LAS IMÁGENES: 
                  Si producto.imagen_url existe, usa esa. Si está vacío, usa picsum.photos. 
                  Si el link que pegó el admin está roto (onError), pone un cuadro gris.
                */}
                <img 
                  src={producto.imagen_url ? producto.imagen_url : `https://picsum.photos/seed/${producto.id + 50}/400/300`} 
                  alt={producto.nombre} 
                  className="card-img-top" 
                  style={{ height: '220px', objectFit: 'cover' }} 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/334155/94a3b8?text=Imagen+No+Disponible' }}
                />

                {/* Etiqueta de Proveedor Flotante */}
                {producto.proveedor && (
                  <span className="position-absolute top-0 end-0 bg-dark text-white-50 small px-3 py-1 m-2 rounded-pill shadow" style={{ opacity: 0.85 }}>
                    {producto.proveedor}
                  </span>
                )}
                
                <div className="card-body d-flex flex-column p-4">
                  <h5 className="text-white fw-bold mb-2 lh-sm">{producto.nombre}</h5>
                  <p className="text-white-50 small mb-4 flex-grow-1">
                    {producto.descripcion ? producto.descripcion.substring(0, 80) + '...' : 'Componente estándar de alta precisión para proyectos de ingeniería.'}
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <span className="d-block text-white-50 small lh-1 mb-1">Precio Unitario</span>
                      <span className="fs-3 fw-bold text-white lh-1 d-block">S/ {parseFloat(producto.precio).toFixed(2)}</span>
                    </div>
                    <div className="text-end">
                       <span className={`badge ${producto.stock > 5 ? 'bg-success' : producto.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'} rounded-pill px-3 py-2 shadow-sm`}>
                         {producto.stock > 0 ? `${producto.stock} en Stock` : 'Agotado'}
                       </span>
                    </div>
                  </div>

                  <button 
                    className={`btn w-100 py-3 rounded-pill fw-bold d-flex justify-content-center align-items-center shadow-lg transition ${producto.stock > 0 ? 'btn-info text-dark hover-scale' : 'btn-secondary disabled'}`}
                    onClick={() => {
                        if(producto.stock > 0) addToCart(producto);
                    }}
                  >
                    <ShoppingCart size={20} className="me-2" /> 
                    {producto.stock > 0 ? 'Añadir al Carrito' : 'Sin Inventario'}
                  </button>
                </div>

              </div>
            </div>
          ))}

          {productos.length === 0 && !loading && (
            <div className="col-12 text-center py-5">
              <Info size={48} className="text-white-50 mb-3 opacity-50" />
              <h4 className="text-white-50">El catálogo está vacío.</h4>
              <p className="text-muted">El administrador aún no ha registrado productos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
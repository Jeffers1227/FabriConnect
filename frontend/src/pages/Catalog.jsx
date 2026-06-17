import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Tag } from 'lucide-react';
import CadUpload from './CadUpload';

export default function Catalog({ addToCart, token }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const cargarProductos = async (filtro = '') => {
    try {
      const res = await fetch(`http://localhost:3000/api/productos?buscar=${filtro}`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProductos([]);
    }
  };

  useEffect(() => { cargarProductos(); }, []);

  return (
    <div id="catalogo" className="container py-5">
      
      {/* SECCIÓN 1: Solicitud de Fabricación Integrada */}
      <div className="mb-5 pb-5 border-bottom border-secondary border-opacity-50">
        <div className="d-flex align-items-center mb-4">
           <h2 className="fw-bold text-white mb-0">Fabricación a Medida</h2>
        </div>
        {/* Aquí llamamos al componente de CAD directamente dentro del Workspace del cliente */}
        <CadUpload token={token} />
      </div>

      {/* SECCIÓN 2: Catálogo E-Commerce */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
        <div>
          <h2 className="text-white fw-bold mb-2">Componentes en Stock</h2>
          <p className="text-white-50">Encuentra sensores, microcontroladores y partes mecánicas listas para envío.</p>
        </div>
        
        {/* Buscador Moderno */}
        <div className="position-relative mt-3 mt-md-0" style={{ width: '100%', maxWidth: '400px' }}>
          <Search className="position-absolute text-white-50" style={{ top: '12px', left: '16px' }} size={20} />
          <input 
            className="form-control dark-input text-white w-100 shadow-sm" 
            style={{ paddingLeft: '45px', borderRadius: '50px' }}
            placeholder="Buscar por placa, motor, material..."
            value={busqueda}
            onChange={(e) => {setBusqueda(e.target.value); cargarProductos(e.target.value)}}
          />
        </div>
      </div>

      <div className="row g-4">
        {productos.length > 0 ? productos.map((prod) => (
          <div className="col-lg-3 col-md-4 col-sm-6 animate__animated animate__fadeInUp" key={prod.id}>
            <div className="card h-100 p-0 border-0 shadow-lg glass-card overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
              
              {/* Imagen Profesional Estable */}
              <div className="position-relative">
                <img 
                  src={`https://picsum.photos/seed/${prod.id + 10}/400/300`} 
                  alt={prod.nombre}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <span className="position-absolute top-0 end-0 m-3 badge bg-dark text-white border border-secondary shadow-sm">
                  Stock: {prod.stock}
                </span>
              </div>

              <div className="card-body p-4 d-flex flex-column">
                <div className="mb-3 d-flex align-items-center text-info small fw-bold tracking-widest text-uppercase">
                  <Tag size={12} className="me-1"/> {prod.proveedor}
                </div>
                
                <h5 className="fw-bold text-white mb-2 lh-sm">{prod.nombre}</h5>
                <p className="text-white-50 small mb-4 flex-grow-1">{prod.descripcion.substring(0, 80)}...</p>
                
                <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top border-secondary border-opacity-25">
                  <div className="d-flex flex-column">
                    <span className="text-white-50 small">Precio</span>
                    <h4 className="fw-bold text-white mb-0">S/ {parseFloat(prod.precio).toFixed(2)}</h4>
                  </div>
                  <button className="btn btn-premium rounded-circle shadow-lg" style={{ width: '45px', height: '45px' }} onClick={() => addToCart(prod)}>
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-12 text-center py-5">
            <h4 className="text-white-50 fst-italic">No se encontraron componentes.</h4>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';

export default function Catalog() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const cargarProductos = async (filtro = '') => {
    try {
      const res = await fetch(`http://localhost:3000/api/productos?buscar=${filtro}`);
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error al cargar el catálogo", err);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarProductos(busqueda);
  };

  return (
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-8 mx-auto">
          <form class="d-flex shadow-sm" onSubmit={handleBuscar}>
            <input 
              class="form-control form-control-lg me-2" 
              type="search" 
              placeholder="Buscar componentes técnicos (ej. Microcontrolador, sensor)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <button class="btn btn-primary btn-lg" type="submit">Buscar</button>
          </form>
        </div>
      </div>

      <h3 class="mb-4 text-secondary">Componentes Disponibles</h3>
      <div class="row">
        {productos.map((prod) => (
          <div class="col-md-4 mb-4" key={prod.id}>
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <span class="badge bg-secondary mb-2">{prod.proveedor}</span>
                <h5 class="card-title fw-bold text-dark">{prod.nombre}</h5>
                <p class="card-text text-muted small">{prod.descripcion}</p>
                
                {prod.especificaciones && (
                  <div class="bg-light p-2 rounded mb-3 small">
                    <strong>Especificaciones:</strong>
                    <ul class="mb-0 ps-3">
                      {Object.entries(prod.especificaciones).map(([key, val]) => (
                        <li key={key}><strong>{key}:</strong> {Array.isArray(val) ? val.join(', ') : val}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <span class="text-primary fs-5 fw-bold">S/ {parseFloat(prod.precio).toFixed(2)}</span>
                  <span class="badge bg-success-subtle text-success">Stock: {prod.stock} u</span>
                </div>
              </div>
              <div class="card-footer bg-transparent border-top-0 p-3">
                <button class="btn btn-outline-primary w-100 btn-sm">
                  <i class="bi bi-cart-plus me-1"></i> Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
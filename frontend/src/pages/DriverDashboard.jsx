import React, { useState, useEffect } from 'react';
import { Map, PackageCheck, Wallet, User, MapPin, Navigation, CheckCircle, Clock } from 'lucide-react';

export default function DriverDashboard({ setVista, logout }) {
  const [activeTab, setActiveTab] = useState('rutas');
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar pedidos desde la BD
  useEffect(() => {
    fetch('http://localhost:3000/api/pedidos')
      .then(res => res.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al cargar pedidos:", err));
  }, []);

  // Función para completar la entrega en la BD
  const completarEntrega = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Entregado' })
      });
      
      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: 'Entregado' } : p));
        alert("✅ Entrega registrada exitosamente. Notificando al administrador...");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado de pedidos según estado
  const pedidosActivos = pedidos.filter(p => p.estado === 'En Ruta');
  const pedidosCompletados = pedidos.filter(p => p.estado === 'Entregado');
  
  // Cálculo de ganancias (Ejemplo: 15% del total del pedido va para el motorizado)
  const gananciasTotales = pedidosCompletados.reduce((sum, p) => sum + (parseFloat(p.total) * 0.15), 0);

  return (
    <div className="driver-layout animate__animated animate__fadeIn">
      
      {/* HEADER MÓVIL */}
      <div className="bg-dark p-4 rounded-bottom-4 shadow-sm border-bottom border-secondary position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="text-white fw-bold mb-0">App Repartidor</h5>
            <span className="badge bg-success text-dark bg-opacity-75"><span className="spinner-grow spinner-grow-sm me-1" style={{width: '10px', height:'10px'}}></span> En línea</span>
          </div>
          <button className="btn btn-sm btn-outline-danger rounded-circle p-2" onClick={logout}>
            <User size={18} />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-4">
        
        {/* PESTAÑA 1: RUTAS ACTIVAS */}
        {activeTab === 'rutas' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Rutas Asignadas ({pedidosActivos.length})</h4>
            
            <div className="d-flex flex-column gap-3">
              {pedidosActivos.length > 0 ? pedidosActivos.map(pedido => (
                <div key={pedido.id} className="card route-card p-3 shadow-lg">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-info fw-bold small">ORD-{pedido.id}</span>
                    <span className="badge bg-warning text-dark">Pendiente de Entrega</span>
                  </div>
                  
                  <h5 className="text-white fw-bold mb-1">{pedido.cliente_nombre}</h5>
                  <p className="text-white-50 small mb-3 d-flex align-items-center">
                    <MapPin size={14} className="me-1 text-danger" /> {pedido.direccion}
                  </p>
                  
                  <div className="bg-dark p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center border border-secondary">
                    <span className="text-white-50 small">Ganancia est.</span>
                    <span className="text-success fw-bold">S/ {(parseFloat(pedido.total) * 0.15).toFixed(2)}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-info flex-grow-1 d-flex justify-content-center align-items-center fw-bold">
                      <Navigation size={18} className="me-2" /> GPS
                    </button>
                    <button 
                      className="btn btn-info text-dark flex-grow-1 d-flex justify-content-center align-items-center fw-bold shadow-lg"
                      onClick={() => completarEntrega(pedido.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle size={18} className="me-2" /> Entregado
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5">
                  <Map size={48} className="text-white-50 mb-3 opacity-50" />
                  <h5 className="text-white-50">No tienes rutas asignadas</h5>
                  <p className="text-muted small">El administrador te notificará cuando haya nuevos envíos.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: HISTORIAL */}
        {activeTab === 'historial' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Entregas Completadas</h4>
            <div className="d-flex flex-column gap-2">
              {pedidosCompletados.map(pedido => (
                <div key={pedido.id} className="bg-dark p-3 rounded-4 border border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-1">{pedido.cliente_nombre}</h6>
                    <span className="text-success small d-flex align-items-center"><CheckCircle size={12} className="me-1"/> Entregado</span>
                  </div>
                  <span className="text-white fw-bold">+ S/ {(parseFloat(pedido.total) * 0.15).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: BILLETERA / GANANCIAS */}
        {activeTab === 'ganancias' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Mis Ganancias</h4>
            <div className="card glass-card p-4 text-center border-0 shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
              <Wallet size={40} className="text-success mx-auto mb-3" />
              <p className="text-white-50 text-uppercase tracking-widest small mb-1">Balance Acumulado</p>
              <h1 className="display-4 fw-bold text-white mb-0">S/ {gananciasTotales.toFixed(2)}</h1>
            </div>
            
            <h6 className="text-white-50 mb-3">Resumen de la semana</h6>
            <div className="bg-dark p-3 rounded-4 border border-secondary d-flex justify-content-between mb-2">
              <span className="text-white">Viajes completados</span>
              <span className="text-info fw-bold">{pedidosCompletados.length}</span>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="bottom-nav shadow-lg">
        <button className={`nav-item ${activeTab === 'rutas' ? 'active' : ''}`} onClick={() => setActiveTab('rutas')}>
          <Map size={24} className="mb-1" /> Rutas
        </button>
        <button className={`nav-item ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
          <PackageCheck size={24} className="mb-1" /> Historial
        </button>
        <button className={`nav-item ${activeTab === 'ganancias' ? 'active' : ''}`} onClick={() => setActiveTab('ganancias')}>
          <Wallet size={24} className="mb-1" /> Billetera
        </button>
      </nav>
    </div>
  );
}
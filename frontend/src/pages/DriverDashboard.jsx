import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, PackageCheck, Wallet, User, MapPin, Navigation, CheckCircle, ExternalLink, X } from 'lucide-react';

// ==========================================
// FIX INFALIBLE PARA LOS ICONOS DE LEAFLET
// ==========================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DriverDashboard({ setVista, logout, usuario }) {
  const [activeTab, setActiveTab] = useState('rutas');
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // ESTADO: Guardamos el ID real del motorizado
  const [myId, setMyId] = useState(usuario?.id || null);

  // ESTADOS PARA EL MODAL DEL MAPA GPS
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapData, setMapData] = useState({ lat: null, lng: null, direccionTexto: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');

    // 1. AUTO-DESCUBRIMIENTO DE ID (Por si el Login no mandó el ID numérico)
    if (!myId && usuario?.email) {
        fetch('https://fabriconnect-backend.onrender.com/api/usuarios/motorizados', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) {
                // Comparamos los correos ignorando mayúsculas/minúsculas
                const yo = data.find(m => m.email.toLowerCase() === usuario.email.toLowerCase());
                if (yo) setMyId(yo.id);
            }
        })
        .catch(err => console.error("Error buscando ID:", err));
    }

    // 2. SINCRONIZACIÓN DE PEDIDOS (Polling)
    const cargarPedidosMotorizado = () => {
      fetch('https://fabriconnect-backend.onrender.com/api/pedidos')
        .then(res => res.json())
        .then(data => setPedidos(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error sincronizando pedidos:", err));
    };

    cargarPedidosMotorizado();
    const intervalo = setInterval(() => { cargarPedidosMotorizado(); }, 5000);
    
    return () => clearInterval(intervalo);
  }, [myId, usuario]);

  const completarEntrega = async (id) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://fabriconnect-backend.onrender.com/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Entregado' }) 
      });
      
      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: 'Entregado' } : p));
        alert("✅ Entrega registrada exitosamente. Notificando al administrador...");
      }
    } catch (error) { console.error("Error:", error); } 
    finally { setIsLoading(false); }
  };

  // ==========================================
  // FUNCIÓN MAGICA: EXTRACCIÓN DE COORDENADAS
  // ==========================================
  const abrirMapaGPS = (direccionString) => {
    // Usamos Expresiones Regulares (Regex) para buscar los números dentro de los corchetes [GPS: lat, lng]
    const regex = /\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/;
    const match = direccionString.match(regex);

    if (match) {
        // Encontramos coordenadas exactas
        setMapData({
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2]),
            direccionTexto: direccionString.replace(regex, '').trim() // Extraemos solo el texto de la calle
        });
        setIsMapOpen(true);
    } else {
        alert("❌ El cliente no ingresó coordenadas GPS precisas para este pedido. Comunícate con él para confirmar la dirección.");
    }
  };

  // FILTRADO ESTRICTO
  const misPedidos = pedidos.filter(p => p.motorizado_id && myId && Number(p.motorizado_id) === Number(myId));
  const pedidosActivos = misPedidos.filter(p => p.estado === 'En Ruta');
  const pedidosCompletados = misPedidos.filter(p => p.estado === 'Entregado');
  const gananciasTotales = pedidosCompletados.reduce((sum, p) => sum + (parseFloat(p.total) * 0.15), 0);

  return (
    <div className="driver-layout animate__animated animate__fadeIn position-relative">

      {/* HEADER MÓVIL */}
      <div className="bg-dark p-4 rounded-bottom-4 shadow-sm border-bottom border-secondary position-sticky top-0" style={{ zIndex: 100 }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="text-white fw-bold mb-0">App Repartidor</h5>
            <span className="badge bg-success text-dark bg-opacity-75">
              <span className="spinner-grow spinner-grow-sm me-1" style={{width: '10px', height:'10px'}}></span> 
              Hola, {usuario?.nombre || 'Motorizado'}
            </span>
          </div>
          <button className="btn btn-sm btn-outline-danger rounded-circle p-2" onClick={logout}>
            <User size={18} />
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-4" style={{ paddingBottom: '90px' }}>
        
        {/* PESTAÑA 1: RUTAS ACTIVAS */}
        {activeTab === 'rutas' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Rutas Asignadas ({pedidosActivos.length})</h4>
            
            <div className="d-flex flex-column gap-3">
              {pedidosActivos.length > 0 ? pedidosActivos.map(pedido => (
                <div key={pedido.id} className="card route-card p-3 shadow-lg" style={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '15px' }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="text-info fw-bold small">ORD-{pedido.id}</span>
                    <span className="badge bg-warning text-dark">En Camino</span>
                  </div>
                  
                  <h5 className="text-white fw-bold mb-1">{pedido.cliente_nombre}</h5>
                  <p className="text-white-50 small mb-3 d-flex align-items-center">
                    {/* Quitamos los corchetes GPS visualmente para el conductor */}
                    <MapPin size={14} className="me-1 text-danger flex-shrink-0" /> {pedido.direccion.replace(/\[GPS:.*\]/, '')}
                  </p>
                  
                  <div className="bg-dark p-2 rounded-3 mb-3 d-flex justify-content-between align-items-center border border-secondary">
                    <span className="text-white-50 small">Ganancia est.</span>
                    <span className="text-success fw-bold">S/ {(parseFloat(pedido.total) * 0.15).toFixed(2)}</span>
                  </div>

                  <div className="d-flex gap-2">
                    {/* BOTÓN MÁGICO DE NAVEGACIÓN */}
                    <button 
                        className="btn btn-outline-info flex-grow-1 d-flex justify-content-center align-items-center fw-bold"
                        onClick={() => abrirMapaGPS(pedido.direccion)}
                    >
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

        {/* PESTAÑA 2: HISTORIAL INDIVIDUAL */}
        {activeTab === 'historial' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Mis Entregas</h4>
            <div className="d-flex flex-column gap-2">
              {pedidosCompletados.length > 0 ? pedidosCompletados.map(pedido => (
                <div key={pedido.id} className="bg-dark p-3 rounded-4 border border-secondary d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-white mb-1">{pedido.cliente_nombre}</h6>
                    <span className="text-success small d-flex align-items-center"><CheckCircle size={12} className="me-1"/> Entregado</span>
                  </div>
                  <span className="text-white fw-bold">+ S/ {(parseFloat(pedido.total) * 0.15).toFixed(2)}</span>
                </div>
              )) : (
                <p className="text-white-50 text-center py-3">Aún no has completado ninguna entrega.</p>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: BILLETERA INDIVIDUAL */}
        {activeTab === 'ganancias' && (
          <div className="animate__animated animate__fadeInRight">
            <h4 className="text-white fw-bold mb-4">Mis Ganancias</h4>
            <div className="card glass-card p-4 text-center border-0 shadow-lg mb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '20px' }}>
              <Wallet size={40} className="text-success mx-auto mb-3" />
              <p className="text-white-50 text-uppercase tracking-widest small mb-1">Balance Acumulado</p>
              <h1 className="display-4 fw-bold text-white mb-0">S/ {gananciasTotales.toFixed(2)}</h1>
            </div>
          </div>
        )}

      </div>

      {/* =======================================================
          MODAL DE MAPA INTERACTIVO Y GOOGLE MAPS DEEP LINKING
          ======================================================= */}
      {isMapOpen && mapData.lat && mapData.lng && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__zoomIn" style={{ zIndex: 3000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)' }}>
          <div className="card glass-card border-0 shadow-lg p-3 m-3" style={{ width: '100%', maxWidth: '450px', backgroundColor: '#1e293b', borderRadius: '20px' }}>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="text-white fw-bold mb-0 d-flex align-items-center"><Navigation size={20} className="me-2 text-info"/> Punto de Entrega</h5>
              <button className="btn btn-link text-white-50 p-0" onClick={() => setIsMapOpen(false)}><X size={24}/></button>
            </div>

            <p className="text-white-50 small mb-3"><MapPin size={14} className="me-1 text-danger"/> {mapData.direccionTexto}</p>

            {/* CONTENEDOR DEL MAPA LEAFLET */}
            <div className="rounded-4 overflow-hidden shadow-sm mb-4" style={{ height: '300px', border: '2px solid #334155' }}>
              <MapContainer center={[mapData.lat, mapData.lng]} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[mapData.lat, mapData.lng]}>
                  <Popup>Destino del Cliente</Popup>
                </Marker>
              </MapContainer>
            </div>

            {/* BOTÓN MÁGICO PARA ABRIR LA APP DE GOOGLE MAPS EN EL CELULAR */}
            <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${mapData.lat},${mapData.lng}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn btn-info text-dark w-100 py-3 rounded-pill fw-bold shadow-lg d-flex justify-content-center align-items-center transition"
            >
              <ExternalLink size={20} className="me-2" />
              Navegar en Google Maps
            </a>

          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="bottom-nav shadow-lg" style={{ zIndex: 1000 }}>
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
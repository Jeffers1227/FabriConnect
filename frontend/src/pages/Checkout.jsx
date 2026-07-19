import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import { MapPin, CreditCard, Smartphone, User, Mail, Phone, ShoppingCart, Truck, CreditCard as CardIcon, CheckCircle, Search } from 'lucide-react';

// ==========================================
// FIX INFALIBLE PARA LOS ICONOS DE LEAFLET
// ==========================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==========================================
// COMPONENTE MÁGICO PARA MOVER EL MAPA
// ==========================================
function CambiarVistaMapa({ center }) {
  const map = useMap();
  useEffect(() => {
    // Hace una animación de "vuelo" suave hacia las nuevas coordenadas
    map.flyTo(center, 15, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Checkout({ cartItems, setVista }) {
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Estado para el botón de búsqueda
  
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    correo: '',
    telefono: '',
    direccionExtra: '' 
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Ubicación por defecto (Lima)
  const TALLER_UBICACION = { lat: -12.0464, lng: -77.0428 };
  const [clientPosition, setClientPosition] = useState(TALLER_UBICACION);
  const [deliveryCost, setDeliveryCost] = useState(10);
  const markerRef = useRef(null);

  // Fórmula matemática para calcular distancia
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Evento cuando el cliente arrastra el marcador manualmente
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setClientPosition(newPos);
        actualizarCostoEnvio(newPos.lat, newPos.lng);
      }
    },
  }), []);

  const actualizarCostoEnvio = (lat, lng) => {
    const distanciaKm = calcularDistancia(TALLER_UBICACION.lat, TALLER_UBICACION.lng, lat, lng);
    if (distanciaKm < 5) setDeliveryCost(10); 
    else if (distanciaKm < 15) setDeliveryCost(18); 
    else setDeliveryCost(30); 
  };

  // ==========================================
  // FUNCIÓN PARA BUSCAR LA DIRECCIÓN ESCRITA
  // ==========================================
  const buscarDireccionEnMapa = async () => {
    if (!formData.direccionExtra) return alert("Por favor escribe una calle o avenida primero.");
    setIsSearching(true);
    
    try {
      // Le agregamos ", Lima, Peru" a la búsqueda para que no te mande a otro país
      const query = encodeURIComponent(`${formData.direccionExtra}, Lima, Perú`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const nuevaLat = parseFloat(data[0].lat);
        const nuevaLng = parseFloat(data[0].lon);
        const nuevaPosicion = { lat: nuevaLat, lng: nuevaLng };
        
        // Actualizamos el marcador (lo que moverá el mapa automáticamente)
        setClientPosition(nuevaPosicion);
        actualizarCostoEnvio(nuevaLat, nuevaLng);
      } else {
        alert("No pudimos encontrar esa dirección exacta. Intenta colocar el distrito, o mueve el marcador azul manualmente.");
      }
    } catch (error) {
      console.error("Error buscando en el mapa:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const subtotal = cartItems ? cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0) : 0;
  const total = subtotal + deliveryCost;

  const procesarCompra = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return alert("Por favor, ingresa tu Nombre y Apellido.");
    if (cartItems.length === 0) return alert("Tu carrito está vacío.");

    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: formData.nombre,
          total: total,
          metodo_pago: paymentMethod,
          direccion: `${formData.direccionExtra} [GPS: ${clientPosition.lat.toFixed(4)}, ${clientPosition.lng.toFixed(4)}]`
        })
      });

      if (response.ok) {
        alert("🎉 ¡Pedido confirmado con éxito! El motorizado ya tiene tus coordenadas.");
        setVista('catalogo');
        window.location.reload(); 
      } else {
        alert("Hubo un error al guardar el pedido en la base de datos.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-5 mt-5 animate__animated animate__fadeIn">
      <button className="btn btn-link text-info text-decoration-none mb-4 p-0 fw-bold" onClick={() => setVista('catalogo')}>
        ← Volver al Catálogo
      </button>
      
      <h2 className="fw-bold text-white mb-5 display-5">Finalizar Compra</h2>

      <div className="row g-5">
        {/* COLUMNA IZQUIERDA */}
        <div className="col-lg-7">
          
          {/* 1. Datos Personales */}
          <div className="card glass-card p-4 mb-5 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center border-bottom border-secondary pb-3">
              <User className="me-3 text-info" size={28} /> 1. Datos Personales
            </h5>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label text-white-50">Nombre y Apellido *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-control dark-input text-white" placeholder="Ej: Jefferson Silva" required />
              </div>
              <div className="col-md-6">
                <label className="form-label text-white-50">DNI / Carnet</label>
                <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="form-control dark-input text-white" placeholder="Ej: 71234567" />
              </div>
              <div className="col-md-6">
                <label className="form-label text-white-50">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text dark-input border-end-0"><Mail size={18}/></span>
                  <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} className="form-control dark-input border-start-0 text-white" placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-white-50">Teléfono Móvil</label>
                <div className="input-group">
                  <span className="input-group-text dark-input border-end-0"><Phone size={18}/></span>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="form-control dark-input border-start-0 text-white" placeholder="987 654 321" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Mapa Interactivo INTELIGENTE */}
          <div className="card glass-card p-4 mb-5 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center border-bottom border-secondary pb-3">
              <MapPin className="me-3 text-info" size={28} /> 2. Ubicación de Entrega
            </h5>
            
            <div className="mb-4 mt-2">
              <label className="form-label text-white-50 fw-bold">Calle, Avenida o Referencia *</label>
              
              {/* BARRA DE BÚSQUEDA DEL MAPA */}
              <div className="input-group shadow-sm border border-secondary rounded-3 overflow-hidden">
                <span className="input-group-text dark-input border-0"><MapPin size={18}/></span>
                <input 
                  type="text" 
                  name="direccionExtra" 
                  value={formData.direccionExtra} 
                  onChange={handleInputChange} 
                  className="form-control dark-input border-0 text-white" 
                  placeholder="Ej. Real Plaza Puruchuco, Ate" 
                  required
                />
                <button 
                  className="btn btn-info text-dark fw-bold px-4 transition" 
                  type="button"
                  onClick={buscarDireccionEnMapa}
                  disabled={isSearching}
                >
                  {isSearching ? <span className="spinner-border spinner-border-sm"></span> : <><Search size={16} className="me-1"/> Buscar</>}
                </button>
              </div>
              <p className="text-warning small mt-2"><strong>📍 Tip:</strong> Escribe tu dirección, dale a "Buscar" para acercar el mapa, y ajusta el pin azul manualmente si es necesario.</p>
            </div>
            
            <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ height: '350px', border: '2px solid #334155' }}>
              <MapContainer center={clientPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                
                {/* Llama al componente mágico para mover la cámara */}
                <CambiarVistaMapa center={clientPosition} />
                
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker draggable={true} eventHandlers={eventHandlers} position={clientPosition} ref={markerRef}>
                  <Popup>¡Este es tu punto de entrega!</Popup>
                </Marker>
              </MapContainer>
              
              <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-dark text-white shadow-lg rounded-4 border border-info" style={{zIndex: 1000}}>
                <span className="d-block text-white-50 small mb-1">Costo de Envío:</span>
                <h3 className="text-info mb-0 fw-bold d-flex align-items-center">
                  <Truck className="me-2" size={24} /> S/ {deliveryCost.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>

          {/* 3. Pagos */}
          <div className="card glass-card p-4 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center border-bottom border-secondary pb-3">
              <CreditCard className="me-3 text-info" size={28} /> 3. Método de Pago
            </h5>
            
            <div className="d-flex gap-3 mb-4">
              <button 
                type="button"
                className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'tarjeta' ? 'btn-primary shadow-lg' : 'btn-outline-secondary text-white'}`}
                onClick={() => setPaymentMethod('tarjeta')}
              >
                <CardIcon className="mb-2" size={28} /><br/>Tarjeta de Crédito
              </button>
              <button 
                type="button"
                className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'yape' ? 'btn-info text-dark shadow-lg' : 'btn-outline-secondary text-white'}`}
                onClick={() => setPaymentMethod('yape')}
              >
                <Smartphone className="mb-2" size={28} /><br/>Yape / Plin
              </button>
            </div>

            {paymentMethod === 'tarjeta' ? (
              <div className="row g-4 animate__animated animate__fadeIn">
                <div className="col-12">
                  <label className="form-label text-white-50">Número de Tarjeta</label>
                  <input type="text" className="form-control dark-input text-white" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="col-6">
                  <label className="form-label text-white-50">Expiración</label>
                  <input type="text" className="form-control dark-input text-white" placeholder="MM/YY" />
                </div>
                <div className="col-6">
                  <label className="form-label text-white-50">CVC</label>
                  <input type="password" className="form-control dark-input text-white" placeholder="123" />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 animate__animated animate__fadeIn glass-card rounded-4 border-info">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Yape" width="160" className="bg-white p-2 rounded-4 mb-3 shadow" />
                <h4 className="text-info fw-bold">Escanea para pagar</h4>
                <p className="text-white-50 mb-0 fs-5">Monto exacto: <strong className="text-white">S/ {total.toFixed(2)}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen de Pedido */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 sticky-top border-0 shadow-lg" style={{top: '120px', backgroundColor: '#0f172a'}}>
            <h4 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex align-items-center">
              <ShoppingCart className="me-3 text-info" /> Resumen del Pedido
            </h4>
            
            <div className="d-flex flex-column gap-2 mb-4 overflow-auto" style={{maxHeight: '350px', paddingRight: '10px'}}>
              {cartItems && cartItems.length > 0 ? cartItems.map((item, index) => (
                <div key={index} className="d-flex align-items-center p-3 rounded-4 border border-secondary" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
                  <img 
                    src={item.imagen_url || `https://picsum.photos/seed/${item.id + 10}/100/100`} 
                    alt="Producto" 
                    className="rounded-3 me-3 shadow-sm" 
                    style={{width: '65px', height: '65px', objectFit: 'cover'}}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-white fw-bold lh-sm">{item.nombre}</h6>
                    <span className="badge bg-secondary text-white mb-2">{item.proveedor}</span>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <small className="text-info fw-bold">1 und.</small>
                      <span className="text-white fw-bold fs-6">S/ {parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5 text-white-50">
                  <ShoppingCart size={48} className="mb-3 opacity-50" />
                  <p className="fst-italic">Aún no has añadido componentes.</p>
                </div>
              )}
            </div>

            <div className="bg-dark p-4 rounded-4 border border-secondary">
              <div className="d-flex justify-content-between mb-3 text-white-50 fs-6">
                <span>Subtotal componentes:</span>
                <span className="text-white">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-4 text-info fs-6">
                <span>Logística y Envío:</span>
                <span className="fw-bold">S/ {deliveryCost.toFixed(2)}</span>
              </div>
              
              <hr className="border-secondary" />
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-white-50 text-uppercase tracking-widest small fw-bold">Total a pagar</span>
                <span className="fs-1 fw-bold text-white">S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* BOTÓN CONFIRMAR */}
            <button 
              className="btn btn-primary w-100 py-3 mt-4 rounded-pill fw-bold fs-5 shadow-lg d-flex justify-content-center align-items-center transition"
              onClick={procesarCompra}
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando en Servidor...' : <><CheckCircle className="me-2" /> Confirmar e Ingresar Pedido</>}
            </button>
            <p className="text-center text-white-50 small mt-4 mb-0 d-flex justify-content-center align-items-center">
              <span className="bg-success rounded-circle me-2" style={{width: '8px', height: '8px'}}></span>
              Transacción segura cifrada en 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
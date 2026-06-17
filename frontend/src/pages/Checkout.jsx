import React, { useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, CreditCard, Smartphone, User, Mail, Phone, ShoppingCart, Truck, CreditCard as CardIcon, CheckCircle } from 'lucide-react';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Checkout({ cartItems, setVista }) {
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NUEVO: Estado para capturar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    correo: '',
    telefono: '',
    direccionExtra: 'Dirección seleccionada en el mapa'
  });

  // NUEVO: Función para actualizar el estado cuando el usuario escribe
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const TALLER_UBICACION = { lat: -12.0464, lng: -77.0428 };
  const [clientPosition, setClientPosition] = useState(TALLER_UBICACION);
  const [deliveryCost, setDeliveryCost] = useState(10);
  const markerRef = useRef(null);

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

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setClientPosition(newPos);
        
        const distanciaKm = calcularDistancia(TALLER_UBICACION.lat, TALLER_UBICACION.lng, newPos.lat, newPos.lng);
        if (distanciaKm < 5) setDeliveryCost(10); 
        else if (distanciaKm < 15) setDeliveryCost(18); 
        else setDeliveryCost(30); 
      }
    },
  }), []);

  const subtotal = cartItems ? cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0) : 0;
  const total = subtotal + deliveryCost;

  // NUEVO: Función maestra que envía los datos a PostgreSQL
  const procesarCompra = async () => {
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
          direccion: `${formData.direccionExtra} [Coordenadas GPS: ${clientPosition.lat.toFixed(4)}, ${clientPosition.lng.toFixed(4)}]`
        })
      });

      if (response.ok) {
        alert("🎉 ¡Pedido creado con éxito! Ya puedes verlo en el Dashboard del Administrador.");
        // Opcional: limpiar el carrito y volver al inicio
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
                {/* Inputs ahora están conectados al estado (value y onChange) */}
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-control dark-input text-white" placeholder="Ej: Jefferson Silva" />
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

          {/* 2. Mapa */}
          <div className="card glass-card p-4 mb-5 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center border-bottom border-secondary pb-3">
              <MapPin className="me-3 text-info" size={28} /> 2. Ubicación de Entrega
            </h5>
            <p className="text-white-50 mb-4">Mueve el marcador azul a tu ubicación exacta para calcular el costo de envío.</p>
            
            <div className="position-relative rounded-4 overflow-hidden shadow">
              <MapContainer center={clientPosition} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker draggable={true} eventHandlers={eventHandlers} position={clientPosition} ref={markerRef}>
                  <Popup>Ubicación de entrega</Popup>
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
                className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'tarjeta' ? 'btn-primary shadow-lg' : 'btn-outline-secondary text-white'}`}
                onClick={() => setPaymentMethod('tarjeta')}
              >
                <CardIcon className="mb-2" size={28} /><br/>Tarjeta de Crédito
              </button>
              <button 
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

        {/* COLUMNA DERECHA: Resumen de Pedido Rediseñado (Visualmente Premium) */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 sticky-top border-0 shadow-lg" style={{top: '120px', backgroundColor: '#0f172a'}}>
            <h4 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex align-items-center">
              <ShoppingCart className="me-3 text-info" /> Resumen del Pedido
            </h4>
            
            {/* Tarjetas de productos con imágenes */}
            <div className="d-flex flex-column gap-2 mb-4 overflow-auto" style={{maxHeight: '350px', paddingRight: '10px'}}>
              {cartItems && cartItems.length > 0 ? cartItems.map((item, index) => (
                <div key={index} className="d-flex align-items-center p-3 rounded-4 border border-secondary" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
                  <img 
                    src={`https://picsum.photos/seed/${item.id + 10}/100/100`} 
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

            {/* BOTÓN CORREGIDO: Ahora sí llama a la función de Base de Datos */}
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
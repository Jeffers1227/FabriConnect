import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import { MapPin, CreditCard, Smartphone, User, Mail, Phone, ShoppingCart, Truck, CreditCard as CardIcon, CheckCircle, Search, UploadCloud, Copy } from 'lucide-react';

// FIX PARA ICONOS DE LEAFLET
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function CambiarVistaMapa({ center }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, 15, { animate: true, duration: 1.5 }); }, [center, map]);
  return null;
}

export default function Checkout({ cartItems, setVista }) {
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  
  const [formData, setFormData] = useState({
    nombre: '', dni: '', correo: '', telefono: '', direccionExtra: '', numeroOperacion: ''
  });

  // ==========================================
  // ESTADOS PARA EL ARCHIVO (CLOUDFLARE R2)
  // ==========================================
  const [comprobanteFile, setComprobanteFile] = useState(null); // Archivo físico real
  const [comprobantePreview, setComprobantePreview] = useState(''); // URL local para vista previa

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // AL SELECCIONAR LA IMAGEN
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComprobanteFile(file);
      setComprobantePreview(URL.createObjectURL(file)); // Muestra la foto sin subirla aún
    }
  };

  const copiarNumero = () => { navigator.clipboard.writeText("987654321"); alert("¡Número copiado!"); };

  const TALLER_UBICACION = { lat: -12.0464, lng: -77.0428 };
  const [clientPosition, setClientPosition] = useState(TALLER_UBICACION);
  const [deliveryCost, setDeliveryCost] = useState(10);
  const markerRef = useRef(null);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; const dLat = (lat2 - lat1) * (Math.PI / 180); const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setClientPosition(newPos);
        const distanciaKm = calcularDistancia(TALLER_UBICACION.lat, TALLER_UBICACION.lng, newPos.lat, newPos.lng);
        if (distanciaKm < 5) setDeliveryCost(10); else if (distanciaKm < 15) setDeliveryCost(18); else setDeliveryCost(30); 
      }
    },
  }), []);

  const buscarDireccionEnMapa = async () => {
    if (!formData.direccionExtra) return alert("Por favor escribe una calle o avenida primero.");
    setIsSearching(true);
    try {
      const query = encodeURIComponent(`${formData.direccionExtra}, Lima, Perú`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const nuevaPosicion = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setClientPosition(nuevaPosicion);
        const distanciaKm = calcularDistancia(TALLER_UBICACION.lat, TALLER_UBICACION.lng, nuevaPosicion.lat, nuevaPosicion.lng);
        if (distanciaKm < 5) setDeliveryCost(10); else if (distanciaKm < 15) setDeliveryCost(18); else setDeliveryCost(30);
      } else { alert("Dirección no encontrada. Mueve el marcador manualmente."); }
    } catch (error) { console.error(error); } finally { setIsSearching(false); }
  };

  const subtotal = cartItems ? cartItems.reduce((sum, item) => sum + parseFloat(item.precio), 0) : 0;
  const total = subtotal + deliveryCost;

  const procesarCompra = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return alert("Por favor, ingresa tu Nombre y Apellido.");
    if (cartItems.length === 0) return alert("Tu carrito está vacío.");
    
    // Validaciones de Yape
    if (paymentMethod === 'yape' && !formData.numeroOperacion) return alert("Ingresa el N° de Operación.");
    if (paymentMethod === 'yape' && !comprobanteFile) return alert("Sube la captura de pantalla de tu pago.");

    setIsProcessing(true);

    try {
      // ==========================================
      // EMPAQUETADO FORMDATA (PARA MANDAR EL ARCHIVO AL BACKEND)
      // ==========================================
      const formDataEnvio = new FormData();
      formDataEnvio.append('cliente_nombre', formData.nombre);
      formDataEnvio.append('total', total);
      formDataEnvio.append('metodo_pago', paymentMethod === 'yape' ? `Yape (Op: ${formData.numeroOperacion})` : paymentMethod);
      formDataEnvio.append('direccion', `${formData.direccionExtra} [GPS: ${clientPosition.lat.toFixed(4)}, ${clientPosition.lng.toFixed(4)}]`);
      
      // Adjuntamos el archivo físico!
      if (paymentMethod === 'yape' && comprobanteFile) {
        formDataEnvio.append('comprobante', comprobanteFile);
      }

      // IMPORTANTE: fetch configura los 'headers' automáticamente al detectar FormData
      const response = await fetch('https://fabriconnect-backend.onrender.com/api/pedidos', {
        method: 'POST',
        body: formDataEnvio
      });

      if (response.ok) {
        alert("🎉 ¡Pedido confirmado! El administrador validará tu captura en breve.");
        setVista('catalogo');
        window.location.reload(); 
      } else {
        alert("Hubo un error al procesar el pedido.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-5 mt-5 animate__animated animate__fadeIn">
      <button className="btn btn-link text-info text-decoration-none mb-4 p-0 fw-bold" onClick={() => setVista('catalogo')}>← Volver al Catálogo</button>
      <h2 className="fw-bold text-white mb-5 display-5">Finalizar Compra</h2>

      <div className="row g-5">
        <div className="col-lg-7">
          
          <div className="card glass-card p-4 mb-5 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center border-bottom border-secondary pb-3"><User className="me-3 text-info" size={28} /> 1. Datos Personales</h5>
            <div className="row g-4">
              <div className="col-md-6"><label className="form-label text-white-50">Nombre y Apellido *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-control dark-input text-white" placeholder="Ej: Jefferson Silva" required /></div>
              <div className="col-md-6"><label className="form-label text-white-50">DNI / Carnet</label><input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="form-control dark-input text-white" placeholder='74058820'/></div>
              <div className="col-md-6"><label className="form-label text-white-50">Correo Electrónico</label><div className="input-group"><span className="input-group-text dark-input border-end-0"><Mail size={18}/></span><input type="email" name="correo" placeholder='...@gmail.com' value={formData.correo} onChange={handleInputChange} className="form-control dark-input border-start-0 text-white" /></div></div>
              <div className="col-md-6"><label className="form-label text-white-50">Teléfono Móvil</label><div className="input-group"><span className="input-group-text dark-input border-end-0"><Phone size={18}/></span><input type="text" name="telefono" placeholder='999999999' value={formData.telefono} onChange={handleInputChange} className="form-control dark-input border-start-0 text-white" /></div></div>
            </div>
          </div>

          <div className="card glass-card p-4 mb-5 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center border-bottom border-secondary pb-3"><MapPin className="me-3 text-info" size={28} /> 2. Ubicación de Entrega</h5>
            <div className="mb-4 mt-2">
              <label className="form-label text-white-50 fw-bold">Calle, Avenida o Referencia *</label>
              <div className="input-group shadow-sm border border-secondary rounded-3 overflow-hidden">
                <span className="input-group-text dark-input border-0"><MapPin size={18}/></span>
                <input type="text" name="direccionExtra" value={formData.direccionExtra} onChange={handleInputChange} className="form-control dark-input border-0 text-white" placeholder="Ej. Real Plaza Puruchuco, Ate" required />
                <button className="btn btn-info text-dark fw-bold px-4 transition" type="button" onClick={buscarDireccionEnMapa} disabled={isSearching}>{isSearching ? <span className="spinner-border spinner-border-sm"></span> : <><Search size={16} className="me-1"/> Buscar</>}</button>
              </div>
            </div>
            <div className="position-relative rounded-4 overflow-hidden shadow-sm" style={{ height: '350px', border: '2px solid #334155' }}>
              <MapContainer center={clientPosition} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <CambiarVistaMapa center={clientPosition} />
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker draggable={true} eventHandlers={eventHandlers} position={clientPosition} ref={markerRef}><Popup>¡Este es tu punto de entrega!</Popup></Marker>
              </MapContainer>
              <div className="position-absolute bottom-0 start-0 m-3 p-3 bg-dark text-white shadow-lg rounded-4 border border-info" style={{zIndex: 1000}}>
                <span className="d-block text-white-50 small mb-1">Costo de Envío:</span>
                <h3 className="text-info mb-0 fw-bold d-flex align-items-center"><Truck className="me-2" size={24} /> S/ {deliveryCost.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="card glass-card p-4 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
            <h5 className="text-white fw-bold mb-4 d-flex align-items-center border-bottom border-secondary pb-3"><CreditCard className="me-3 text-info" size={28} /> 3. Método de Pago</h5>
            <div className="d-flex gap-3 mb-4">
              <button type="button" className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'tarjeta' ? 'btn-primary shadow-lg' : 'btn-outline-secondary text-white'}`} onClick={() => setPaymentMethod('tarjeta')}><CardIcon className="mb-2" size={28} /><br/>Tarjeta de Crédito</button>
              <button type="button" className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'yape' ? 'btn-info text-dark shadow-lg' : 'btn-outline-secondary text-white'}`} onClick={() => setPaymentMethod('yape')}><Smartphone className="mb-2" size={28} /><br/>Yape / Plin</button>
            </div>

            {paymentMethod === 'tarjeta' ? (
              <div className="row g-4 animate__animated animate__fadeIn">
                <div className="col-12"><label className="form-label text-white-50">Número de Tarjeta</label><input type="text" className="form-control dark-input text-white" placeholder="0000 0000 0000 0000" /></div>
                <div className="col-6"><label className="form-label text-white-50">Expiración</label><input type="text" className="form-control dark-input text-white" placeholder="MM/YY" /></div>
                <div className="col-6"><label className="form-label text-white-50">CVC</label><input type="password" className="form-control dark-input text-white" placeholder="123" /></div>
              </div>
            ) : (
              // ==========================================
              // INTERFAZ DE YAPE MEJORADA PARA ARCHIVOS
              // ==========================================
              <div className="animate__animated animate__fadeIn">
                <div className="bg-dark rounded-4 p-4 border border-info shadow-sm text-center mb-4">
                    <div className="d-flex justify-content-center align-items-center gap-4 mb-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Yape" width="120" className="bg-white p-2 rounded-4 shadow" />
                        <div className="text-start">
                            <h3 className="text-info fw-bold mb-0">S/ {total.toFixed(2)}</h3>
                            <span className="text-white-50 small d-block mb-2">A nombre de: FabriConnect SAC</span>
                            <div className="input-group input-group-sm" style={{maxWidth: '180px'}}>
                                <input type="text" className="form-control bg-secondary text-white border-0 fw-bold text-center" value="987 654 321" readOnly />
                                <button className="btn btn-outline-info" type="button" onClick={copiarNumero}><Copy size={14}/></button>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 text-start">
                        <div className="col-12">
                            <label className="form-label text-warning fw-bold small">1. Ingresa el N° de Operación *</label>
                            <input type="text" name="numeroOperacion" value={formData.numeroOperacion} onChange={handleInputChange} className="form-control dark-input text-white border-warning" placeholder="Ej. 08234857" required={paymentMethod==='yape'} />
                        </div>
                        <div className="col-12 mt-3">
                            <label className="form-label text-warning fw-bold small"><UploadCloud size={16} className="me-1"/> 2. Adjuntar Captura de Pantalla *</label>
                            {/* Input File Real */}
                            <input type="file" accept="image/*" className="form-control dark-input border-warning text-white" onChange={handleImageUpload} required={paymentMethod==='yape'} />
                            
                            {comprobantePreview && (
                                <div className="mt-3 text-center animate__animated animate__fadeIn">
                                    <p className="text-success small mb-1">✓ Captura lista para subir a Cloudflare R2:</p>
                                    <img src={comprobantePreview} alt="Previa" style={{height: '150px', borderRadius: '10px', border: '2px solid #0dcaf0', objectFit: 'contain'}} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen */}
        <div className="col-lg-5">
          <div className="card glass-card p-4 sticky-top border-0 shadow-lg" style={{top: '120px', backgroundColor: '#0f172a'}}>
            <h4 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex align-items-center"><ShoppingCart className="me-3 text-info" /> Resumen del Pedido</h4>
            <div className="d-flex flex-column gap-2 mb-4 overflow-auto" style={{maxHeight: '350px'}}>
              {cartItems && cartItems.length > 0 ? cartItems.map((item, index) => (
                <div key={index} className="d-flex align-items-center p-3 rounded-4 border border-secondary" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
                  <img src={item.imagen_url || `https://picsum.photos/seed/${item.id + 10}/100/100`} alt="Prod" className="rounded-3 me-3 shadow-sm" style={{width: '65px', height: '65px', objectFit: 'cover'}}/>
                  <div className="flex-grow-1">
                    <h6 className="mb-1 text-white fw-bold lh-sm">{item.nombre}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-1"><small className="text-info fw-bold">1 und.</small><span className="text-white fw-bold fs-6">S/ {parseFloat(item.precio).toFixed(2)}</span></div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-5 text-white-50"><p>Aún no has añadido componentes.</p></div>
              )}
            </div>

            <div className="bg-dark p-4 rounded-4 border border-secondary">
              <div className="d-flex justify-content-between mb-3 text-white-50 fs-6"><span>Subtotal componentes:</span><span className="text-white">S/ {subtotal.toFixed(2)}</span></div>
              <div className="d-flex justify-content-between mb-4 text-info fs-6"><span>Logística y Envío:</span><span className="fw-bold">S/ {deliveryCost.toFixed(2)}</span></div>
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between align-items-center mt-3"><span className="text-white-50 text-uppercase tracking-widest small fw-bold">Total a pagar</span><span className="fs-1 fw-bold text-white">S/ {total.toFixed(2)}</span></div>
            </div>

            <button className="btn btn-primary w-100 py-3 mt-4 rounded-pill fw-bold fs-5 shadow-lg d-flex justify-content-center align-items-center transition" onClick={procesarCompra} disabled={isProcessing}>
              {isProcessing ? 'Enviando archivos a la Nube...' : <><CheckCircle className="me-2" /> Confirmar e Ingresar Pedido</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
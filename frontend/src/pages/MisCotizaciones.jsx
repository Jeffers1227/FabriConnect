import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';
import { Search, MapPin, CreditCard, Smartphone, User, Truck, CreditCard as CardIcon, CheckCircle, UploadCloud, Copy, Box, Layers } from 'lucide-react';

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

export default function MisCotizaciones({ setVista }) {
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [cotizaciones, setCotizaciones] = useState([]);
  const [isBuscando, setIsBuscando] = useState(false);
  const [cotizacionAPagar, setCotizacionAPagar] = useState(null); // Si el usuario le da a "Pagar" a una cotización

  // ================= ESTADOS DEL CHECKOUT =================
  const [paymentMethod, setPaymentMethod] = useState('yape');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearchingMap, setIsSearchingMap] = useState(false); 
  const [formData, setFormData] = useState({ nombre: '', direccionExtra: '', numeroOperacion: '' });
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState('');

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

  const buscarCotizaciones = async (e) => {
    e.preventDefault();
    if (!dniBusqueda) return;
    setIsBuscando(true);
    try {
      const res = await fetch(`http://localhost:3000/api/cad/cliente/${dniBusqueda}`);
      const data = await res.json();
      setCotizaciones(data);
    } catch (error) { console.error(error); } finally { setIsBuscando(false); }
  };

  const buscarDireccionEnMapa = async () => {
    if (!formData.direccionExtra) return alert("Por favor escribe una calle o avenida primero.");
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${formData.direccionExtra}, Lima, Perú`)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const nuevaPosicion = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setClientPosition(nuevaPosicion);
        const distanciaKm = calcularDistancia(TALLER_UBICACION.lat, TALLER_UBICACION.lng, nuevaPosicion.lat, nuevaPosicion.lng);
        if (distanciaKm < 5) setDeliveryCost(10); else if (distanciaKm < 15) setDeliveryCost(18); else setDeliveryCost(30);
      } else { alert("Dirección no encontrada. Mueve el marcador manualmente."); }
    } catch (error) { console.error(error); } finally { setIsSearchingMap(false); }
  };

  const procesarPago = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.direccionExtra) return alert("Completa tus datos y dirección.");
    if (paymentMethod === 'yape' && (!formData.numeroOperacion || !comprobanteFile)) return alert("Completa los datos de Yape y sube la captura.");

    setIsProcessing(true);
    try {
      const totalAPagar = parseFloat(cotizacionAPagar.precio_cotizado) + deliveryCost;
      const formDataEnvio = new FormData();
      formDataEnvio.append('cliente_nombre', formData.nombre);
      formDataEnvio.append('total', totalAPagar);
      formDataEnvio.append('metodo_pago', paymentMethod === 'yape' ? `Yape (Op: ${formData.numeroOperacion})` : paymentMethod);
      formDataEnvio.append('direccion', `${formData.direccionExtra} [GPS: ${clientPosition.lat.toFixed(4)}, ${clientPosition.lng.toFixed(4)}]`);
      if (paymentMethod === 'yape' && comprobanteFile) formDataEnvio.append('comprobante', comprobanteFile);

      const response = await fetch(`http://localhost:3000/api/cad/${cotizacionAPagar.id}/pagar`, {
        method: 'POST', body: formDataEnvio
      });

      if (response.ok) {
        alert("🎉 ¡Pago recibido! Hemos pasado tu diseño 3D al área de Producción. Te notificaremos cuando esté en camino.");
        setCotizacionAPagar(null);
        setDniBusqueda('');
        setCotizaciones([]);
        setVista('catalogo');
      } else { alert("Hubo un error al procesar el pago."); }
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  return (
    <div className="container py-5 mt-5 animate__animated animate__fadeIn">
      <button className="btn btn-link text-info text-decoration-none mb-4 p-0 fw-bold" onClick={() => { if(cotizacionAPagar) setCotizacionAPagar(null); else setVista('catalogo'); }}>
        ← Volver {cotizacionAPagar ? 'a Mis Cotizaciones' : 'al Catálogo'}
      </button>

      {/* ================= VISTA 1: BUSCADOR DE DNI Y LISTA ================= */}
      {!cotizacionAPagar && (
        <div className="row justify-content-center">
            <div className="col-lg-8 text-center mb-5">
                <Box size={50} className="text-info mb-3" />
                <h2 className="fw-bold text-white display-5">Mis Cotizaciones 3D</h2>
                <p className="text-white-50 fs-5 mb-4">Ingresa tu DNI para ver el estado y los precios de tus diseños enviados.</p>
                
                <form onSubmit={buscarCotizaciones} className="d-flex justify-content-center gap-2 max-w-md mx-auto" style={{maxWidth: '500px'}}>
                    <input type="text" className="form-control dark-input text-white form-control-lg text-center" placeholder="Ingresa tu DNI o RUC" value={dniBusqueda} onChange={(e) => setDniBusqueda(e.target.value)} required />
                    <button type="submit" className="btn btn-info text-dark px-4 fw-bold" disabled={isBuscando}>{isBuscando ? 'Buscando...' : <Search/>}</button>
                </form>
            </div>

            <div className="col-lg-10">
                {cotizaciones.length > 0 && (
                    <div className="d-flex flex-column gap-3">
                        {cotizaciones.map(cot => (
                            <div key={cot.id} className="card glass-card p-4 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
                                <div className="row align-items-center">
                                    <div className="col-md-5">
                                        <h5 className="text-white fw-bold mb-1"><Layers size={18} className="me-2 text-info"/> Diseño Personalizado</h5>
                                        <p className="text-white-50 small mb-2">Material: {cot.material} | Infill: {cot.infill}</p>
                                        <span className={`badge ${cot.estado.includes('Aprobado') ? 'bg-success' : cot.estado.includes('Producción') ? 'bg-primary' : 'bg-warning text-dark'}`}>{cot.estado}</span>
                                    </div>
                                    <div className="col-md-4 text-md-center mt-3 mt-md-0">
                                        <span className="text-white-50 d-block small">Precio Calculado:</span>
                                        {cot.precio_cotizado > 0 ? (
                                            <h3 className="text-white fw-bold mb-0">S/ {parseFloat(cot.precio_cotizado).toFixed(2)}</h3>
                                        ) : (
                                            <span className="text-warning fst-italic">En evaluación técnica...</span>
                                        )}
                                    </div>
                                    <div className="col-md-3 text-md-end mt-3 mt-md-0">
                                        {cot.estado === 'Cotizado / Aprobado' && (
                                            <button className="btn btn-info text-dark w-100 fw-bold shadow transition hover-scale" onClick={() => { setCotizacionAPagar(cot); setFormData({...formData, nombre: cot.cliente_nombre}); }}>
                                                Pagar y Fabricar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {cotizaciones.length === 0 && dniBusqueda && !isBuscando && (
                    <div className="text-center p-5 bg-dark rounded-4 border border-secondary">
                        <p className="text-white-50 fs-5 mb-0">No encontramos solicitudes con el DNI {dniBusqueda}.</p>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* ================= VISTA 2: CHECKOUT PARA PAGAR EL CAD ================= */}
      {cotizacionAPagar && (
        <div className="row g-5 animate__animated animate__fadeIn">
          <div className="col-12 mb-2">
            <h2 className="fw-bold text-white display-5">Aprobar y Pagar Manufactura</h2>
            <p className="text-info fs-5">Tu diseño está listo para pasar a las impresoras 3D.</p>
          </div>

          <div className="col-lg-7">
            {/* DATOS Y MAPA */}
            <div className="card glass-card p-4 mb-4 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
                <h5 className="text-white fw-bold mb-3 border-bottom border-secondary pb-3"><User className="me-2 text-info"/> 1. Datos y Envío</h5>
                
                <div className="mb-4">
                  <label className="text-white-50 small">Nombre Completo</label>
                  <input type="text" className="form-control dark-input text-white" value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} required/>
                </div>

                <div className="mb-4">
                  <label className="text-white-50 small">Calle, Avenida o Referencia *</label>
                  <div className="input-group shadow-sm border border-secondary rounded-3 overflow-hidden">
                    <span className="input-group-text dark-input border-0"><MapPin size={18}/></span>
                    <input type="text" className="form-control dark-input border-0 text-white" placeholder="Ej. Real Plaza Puruchuco, Ate" value={formData.direccionExtra} onChange={(e)=>setFormData({...formData, direccionExtra: e.target.value})} required />
                    <button className="btn btn-info text-dark fw-bold px-4" type="button" onClick={buscarDireccionEnMapa}>{isSearchingMap ? '...' : 'Buscar'}</button>
                  </div>
                </div>

                <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: '300px', border: '2px solid #334155' }}>
                  <MapContainer center={clientPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <CambiarVistaMapa center={clientPosition} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker draggable={true} eventHandlers={eventHandlers} position={clientPosition} ref={markerRef}><Popup>Destino de entrega</Popup></Marker>
                  </MapContainer>
                </div>
            </div>

            {/* PAGO */}
            <div className="card glass-card p-4 border-0 shadow-lg" style={{backgroundColor: '#1e293b'}}>
                <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3"><CreditCard className="me-2 text-info"/> 2. Método de Pago</h5>
                <div className="d-flex gap-3 mb-4">
                  <button type="button" className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'tarjeta' ? 'btn-primary shadow-lg' : 'btn-outline-secondary text-white'}`} onClick={() => setPaymentMethod('tarjeta')}><CardIcon className="mb-2" size={28} /><br/>Tarjeta</button>
                  <button type="button" className={`btn flex-grow-1 py-3 fw-bold rounded-4 transition ${paymentMethod === 'yape' ? 'btn-info text-dark shadow-lg' : 'btn-outline-secondary text-white'}`} onClick={() => setPaymentMethod('yape')}><Smartphone className="mb-2" size={28} /><br/>Yape / Plin</button>
                </div>

                {paymentMethod === 'yape' && (
                    <div className="bg-dark rounded-4 p-4 border border-info shadow-sm text-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Yape" width="120" className="bg-white p-2 rounded-4 shadow mb-3" />
                        <h4 className="text-info fw-bold mb-4">S/ {(parseFloat(cotizacionAPagar.precio_cotizado) + deliveryCost).toFixed(2)}</h4>
                        
                        <div className="text-start">
                            <label className="text-warning small fw-bold">1. N° de Operación *</label>
                            <input type="text" className="form-control dark-input text-white border-warning mb-3" value={formData.numeroOperacion} onChange={(e)=>setFormData({...formData, numeroOperacion: e.target.value})} required/>
                            
                            <label className="text-warning small fw-bold">2. Captura de Pantalla *</label>
                            <input type="file" accept="image/*" className="form-control dark-input text-white border-warning" onChange={(e) => {
                                const file = e.target.files[0];
                                if(file) { setComprobanteFile(file); setComprobantePreview(URL.createObjectURL(file)); }
                            }} required/>
                            {comprobantePreview && <img src={comprobantePreview} alt="Previa" className="mt-3 rounded-3" style={{height: '100px'}} />}
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card glass-card p-4 sticky-top border-0 shadow-lg" style={{top: '120px', backgroundColor: '#0f172a'}}>
                <h4 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3">Resumen de Orden</h4>
                <div className="d-flex justify-content-between mb-3 text-white-50">
                    <span>Manufactura ({cotizacionAPagar.material}):</span>
                    <span className="text-white">S/ {parseFloat(cotizacionAPagar.precio_cotizado).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-4 text-info">
                    <span>Envío a domicilio:</span>
                    <span className="fw-bold">S/ {deliveryCost.toFixed(2)}</span>
                </div>
                <hr className="border-secondary" />
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-white-50 fw-bold">Total a pagar</span>
                    <span className="fs-1 fw-bold text-white">S/ {(parseFloat(cotizacionAPagar.precio_cotizado) + deliveryCost).toFixed(2)}</span>
                </div>

                <button className="btn btn-primary w-100 py-3 mt-4 rounded-pill fw-bold fs-5 shadow-lg transition" onClick={procesarPago} disabled={isProcessing}>
                    {isProcessing ? 'Procesando Pago...' : <><CheckCircle className="me-2" /> Confirmar y Fabricar</>}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
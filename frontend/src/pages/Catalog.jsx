import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Star, ShieldCheck, Cpu, Clock, Info, 
  UploadCloud, Search, Printer, Package, Truck, MessageCircle, X, CheckCircle, Circle, ChevronDown 
} from 'lucide-react';

export default function Catalog({ addToCart }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Seguimiento de Pedido por DNI
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingStatus, setTrackingStatus] = useState(null);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [pedidoGeneralEstado, setPedidoGeneralEstado] = useState(null);

  // Estados para el FAQ
  const [faqAbierto, setFaqAbierto] = useState(null);

  // Estado para el Chat flotante
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetch('https://fabriconnect-backend.onrender.com/api/productos')
      .then(res => res.json())
      .then(data => { setProductos(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // ==========================================
  // LÓGICA DE RASTREO (TIEMPO REAL / POLLING)
  // ==========================================
  
  // Función central extraída para poder llamarla manualmente o en automático
  const fetchTrackingData = async (codigo, silent = false) => {
    if (!codigo) return;
    if (!silent) setTrackingStatus('loading'); // Si es silencioso (automático), no mostramos el spinner para no parpadear
    
    try {
      const resCad = await fetch(`https://fabriconnect-backend.onrender.com/api/cad/cliente/${codigo}`);
      const dataCad = await resCad.json();
      
      if (dataCad && dataCad.length > 0) {
        const solicitudActual = dataCad[0];
        setTrackedOrder(solicitudActual); 

        let nuevoEstadoGeneral = null;
        if (solicitudActual.estado === 'Pagado / En Producción') {
            const resPedidos = await fetch('https://fabriconnect-backend.onrender.com/api/pedidos');
            const dataPedidos = await resPedidos.json();
            const pedidosDelCliente = dataPedidos.filter(p => p.cliente_nombre.includes(solicitudActual.cliente_nombre));
            
            if (pedidosDelCliente.length > 0) {
                nuevoEstadoGeneral = pedidosDelCliente[pedidosDelCliente.length - 1].estado;
            }
        }
        setPedidoGeneralEstado(nuevoEstadoGeneral);
        setTrackingStatus('found');
      } else {
        if (!silent) setTrackingStatus('not_found');
      }
    } catch (error) {
      console.error("Error al rastrear:", error);
      if (!silent) setTrackingStatus('not_found');
    }
  };

  // Cuando el usuario le da clic al botón
  const rastrearPedido = (e) => {
    e.preventDefault();
    setTrackedOrder(null);
    setPedidoGeneralEstado(null);
    fetchTrackingData(trackingCode, false);
  };

  // NUEVO: El "Motor" que actualiza en tiempo real
  // Si ya encontró un pedido, le pregunta al servidor cada 5 segundos si hay cambios
  useEffect(() => {
    let intervaloSync;
    if (trackingStatus === 'found' && trackingCode) {
        intervaloSync = setInterval(() => {
            fetchTrackingData(trackingCode, true); // true = silencioso
        }, 5000);
    }
    return () => clearInterval(intervaloSync); // Limpia el intervalo si el usuario se va
  }, [trackingStatus, trackingCode]);

  const faqs = [
    { p: "¿Qué archivos 3D aceptan?", r: "Aceptamos formatos estándar de la industria: .STL, .OBJ, .STEP y .GLB. Si tienes otro formato, contáctanos y te ayudamos a convertirlo." },
    { p: "¿Cuánto demora una impresión?", r: "El tiempo depende del volumen y el relleno (infill). Piezas pequeñas demoran de 2 a 5 horas, proyectos complejos pueden tomar de 24 a 48 horas. Siempre te daremos un tiempo estimado en la cotización." },
    { p: "¿Qué materiales utilizan?", r: "Trabajamos con PLA Premium (biodegradable), ABS Industrial, PETG (alta resistencia térmica) y TPU (material flexible)." },
    { p: "¿Pueden copiar una pieza que se rompió?", r: "¡Sí! Ofrecemos servicio de ingeniería inversa. Envíanos fotos y medidas, o trae la pieza a nuestro laboratorio y nosotros la diseñamos desde cero." },
    { p: "¿Hacen envíos a todo Lima?", r: "Absolutamente. Contamos con nuestra propia flota de motorizados equipados con rastreo GPS para que sepas dónde está tu pieza en todo momento." },
    { p: "¿Puedo pedir una sola unidad?", r: "Por supuesto. La ventaja de la impresión 3D es que no necesitas hacer matrices costosas. Fabricamos desde 1 hasta 10,000 unidades." }
  ];

  return (
    <div className="animate__animated animate__fadeIn pb-5 position-relative">
      
      {/* =========================================================================
          1. CARRUSEL HERO
          ========================================================================= */}
      <div id="heroCarousel" className="carousel slide carousel-fade shadow-lg" data-bs-ride="carousel" style={{ borderRadius: '0 0 40px 40px', overflow: 'hidden', marginTop: '-3rem', marginBottom: '5rem' }}>
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active" aria-current="true"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner" style={{ height: '70vh', minHeight: '500px' }}>
          
          <div className="carousel-item active h-100 position-relative">
            <div className="position-absolute w-100 h-100 bg-dark" style={{ opacity: 0.6, zIndex: 1 }}></div>
            <img src="https://images.unsplash.com/photo-1743482710456-0570baa1b240?q=80&w=1920&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Impresión 3D" />
            <div className="carousel-caption d-flex flex-column justify-content-center h-100 text-start" style={{ zIndex: 2, left: '10%', right: '10%' }}>
              <span className="badge bg-info text-dark mb-3 px-3 py-2 fs-6 w-auto d-inline-block">Industria 4.0</span>
              <h1 className="display-3 fw-bold text-white mb-3 text-shadow">Manufactura Digital <br/><span style={{color: '#0dcaf0'}}>A Tu Alcance</span></h1>
              <p className="fs-4 text-white-50 mb-4 text-shadow" style={{maxWidth: '600px'}}>Transformamos tus ideas en realidad con tecnología de impresión 3D y componentes electrónicos de grado industrial.</p>
              <div><a href="#catalogo-productos" className="btn btn-info text-dark btn-lg fw-bold rounded-pill px-5 shadow hover-scale transition">Ver Catálogo</a></div>
            </div>
          </div>

          <div className="carousel-item h-100 position-relative">
            <div className="position-absolute w-100 h-100 bg-dark" style={{ opacity: 0.6, zIndex: 1 }}></div>
            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1920&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Circuitos" />
            <div className="carousel-caption d-flex flex-column justify-content-center h-100 text-end" style={{ zIndex: 2, left: '10%', right: '10%' }}>
              <div className="ms-auto">
                <span className="badge bg-primary text-white mb-3 px-3 py-2 fs-6">Hardware & Robótica</span>
                <h1 className="display-3 fw-bold text-white mb-3 text-shadow">Componentes para <br/>Ingenieros y Makers</h1>
                <p className="fs-4 text-white-50 mb-4 text-shadow ms-auto" style={{maxWidth: '600px'}}>Encuentra desde microcontroladores hasta sensores de precisión. Todo con stock en tiempo real y envío rápido.</p>
              </div>
            </div>
          </div>

          <div className="carousel-item h-100 position-relative">
            <div className="position-absolute w-100 h-100 bg-dark" style={{ opacity: 0.7, zIndex: 1 }}></div>
            <img src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80&w=1920&auto=format&fit=crop" className="d-block w-100 h-100 object-fit-cover" alt="Ingeniería" />
            <div className="carousel-caption d-flex flex-column justify-content-center align-items-center h-100 text-center" style={{ zIndex: 2, left: '10%', right: '10%' }}>
              <h1 className="display-3 fw-bold text-white mb-3 text-shadow">Laboratorio B2B</h1>
              <p className="fs-4 text-white-50 mb-4 text-shadow" style={{maxWidth: '800px'}}>Sube tus propios diseños CAD. Nuestro equipo de ingenieros cotiza, lamina y fabrica tus piezas con los más altos estándares de calidad.</p>
            </div>
          </div>

        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
        </button>
      </div>

      <div className="container">
        
        {/* =========================================================================
            2. ¿QUIÉNES SOMOS? Y VENTAJAS
            ========================================================================= */}
        <div className="row mb-5 pb-4">
          <div className="col-12 text-center mb-5">
            <h2 className="fw-bold text-white display-6">¿Por qué elegir <span className="text-info">FabriConnect?</span></h2>
            <p className="text-white-50 fs-5" style={{maxWidth: '700px', margin: '0 auto'}}>Somos una plataforma integral que une la venta de hardware robótico con servicios de manufactura digital 3D, conectando a creadores con las herramientas del futuro.</p>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card glass-card h-100 p-4 border-0 text-center hover-scale transition shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="bg-dark rounded-circle p-3 mx-auto mb-3 border border-secondary" style={{width: '70px', height: '70px'}}>
                <ShieldCheck size={35} className="text-success"/>
              </div>
              <h4 className="text-white fw-bold">Calidad Garantizada</h4>
              <p className="text-white-50">Todos nuestros componentes y filamentos pasan por estrictos controles de calidad. Tu proyecto no puede fallar.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card glass-card h-100 p-4 border-0 text-center hover-scale transition shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="bg-dark rounded-circle p-3 mx-auto mb-3 border border-secondary" style={{width: '70px', height: '70px'}}>
                <Clock size={35} className="text-warning"/>
              </div>
              <h4 className="text-white fw-bold">Logística Inteligente</h4>
              <p className="text-white-50">Contamos con nuestra propia flota de motorizados y seguimiento GPS en tiempo real para que tu pedido llegue a tiempo.</p>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card glass-card h-100 p-4 border-0 text-center hover-scale transition shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="bg-dark rounded-circle p-3 mx-auto mb-3 border border-secondary" style={{width: '70px', height: '70px'}}>
                <Cpu size={35} className="text-info"/>
              </div>
              <h4 className="text-white fw-bold">Ecosistema Completo</h4>
              <p className="text-white-50">No solo vendemos piezas. Prototipamos, fabricamos e integramos. Somos tu laboratorio de innovación a un clic de distancia.</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. ¿CÓMO TRABAJAMOS? (PROCESO VISUAL)
            ========================================================================= */}
        <div className="text-center mb-5 pb-5 mt-5">
          <h2 className="fw-bold text-white mb-3">Del Diseño a tus Manos</h2>
          <p className="text-white-50 fs-5 mb-5">El proceso de fabricación más rápido y seguro del mercado.</p>
          
          <div className="position-relative d-none d-lg-block mt-4 mb-5" style={{maxWidth: '900px', margin: '0 auto'}}>
            <div className="position-absolute bg-secondary" style={{height: '4px', width: '80%', top: '35px', left: '10%', zIndex: 0}}></div>
            
            <div className="d-flex justify-content-between position-relative z-1">
              <div className="text-center" style={{width: '120px'}}>
                <div className="bg-dark border border-info rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{width: '70px', height: '70px'}}><UploadCloud size={30} className="text-info"/></div>
                <h6 className="text-white fw-bold small">1. Subes tu diseño</h6>
              </div>
              <div className="text-center" style={{width: '120px'}}>
                <div className="bg-dark border border-info rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{width: '70px', height: '70px'}}><Search size={30} className="text-info"/></div>
                <h6 className="text-white fw-bold small">2. Analizamos</h6>
              </div>
              <div className="text-center" style={{width: '120px'}}>
                <div className="bg-dark border border-info rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{width: '70px', height: '70px'}}><Printer size={30} className="text-info"/></div>
                <h6 className="text-white fw-bold small">3. Fabricamos</h6>
              </div>
              <div className="text-center" style={{width: '120px'}}>
                <div className="bg-dark border border-info rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{width: '70px', height: '70px'}}><Package size={30} className="text-info"/></div>
                <h6 className="text-white fw-bold small">4. Preparamos</h6>
              </div>
              <div className="text-center" style={{width: '120px'}}>
                <div className="bg-info rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3 shadow" style={{width: '70px', height: '70px'}}><Truck size={30} className="text-dark"/></div>
                <h6 className="text-white fw-bold small">5. Entrega GPS</h6>
              </div>
            </div>
          </div>

          <div className="d-lg-none text-start px-3">
             <div className="d-flex align-items-center mb-4"><div className="bg-dark border border-info rounded-circle p-3 me-3"><UploadCloud className="text-info"/></div><h5 className="text-white mb-0">1. Subes tu diseño</h5></div>
             <div className="d-flex align-items-center mb-4"><div className="bg-dark border border-info rounded-circle p-3 me-3"><Search className="text-info"/></div><h5 className="text-white mb-0">2. Analizamos el modelo</h5></div>
             <div className="d-flex align-items-center mb-4"><div className="bg-dark border border-info rounded-circle p-3 me-3"><Printer className="text-info"/></div><h5 className="text-white mb-0">3. Fabricamos con precisión</h5></div>
             <div className="d-flex align-items-center mb-4"><div className="bg-dark border border-info rounded-circle p-3 me-3"><Package className="text-info"/></div><h5 className="text-white mb-0">4. Empaquetado seguro</h5></div>
             <div className="d-flex align-items-center"><div className="bg-info rounded-circle p-3 me-3"><Truck className="text-dark"/></div><h5 className="text-white mb-0">5. Entrega con seguimiento</h5></div>
          </div>
        </div>

        {/* =========================================================================
            4. EL CATÁLOGO (SUBIDO DE POSICIÓN)
            ========================================================================= */}
        <div id="catalogo-productos" className="pt-5 pb-5 border-top border-secondary">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h2 className="fw-bold text-white display-6 mb-2"><Cpu className="text-info me-3 d-inline" size={35}/> Catálogo de Componentes</h2>
              <p className="text-white-50 fs-5 mb-0">Añade hardware de alta calidad a tu carrito para completar tus proyectos.</p>
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
                    <img 
                      src={producto.imagen_url ? producto.imagen_url : `https://picsum.photos/seed/${producto.id + 50}/400/300`} 
                      alt={producto.nombre} 
                      className="card-img-top" 
                      style={{ height: '220px', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/334155/94a3b8?text=Imagen+No+Disponible' }}
                    />
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
                        onClick={() => { if(producto.stock > 0) addToCart(producto); }}
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            5. RASTREO DE PEDIDO CAD POR DNI (TIEMPO REAL)
            ========================================================================= */}
        <div className="row justify-content-center mb-5 pb-5 border-top border-secondary pt-5 mt-5">
          <div className="col-lg-8">
            <div className="card glass-card p-4 p-md-5 border-0 shadow-lg text-center hover-scale transition" style={{backgroundColor: '#1e293b', borderRadius: '24px'}}>
              <h3 className="text-white fw-bold mb-3">¿Mandaste a fabricar una pieza?</h3>
              <p className="text-white-50 mb-4">Ingresa tu <strong>DNI o RUC</strong> para conocer el estado de tus diseños en tiempo real.</p>
              
              <form onSubmit={rastrearPedido} className="d-flex justify-content-center gap-2 mb-4 mx-auto" style={{maxWidth: '500px'}}>
                <input 
                  type="text" 
                  className="form-control dark-input text-white form-control-lg text-center fw-bold" 
                  placeholder="Escribe tu DNI" 
                  value={trackingCode} 
                  onChange={(e) => setTrackingCode(e.target.value)} 
                  required 
                />
                <button type="submit" className="btn btn-info text-dark px-4 fw-bold shadow">Rastrear</button>
              </form>

              {trackingStatus === 'loading' && (
                <div className="py-4"><div className="spinner-border text-info" role="status"></div></div>
              )}

              {trackingStatus === 'not_found' && (
                <div className="animate__animated animate__fadeIn text-danger fw-bold py-3">
                  ❌ No se encontró ninguna solicitud de diseño CAD con ese DNI.
                </div>
              )}
              
              {trackingStatus === 'found' && trackedOrder && (
                <div className="bg-dark rounded-4 p-4 border border-secondary animate__animated animate__fadeIn mx-auto" style={{maxWidth: '400px'}}>
                  <h5 className="text-info fw-bold mb-1 text-center">Diseño de: {trackedOrder.cliente_nombre.substring(0,25)}</h5>
                  <p className="text-white-50 small text-center border-bottom border-secondary pb-3 mb-4">
                    Etapa Actual: <strong className="text-white">{pedidoGeneralEstado ? pedidoGeneralEstado : trackedOrder.estado}</strong>
                  </p>
                  
                  {/* ARBOL DE ESTADOS INTELIGENTE */}
                  <div className="d-flex flex-column text-start mx-auto position-relative ps-2" style={{maxWidth: '250px'}}>
                    
                    {/* PASO 1: RECIBIDO */}
                    <div className="d-flex align-items-center mb-3">
                      <CheckCircle className="text-success me-3" size={24} /> 
                      <span className="text-white fw-bold">Pedido recibido</span>
                    </div>
                    
                    {/* PASO 2: VALIDACIÓN / COTIZACIÓN */}
                    <div className="d-flex align-items-center mb-3">
                      {trackedOrder.estado === 'Pendiente de Revisión' ? (
                        <><span className="spinner-grow text-info me-3" style={{width: '24px', height: '24px'}}></span> <span className="text-info fw-bold">Validando diseño...</span></>
                      ) : (
                        <><CheckCircle className="text-success me-3" size={24}/> <span className="text-white fw-bold">Diseño validado</span></>
                      )}
                    </div>
                    
                    {/* PASO 3: PRODUCCIÓN (Pendiente en tabla de motorizado o Cotizado en CAD) */}
                    <div className="d-flex align-items-center mb-3">
                      {!pedidoGeneralEstado ? (
                        trackedOrder.estado === 'Cotizado / Aprobado' ? (
                            <><Circle className="text-secondary me-3" size={24}/> <span className="text-white-50">Falta Pagar</span></>
                        ) : (
                            <><Circle className="text-secondary me-3" size={24}/> <span className="text-white-50">En impresión</span></>
                        )
                      ) : pedidoGeneralEstado === 'Pendiente' ? (
                        <><span className="spinner-grow text-info me-3" style={{width: '24px', height: '24px'}}></span> <span className="text-info fw-bold">Impresión / Preparando</span></>
                      ) : (
                        <><CheckCircle className="text-success me-3" size={24}/> <span className="text-white fw-bold">Impresión Lista</span></>
                      )}
                    </div>
                    
                    {/* PASO 4: EN CAMINO (Motorizado lo marcó "En Ruta") */}
                    <div className="d-flex align-items-center mb-3">
                      {pedidoGeneralEstado === 'En Ruta' ? (
                        <><span className="spinner-grow text-info me-3" style={{width: '24px', height: '24px'}}></span> <span className="text-info fw-bold">En camino al destino</span></>
                      ) : pedidoGeneralEstado === 'Entregado' ? (
                        <><CheckCircle className="text-success me-3" size={24}/> <span className="text-white fw-bold">Ruta completada</span></>
                      ) : (
                         <><Circle className="text-secondary me-3" size={24}/> <span className="text-white-50">Logística</span></>
                      )}
                    </div>
                    
                    {/* PASO 5: ENTREGADO (Motorizado lo marcó "Entregado") */}
                    <div className="d-flex align-items-center">
                      {pedidoGeneralEstado === 'Entregado' ? (
                        <><CheckCircle className="text-success me-3" size={24}/> <span className="text-success fw-bold fs-5">¡Entregado!</span></>
                      ) : (
                        <><Circle className="text-secondary me-3" size={24}/> <span className="text-white-50">Entregado</span></>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. TESTIMONIOS Y CONFIANZA
            ========================================================================= */}
        <div className="row mb-5 pb-5 border-top border-secondary pt-5">
          <div className="col-12 text-center mb-5"><h2 className="fw-bold text-white">Casos de Éxito</h2></div>
          
          <div className="col-md-4 mb-4">
            <div className="card glass-card p-4 border-0 h-100 shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="d-flex text-warning mb-3"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
              <p className="text-white-50 fst-italic mb-4 flex-grow-1">"Necesitábamos carcasas para sensores agrícolas. FabriConnect cotizó en horas y el PETG que usaron superó nuestras expectativas."</p>
              <div className="d-flex align-items-center mt-auto border-top border-secondary pt-3">
                <div className="bg-primary rounded-circle me-3 d-flex justify-content-center align-items-center fw-bold text-white shadow" style={{width: '45px', height: '45px'}}>CI</div>
                <div><h6 className="text-white fw-bold mb-0">Carlos Ibarra</h6><small className="text-info">TechStart Perú SAC</small></div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card glass-card p-4 border-0 h-100 shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="d-flex text-warning mb-3"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
              <p className="text-white-50 fst-italic mb-4 flex-grow-1">"Encontré sensores que no venden en Paruro y el motorizado llegó el mismo día con seguimiento GPS. ¡Salvaron mi tesis de ingeniería!"</p>
              <div className="d-flex align-items-center mt-auto border-top border-secondary pt-3">
                <div className="bg-success rounded-circle me-3 d-flex justify-content-center align-items-center fw-bold text-dark shadow" style={{width: '45px', height: '45px'}}>LM</div>
                <div><h6 className="text-white fw-bold mb-0">Lucía Mendoza</h6><small className="text-info">Estudiante Mecatrónica UNI</small></div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card glass-card p-4 border-0 h-100 shadow-lg" style={{backgroundColor: '#1e293b', borderRadius: '20px'}}>
              <div className="d-flex text-warning mb-3"><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/><Star fill="currentColor" size={18}/></div>
              <p className="text-white-50 fst-italic mb-4 flex-grow-1">"Pagué con Yape y la pieza impresa llegó pulida y perfecta. 100% recomendados para cualquier maker."</p>
              <div className="d-flex align-items-center mt-auto border-top border-secondary pt-3">
                <div className="bg-warning rounded-circle me-3 d-flex justify-content-center align-items-center fw-bold text-dark shadow" style={{width: '45px', height: '45px'}}>RA</div>
                <div><h6 className="text-white fw-bold mb-0">Raúl Arias</h6><small className="text-info">Hobbista / Maker</small></div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. PREGUNTAS FRECUENTES (FAQ)
            ========================================================================= */}
        <div className="row justify-content-center mb-5 pb-5 border-top border-secondary pt-5">
            <div className="col-lg-8">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-white">Preguntas Frecuentes</h2>
                    <p className="text-white-50">Resolvemos tus dudas antes de fabricar.</p>
                </div>
                
                <div className="d-flex flex-column gap-3">
                    {faqs.map((faq, index) => (
                        <div key={index} className="card border-0 shadow-sm" style={{backgroundColor: '#1e293b', borderRadius: '12px'}}>
                            <div 
                                className="card-body p-4 d-flex justify-content-between align-items-center" 
                                style={{cursor: 'pointer'}}
                                onClick={() => setFaqAbierto(faqAbierto === index ? null : index)}
                            >
                                <h6 className="text-white fw-bold mb-0 m-0">{faq.p}</h6>
                                <ChevronDown className={`text-info transition ${faqAbierto === index ? 'rotate-180' : ''}`} style={{transform: faqAbierto === index ? 'rotate(180deg)' : 'none'}}/>
                            </div>
                            {faqAbierto === index && (
                                <div className="card-footer border-top border-secondary p-4 bg-dark text-white-50 border-0 rounded-bottom" style={{borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px'}}>
                                    {faq.r}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

      {/* =========================================================================
          BOTÓN FLOTANTE DE SOPORTE / WHATSAPP
          ========================================================================= */}
      <div className="position-fixed" style={{ bottom: '30px', right: '30px', zIndex: 1050 }}>
        
        {/* Burbuja del Chat */}
        {isChatOpen && (
          <div className="card border-0 shadow-lg mb-3 animate__animated animate__fadeInUp animate__faster" style={{width: '300px', backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden'}}>
            <div className="bg-info p-3 d-flex justify-content-between align-items-center">
              <h6 className="text-dark fw-bold mb-0 d-flex align-items-center"><MessageCircle size={18} className="me-2"/> Soporte FabriConnect</h6>
              <button className="btn btn-link text-dark p-0" onClick={() => setIsChatOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-4">
              <div className="bg-dark p-3 rounded-3 mb-3 border border-secondary">
                <p className="text-white small mb-0">Hola 👋 ¿Necesitas encontrar un repuesto o fabricar una pieza personalizada?</p>
              </div>
              <div className="d-flex flex-column gap-2">
                <a href="#catalogo-productos" className="btn btn-outline-info btn-sm text-start rounded-pill" onClick={() => setIsChatOpen(false)}>Buscar un repuesto</a>
                <button className="btn btn-outline-info btn-sm text-start rounded-pill" onClick={() => setIsChatOpen(false)}>Cotizar impresión 3D</button>
                <button className="btn btn-info text-dark btn-sm text-start rounded-pill fw-bold" onClick={() => setIsChatOpen(false)}>Hablar con un asesor</button>
              </div>
            </div>
          </div>
        )}

        {/* Botón Flotante Principal */}
        <button 
          className="btn btn-info text-dark rounded-circle shadow-lg d-flex justify-content-center align-items-center hover-scale transition" 
          style={{ width: '60px', height: '60px' }}
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          {isChatOpen ? <X size={30} /> : <MessageCircle size={30} />}
        </button>
      </div>

    </div>
  );
}
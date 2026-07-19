import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, Users, 
  Settings, LogOut, DollarSign, Clock, MapPin, Plus, Edit, Trash2, X, Image as ImageIcon, ExternalLink, Search,
  CheckCircle, CreditCard as CardIcon // <--- ¡AQUÍ ESTÁ LA CORRECCIÓN!
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const dataVentas = [
  { name: 'Lun', ventas: 4000 }, { name: 'Mar', ventas: 5500 }, { name: 'Mie', ventas: 3200 },
  { name: 'Jue', ventas: 7800 }, { name: 'Vie', ventas: 8900 }, { name: 'Sab', ventas: 11000 }, { name: 'Dom', ventas: 9500 },
];

export default function AdminDashboard({ setVista, logout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [motorizados, setMotorizados] = useState([]); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('crear');
  const [currentProduct, setCurrentProduct] = useState({
    id: null, nombre: '', precio: '', stock: '', proveedor: '', imagen_url: '', descripcion: ''
  });

  const [isMotoModalOpen, setIsMotoModalOpen] = useState(false);
  const [motoModalMode, setMotoModalMode] = useState('crear');
  const [currentMoto, setCurrentMoto] = useState({
    id: null, nombre: '', email: '', password: ''
  });

  // ESTADOS PARA ASIGNAR RUTA Y VER IMAGEN
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [pedidoToAssign, setPedidoToAssign] = useState(null); 
  const [selectedMotoId, setSelectedMotoId] = useState('');

  const [clientes] = useState([
    { id: 1, nombre: 'Jefferson Silva', dni: '71234567', correo: 'jefferson@gmail.com', telefono: '987123456', total_compras: 2 },
    { id: 2, nombre: 'Tech Startup SAC', dni: '20555444333', correo: 'compras@techstartup.pe', telefono: '999888777', total_compras: 5 }
  ]);

  useEffect(() => {
    cargarDatos();
    const intervaloSincronizacion = setInterval(() => {
      cargarDatos();
    }, 5000);
    return () => clearInterval(intervaloSincronizacion);
  }, []);

  const cargarDatos = () => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/api/pedidos')
      .then(res => res.json()).then(data => setPedidos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al sincronizar pedidos:", err));
      
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json()).then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error al sincronizar productos:", err));

    if (token) {
      fetch('http://localhost:3000/api/usuarios/motorizados', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json()).then(data => {
         if (Array.isArray(data)) setMotorizados(data);
      })
      .catch(err => console.error("Error al sincronizar motorizados", err));
    }
  };

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
      }
    } catch (error) { console.error("Error:", error); }
  };

  const confirmarAsignacion = async () => {
    if (!selectedMotoId) return alert("Por favor selecciona un repartidor de la lista.");
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${pedidoToAssign.id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'En Ruta', motorizado_id: selectedMotoId })
      });
      if (res.ok) {
        setIsAssignModalOpen(false);
        setSelectedMotoId('');
        cargarDatos();
      }
    } catch (error) { console.error("Error:", error); }
  };

  const openModal = (modo, producto = null) => {
    setModalMode(modo);
    if (modo === 'editar' && producto) {
      setCurrentProduct(producto);
    } else {
      setCurrentProduct({ id: null, nombre: '', precio: '', stock: '', proveedor: '', imagen_url: '', descripcion: '' });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => setCurrentProduct({ ...currentProduct, [e.target.name]: e.target.value });

  const guardarProducto = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token'); 
    try {
      const url = modalMode === 'crear' ? 'http://localhost:3000/api/productos' : `http://localhost:3000/api/productos/${currentProduct.id}`;
      const res = await fetch(url, {
        method: modalMode === 'crear' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentProduct)
      });
      const data = await res.json();
      if (res.ok) { setIsModalOpen(false); cargarDatos(); } 
      else if (res.status === 401) { alert("⚠️ Error 401: Tu sesión expiró o no tienes permiso. Cierra sesión y vuelve a ingresar."); } 
      else { alert("Error: " + (data.error || "No se pudo guardar el producto.")); }
    } catch (error) { console.error("Error guardando:", error); }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este componente del catálogo?")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/productos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) cargarDatos();
    } catch (error) { console.error(error); }
  };

  const openMotoModal = (modo, moto = null) => {
    setMotoModalMode(modo);
    if (modo === 'editar' && moto) {
      setCurrentMoto({ id: moto.id, nombre: moto.nombre, email: moto.email, password: '' });
    } else {
      setCurrentMoto({ id: null, nombre: '', email: '', password: '' });
    }
    setIsMotoModalOpen(true);
  };

  const handleMotoInputChange = (e) => setCurrentMoto({ ...currentMoto, [e.target.name]: e.target.value });

  const guardarMotorizado = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const url = motoModalMode === 'crear' ? 'http://localhost:3000/api/usuarios/motorizados' : `http://localhost:3000/api/usuarios/motorizados/${currentMoto.id}`;
      const res = await fetch(url, {
        method: motoModalMode === 'crear' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentMoto)
      });
      const data = await res.json();
      if (res.ok) { setIsMotoModalOpen(false); cargarDatos(); } 
      else if (res.status === 401) { alert("⚠️ Error 401 (Acceso Denegado): Tu sesión de Administrador expiró. Cierra sesión y vuelve a ingresar."); } 
      else { alert("Error del Servidor: " + (data.error || "Verifica que el correo no esté duplicado.")); }
    } catch (error) { console.error("Error guardando motorizado:", error); }
  };

  const eliminarMotorizadoDb = async (id) => {
    if (!window.confirm("¿Dar de baja a este motorizado? Se eliminará su acceso a la App.")) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/motorizados/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) cargarDatos();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="admin-layout animate__animated animate__fadeIn position-relative">
      
      <aside className="admin-sidebar p-4">
        <div className="mb-5 px-2">
          <h3 className="fw-bold text-white mb-0">Fabri<span style={{color: '#8B5CF6'}}>Connect</span></h3>
          <span className="badge bg-secondary mt-2">Admin Portal</span>
        </div>

        <nav className="d-flex flex-column gap-2 flex-grow-1">
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}><LayoutDashboard className="me-3" size={20} /> Overview</button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveMenu('pedidos')}><ShoppingCart className="me-3" size={20} /> Gestión de Pedidos</button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'productos' ? 'active' : ''}`} onClick={() => setActiveMenu('productos')}><Package className="me-3" size={20} /> Inventario / CAD</button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'motorizados' ? 'active' : ''}`} onClick={() => setActiveMenu('motorizados')}><Truck className="me-3" size={20} /> Motorizados (CRUD)</button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'clientes' ? 'active' : ''}`} onClick={() => setActiveMenu('clientes')}><Users className="me-3" size={20} /> Clientes B2B/B2C</button>
        </nav>

        <div className="mt-auto border-top border-secondary pt-4">
          <button className="sidebar-link text-danger w-100 text-start border-0 bg-transparent" onClick={() => { logout(); setVista('login'); }}><LogOut className="me-3" size={20} /> Cerrar Sesión</button>
        </div>
      </aside>

      <main className="admin-content">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="text-white fw-bold mb-1">
              {activeMenu === 'dashboard' && 'Panel de Control'}
              {activeMenu === 'pedidos' && 'Gestión de Pedidos'}
              {activeMenu === 'productos' && 'Inventario de Componentes'}
              {activeMenu === 'motorizados' && 'Gestión de Logística'}
              {activeMenu === 'clientes' && 'Directorio de Clientes'}
            </h2>
            <p className="text-white-50 mb-0">Administración general de la plataforma.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-outline-light rounded-circle p-2"><Settings size={20}/></button>
            <div className="d-flex align-items-center gap-2 bg-dark rounded-pill px-3 py-2 border border-secondary">
              <div className="bg-primary rounded-circle" style={{width: '30px', height: '30px'}}></div>
              <span className="text-white fw-bold small">Admin Principal</span>
            </div>
          </div>
        </div>

        {activeMenu === 'dashboard' && (
          <div className="animate__animated animate__fadeIn">
             <div className="row g-4 mb-5">
              <div className="col-md-3"><div className="kpi-card"><div className="d-flex justify-content-between mb-3"><span className="text-white-50">Ingresos</span><DollarSign className="text-success" size={24} /></div><h3 className="text-white fw-bold">S/ 4,250.00</h3></div></div>
              <div className="col-md-3"><div className="kpi-card"><div className="d-flex justify-content-between mb-3"><span className="text-white-50">Pendientes</span><Clock className="text-warning" size={24} /></div><h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'Pendiente').length}</h3></div></div>
              <div className="col-md-3"><div className="kpi-card"><div className="d-flex justify-content-between mb-3"><span className="text-white-50">En Reparto</span><Truck className="text-info" size={24} /></div><h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'En Ruta').length}</h3></div></div>
              <div className="col-md-3"><div className="kpi-card"><div className="d-flex justify-content-between mb-3"><span className="text-white-50">Entregados</span><Package className="text-primary" size={24} /></div><h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'Entregado').length}</h3></div></div>
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="kpi-card h-100">
                  <h5 className="text-white fw-bold mb-4">Ingresos por Ventas Semanales</h5>
                  <div style={{ width: '100%', height: '300px', minHeight: '300px', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dataVentas}><defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} /><XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} /><YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `S/${value}`} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} /><Area type="monotone" dataKey="ventas" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" /></AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="kpi-card h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4"><h5 className="text-white fw-bold mb-0">Últimos Pedidos</h5></div>
                  <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                    <table className="glass-table"><tbody>{pedidos.slice(0, 4).map(p => (<tr key={p.id}><td className="fw-bold">{p.cliente_nombre.substring(0,10)}...</td><td><span className={`status-badge ${p.estado === 'Pendiente' ? 'status-pending' : p.estado === 'En Ruta' ? 'status-transit' : 'status-delivered'}`}>{p.estado}</span></td></tr>))}</tbody></table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'pedidos' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <h5 className="text-white fw-bold mb-4">Todos los Pedidos de la Plataforma</h5>
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Cliente</th><th>Destino</th><th>Método</th><th>Total</th><th className="text-center">Estado / Acción</th></tr></thead>
              <tbody>
                {pedidos.map(p => (
                  <tr key={p.id}>
                    <td className="text-white-50">#{p.id}</td><td className="fw-bold text-white">{p.cliente_nombre}</td>
                    <td className="text-white-50"><MapPin size={14} className="text-info me-1"/> {p.direccion.substring(0, 20)}...</td>
                    <td className="text-uppercase small text-white-50">
                      {p.metodo_pago && p.metodo_pago.toLowerCase().includes('yape') ? 
                          <span className="badge bg-info text-dark px-2 py-1">YAPE</span> : 
                          p.metodo_pago}
                    </td>
                    <td className="text-success fw-bold">S/ {parseFloat(p.total).toFixed(2)}</td>
                    <td className="text-center">
                      <span className={`status-badge mb-2 d-inline-block ${p.estado === 'Pendiente' ? 'status-pending' : p.estado === 'En Ruta' ? 'status-transit' : 'status-delivered'}`}>{p.estado}</span>
                      
                      {p.estado === 'Pendiente' && (
                        <button 
                          className="btn btn-sm btn-primary rounded-pill w-100 shadow fw-bold d-flex align-items-center justify-content-center" 
                          onClick={() => { setPedidoToAssign(p); setIsAssignModalOpen(true); }}
                        >
                          <Search size={14} className="me-1"/> Validar Pago
                        </button>
                      )}

                      {p.estado === 'En Ruta' && <button className="btn btn-sm btn-info text-dark rounded-pill w-100" onClick={() => cambiarEstadoPedido(p.id, 'Entregado')}>Marcar Listo</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeMenu === 'productos' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Catálogo y Componentes</h5>
              <button className="btn btn-primary rounded-pill fw-bold px-4 shadow" onClick={() => openModal('crear')}><Plus size={18} className="me-2"/> Nuevo Componente</button>
            </div>
            <div className="overflow-auto">
              <table className="glass-table">
                <thead><tr><th>Img</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Proveedor</th><th className="text-center">Acciones</th></tr></thead>
                <tbody>
                  {productos.map(prod => (
                    <tr key={prod.id}>
                      <td>{prod.imagen_url ? (<img src={prod.imagen_url} alt="Prod" style={{width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover'}} />) : (<div className="bg-secondary rounded-3 d-flex justify-content-center align-items-center" style={{width:'40px', height:'40px'}}><ImageIcon size={18} className="text-white-50"/></div>)}</td>
                      <td className="fw-bold text-white">{prod.nombre}</td><td className="text-info fw-bold">S/ {parseFloat(prod.precio).toFixed(2)}</td>
                      <td><span className={`badge ${prod.stock > 10 ? 'bg-success' : 'bg-danger'}`}>{prod.stock} und.</span></td><td className="text-white-50">{prod.proveedor}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-info rounded-circle me-2 transition" onClick={() => openModal('editar', prod)}><Edit size={14}/></button>
                        <button className="btn btn-sm btn-outline-danger rounded-circle transition" onClick={() => eliminarProducto(prod.id)}><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'motorizados' && (
          <div className="kpi-card animate__animated animate__fadeIn">
             <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Flota de Logística</h5>
              <button className="btn btn-info text-dark rounded-pill fw-bold px-4 shadow" onClick={() => openMotoModal('crear')}><Plus size={18} className="me-2"/> Añadir Repartidor</button>
            </div>
            <table className="glass-table">
              <thead><tr><th>ID</th><th>Nombre / Chofer</th><th>Correo (Acceso App)</th><th>Rol</th><th className="text-center">Acciones</th></tr></thead>
              <tbody>
                {motorizados.map(moto => (
                  <tr key={moto.id}>
                    <td className="text-white-50">#{moto.id}</td><td className="fw-bold text-white">{moto.nombre}</td>
                    <td className="text-white-50 text-info">{moto.email}</td><td><span className="badge bg-primary text-uppercase">{moto.rol || 'motorizado'}</span></td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info rounded-circle me-2 transition" onClick={() => openMotoModal('editar', moto)}><Edit size={14}/></button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle transition" onClick={() => eliminarMotorizadoDb(moto.id)}><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {motorizados.length === 0 && <tr><td colSpan="5" className="text-center text-white-50 py-4">No hay motorizados registrados.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeMenu === 'clientes' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <h5 className="text-white fw-bold mb-4">Directorio de Clientes</h5>
            <table className="glass-table">
              <thead><tr><th>Nombre Completo</th><th>DNI / RUC</th><th>Correo</th><th>Frecuencia</th></tr></thead>
              <tbody>
                {clientes.map(cli => (
                  <tr key={cli.id}>
                    <td className="fw-bold text-white d-flex align-items-center"><Users size={16} className="me-2 text-info"/> {cli.nombre}</td>
                    <td className="text-white-50">{cli.dni}</td><td className="text-info">{cli.correo}</td>
                    <td><span className="badge bg-primary rounded-pill">{cli.total_compras} Compras</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODAL ASIGNAR RUTA Y VALIDAR PAGO YAPE (CON VISTA DE FOTO CLOUDFLARE R2)
          ========================================================================= */}
      {isAssignModalOpen && pedidoToAssign && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{zIndex: 3000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'}}>
          <div className="card glass-card border-0 shadow-lg p-4" style={{width: '100%', maxWidth: '450px', backgroundColor: '#1e293b'}}>
            
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-3">
                <h4 className="text-white fw-bold mb-0 d-flex align-items-center"><Truck className="me-2 text-info"/> Validar y Despachar</h4>
                <button className="btn btn-link text-white-50 p-0" onClick={() => setIsAssignModalOpen(false)}><X size={24}/></button>
            </div>
            
            <p className="text-white-50 small text-center mb-3">Orden #{pedidoToAssign.id} - {pedidoToAssign.cliente_nombre}</p>

            {/* CAJA DE VISUALIZACIÓN DE IMAGEN */}
            <div className="bg-dark rounded-4 p-3 mb-4 border border-secondary text-center position-relative">
                <p className="text-white-50 mb-2 small text-uppercase fw-bold">Evidencia de Pago</p>
                
                {pedidoToAssign.metodo_pago && pedidoToAssign.metodo_pago.toLowerCase().includes('yape') ? (
                    pedidoToAssign.comprobante_url ? (
                        <div className="d-flex flex-column align-items-center">
                            {/* IMAGEN DE CLOUDFLARE R2 */}
                            <img 
                              src={pedidoToAssign.comprobante_url} 
                              alt="Voucher Yape" 
                              className="shadow-sm"
                              style={{maxWidth: '100%', maxHeight: '200px', borderRadius: '10px', objectFit: 'contain', border: '1px solid #334155'}} 
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://via.placeholder.com/400x200/1e293b/dc3545?text=Foto+No+Encontrada";
                              }}
                            />
                            <p className="text-success mt-2 mb-1 fw-bold small d-flex align-items-center"><CheckCircle size={14} className="me-1"/> Captura detectada</p>
                            
                            {/* ENLACE PARA ABRIR EN PESTAÑA NUEVA */}
                            <a 
                              href={pedidoToAssign.comprobante_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="d-inline-flex align-items-center text-info small mt-1 text-decoration-none bg-secondary px-3 py-1 rounded-pill"
                            >
                              <ExternalLink size={12} className="me-2"/> Ampliar imagen
                            </a>
                        </div>
                    ) : (
                        <p className="text-danger fw-bold my-4">❌ El cliente no subió captura de pantalla.</p>
                    )
                ) : (
                    <div className="py-4">
                      <CardIcon size={40} className="text-info mb-2 opacity-50"/>
                      <p className="text-info fw-bold mb-0">Tarjeta de Crédito</p>
                      <small className="text-white-50">Aprobado automáticamente por la pasarela.</small>
                    </div>
                )}
            </div>
            
            <p className="text-white-50 small mb-2">Selecciona a qué motorizado le asignarás la ruta:</p>
            <select className="form-select dark-input text-white mb-4 py-3 border-secondary" value={selectedMotoId} onChange={(e) => setSelectedMotoId(e.target.value)}>
              <option value="">-- Escoge en la lista --</option>
              {motorizados.map(m => (
                <option key={m.id} value={m.id}>{m.nombre} ({m.email})</option>
              ))}
            </select>

            <button className="btn btn-info text-dark w-100 py-3 rounded-pill fw-bold shadow-lg transition hover-scale" onClick={confirmarAsignacion}>
                Aprobar Pago y Asignar Ruta
            </button>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTOS */}
      {isModalOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'}}>
          <div className="card glass-card border-0 shadow-lg" style={{width: '100%', maxWidth: '600px', backgroundColor: '#1e293b'}}>
            <div className="card-header border-bottom border-secondary d-flex justify-content-between align-items-center p-4">
              <h4 className="text-white fw-bold mb-0">{modalMode === 'crear' ? 'Agregar Nuevo Producto' : 'Editar Producto'}</h4>
              <button className="btn btn-link text-white-50 p-0" onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={guardarProducto}>
                <div className="row g-3">
                  <div className="col-12"><label className="text-white-50 small fw-bold">Nombre del Componente</label><input type="text" name="nombre" value={currentProduct.nombre} onChange={handleInputChange} className="form-control dark-input text-white" required /></div>
                  <div className="col-md-6"><label className="text-white-50 small fw-bold">Precio (S/)</label><input type="number" step="0.01" name="precio" value={currentProduct.precio} onChange={handleInputChange} className="form-control dark-input text-white text-info fw-bold" required /></div>
                  <div className="col-md-6"><label className="text-white-50 small fw-bold">Stock Disponible</label><input type="number" name="stock" value={currentProduct.stock} onChange={handleInputChange} className="form-control dark-input text-white" required /></div>
                  <div className="col-md-6"><label className="text-white-50 small fw-bold">Proveedor / Marca</label><input type="text" name="proveedor" value={currentProduct.proveedor} onChange={handleInputChange} className="form-control dark-input text-white" /></div>
                  <div className="col-md-6"><label className="text-white-50 small fw-bold">URL Imagen (Link)</label><input type="text" name="imagen_url" value={currentProduct.imagen_url} onChange={handleInputChange} className="form-control dark-input text-white" placeholder="https://ejemplo.com/foto.jpg" /></div>
                  <div className="col-12"><label className="text-white-50 small fw-bold">Descripción</label><textarea name="descripcion" value={currentProduct.descripcion} onChange={handleInputChange} className="form-control dark-input text-white" rows="3"></textarea></div>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-secondary">
                  <button type="button" className="btn btn-outline-secondary text-white fw-bold rounded-pill px-4" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-info text-dark fw-bold rounded-pill px-4 shadow">{modalMode === 'crear' ? 'Guardar Producto' : 'Actualizar Cambios'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MOTORIZADOS */}
      {isMotoModalOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)'}}>
          <div className="card glass-card border-0 shadow-lg" style={{width: '100%', maxWidth: '500px', backgroundColor: '#1e293b'}}>
            <div className="card-header border-bottom border-secondary d-flex justify-content-between align-items-center p-4">
              <h4 className="text-white fw-bold mb-0">{motoModalMode === 'crear' ? 'Crear Nuevo Motorizado' : 'Editar Motorizado'}</h4>
              <button className="btn btn-link text-white-50 p-0" onClick={() => setIsMotoModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="card-body p-4">
              <form onSubmit={guardarMotorizado}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="text-white-50 small fw-bold">Nombre del Repartidor</label>
                    <input type="text" name="nombre" value={currentMoto.nombre} onChange={handleMotoInputChange} className="form-control dark-input text-white" required placeholder="Ej. Carlos Mendoza" />
                  </div>
                  <div className="col-12">
                    <label className="text-white-50 small fw-bold">Correo (Para que inicie sesión en la App)</label>
                    <input type="email" name="email" value={currentMoto.email} onChange={handleMotoInputChange} className="form-control dark-input text-white" required placeholder="moto@fabriconnect.com" />
                  </div>
                  <div className="col-12">
                    <label className="text-white-50 small fw-bold">Contraseña Segura {motoModalMode === 'editar' && '(Déjala en blanco si no cambias)'}</label>
                    <input type="password" name="password" value={currentMoto.password} onChange={handleMotoInputChange} className="form-control dark-input text-white" required={motoModalMode === 'crear'} placeholder="••••••••" />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-secondary">
                  <button type="button" className="btn btn-outline-secondary text-white fw-bold rounded-pill px-4" onClick={() => setIsMotoModalOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-info text-dark fw-bold rounded-pill px-4 shadow">{motoModalMode === 'crear' ? 'Guardar y Dar Acceso' : 'Actualizar Repartidor'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Truck, Users, 
  Settings, LogOut, TrendingUp, DollarSign, Clock, MapPin, Plus, Edit, Trash2 
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Datos simulados para el gráfico de ventas
const dataVentas = [
  { name: 'Lun', ventas: 4000 }, { name: 'Mar', ventas: 5500 }, { name: 'Mie', ventas: 3200 },
  { name: 'Jue', ventas: 7800 }, { name: 'Vie', ventas: 8900 }, { name: 'Sab', ventas: 11000 }, { name: 'Dom', ventas: 9500 },
];

export default function AdminDashboard({ setVista, logout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // ESTADOS GLOBALES PARA LAS VISTAS
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  
  // Datos simulados para Motorizados y Clientes (Hasta que actualicemos el backend para estos)
  const [motorizados, setMotorizados] = useState([
    { id: 1, nombre: 'Carlos Repartidor', placa: '123-ABC', estado: 'Activo', telefono: '987654321' },
    { id: 2, nombre: 'Luis Gómez (Moto)', placa: 'XYZ-987', estado: 'Ocupado', telefono: '912345678' }
  ]);
  
  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Jefferson Silva', dni: '71234567', correo: 'jefferson@gmail.com', telefono: '987123456', total_compras: 2 },
    { id: 2, nombre: 'Tech Startup SAC', dni: '20555444333', correo: 'compras@techstartup.pe', telefono: '999888777', total_compras: 5 }
  ]);

  // Jalar datos reales desde PostgreSQL al cargar
  useEffect(() => {
    // Cargar Pedidos
    fetch('http://localhost:3000/api/pedidos')
      .then(res => res.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []));
      
    // Cargar Productos (Inventario)
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []));
  }, []);

  const cambiarEstadoPedido = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) setPedidos(pedidos.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
    } catch (error) { console.error("Error:", error); }
  };

  return (
    <div className="admin-layout animate__animated animate__fadeIn">
      
      {/* 1. SIDEBAR (Navegación Lateral) */}
      <aside className="admin-sidebar p-4">
        <div className="mb-5 px-2">
          <h3 className="fw-bold text-white mb-0">Fabri<span style={{color: '#8B5CF6'}}>Connect</span></h3>
          <span className="badge bg-secondary mt-2">Admin Portal</span>
        </div>

        <nav className="d-flex flex-column gap-2 flex-grow-1">
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
            <LayoutDashboard className="me-3" size={20} /> Overview
          </button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveMenu('pedidos')}>
            <ShoppingCart className="me-3" size={20} /> Gestión de Pedidos
          </button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'productos' ? 'active' : ''}`} onClick={() => setActiveMenu('productos')}>
            <Package className="me-3" size={20} /> Inventario / CAD
          </button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'motorizados' ? 'active' : ''}`} onClick={() => setActiveMenu('motorizados')}>
            <Truck className="me-3" size={20} /> Motorizados (CRUD)
          </button>
          <button className={`sidebar-link w-100 text-start border-0 bg-transparent ${activeMenu === 'clientes' ? 'active' : ''}`} onClick={() => setActiveMenu('clientes')}>
            <Users className="me-3" size={20} /> Clientes B2B/B2C
          </button>
          {/* Eliminado el apartado de reportes según tu solicitud */}
        </nav>

        <div className="mt-auto border-top border-secondary pt-4">
          <button className="sidebar-link text-danger w-100 text-start border-0 bg-transparent" onClick={() => { logout(); setVista('login'); }}>
            <LogOut className="me-3" size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL DINÁMICO */}
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

        {/* =========================================
            VISTA 1: OVERVIEW (DASHBOARD PRINCIPAL)
            ========================================= */}
        {activeMenu === 'dashboard' && (
          <div className="animate__animated animate__fadeIn">
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="kpi-card">
                  <div className="d-flex justify-content-between mb-3"><span className="text-white-50">Ingresos (Hoy)</span><DollarSign className="text-success" size={24} /></div>
                  <h3 className="text-white fw-bold">S/ 4,250.00</h3>
                  <small className="text-success fw-bold"><TrendingUp size={14}/> +15% vs ayer</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="kpi-card">
                  <div className="d-flex justify-content-between mb-3"><span className="text-white-50">Pedidos Pendientes</span><Clock className="text-warning" size={24} /></div>
                  <h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'Pendiente').length}</h3>
                  <small className="text-white-50">Requieren asignación</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="kpi-card">
                  <div className="d-flex justify-content-between mb-3"><span className="text-white-50">En Reparto</span><Truck className="text-info" size={24} /></div>
                  <h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'En Ruta').length}</h3>
                  <small className="text-white-50">Motorizados activos: {motorizados.filter(m=>m.estado==='Activo').length}</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="kpi-card">
                  <div className="d-flex justify-content-between mb-3"><span className="text-white-50">Entregados (Mes)</span><Package className="text-primary" size={24} /></div>
                  <h3 className="text-white fw-bold">{pedidos.filter(p => p.estado === 'Entregado').length}</h3>
                  <small className="text-success fw-bold"><TrendingUp size={14}/> +8% vs mes pasado</small>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="kpi-card h-100">
                  <h5 className="text-white fw-bold mb-4">Ingresos por Ventas Semanales</h5>
                  <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dataVentas}>
                        <defs>
                          <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                        <YAxis stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(value) => `S/${value}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        <Area type="monotone" dataKey="ventas" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorVentas)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="kpi-card h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="text-white fw-bold mb-0">Últimos Pedidos</h5>
                    <button className="btn btn-sm btn-outline-info rounded-pill" onClick={() => setActiveMenu('pedidos')}>Ver todos</button>
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                    <table className="glass-table">
                      <tbody>
                        {pedidos.slice(0, 4).map(pedido => (
                          <tr key={pedido.id}>
                            <td className="fw-bold">{pedido.cliente_nombre.substring(0,10)}...</td>
                            <td>
                              <span className={`status-badge ${pedido.estado === 'Pendiente' ? 'status-pending' : pedido.estado === 'En Ruta' ? 'status-transit' : 'status-delivered'}`}>
                                {pedido.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            VISTA 2: GESTIÓN DE PEDIDOS
            ========================================= */}
        {activeMenu === 'pedidos' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <h5 className="text-white fw-bold mb-4">Todos los Pedidos de la Plataforma</h5>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Destino</th>
                  <th>Método</th>
                  <th>Total</th>
                  <th className="text-center">Estado / Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map(pedido => (
                  <tr key={pedido.id}>
                    <td className="text-white-50">#{pedido.id}</td>
                    <td className="fw-bold text-white">{pedido.cliente_nombre}</td>
                    <td className="text-white-50"><MapPin size={14} className="text-info me-1"/> {pedido.direccion.substring(0, 20)}...</td>
                    <td className="text-uppercase small text-white-50">{pedido.metodo_pago}</td>
                    <td className="text-success fw-bold">S/ {parseFloat(pedido.total).toFixed(2)}</td>
                    <td className="text-center">
                      <span className={`status-badge mb-2 d-inline-block ${pedido.estado === 'Pendiente' ? 'status-pending' : pedido.estado === 'En Ruta' ? 'status-transit' : 'status-delivered'}`}>
                        {pedido.estado}
                      </span>
                      {pedido.estado === 'Pendiente' && <button className="btn btn-sm btn-primary rounded-pill w-100" onClick={() => cambiarEstadoPedido(pedido.id, 'En Ruta')}>Asignar Ruta</button>}
                      {pedido.estado === 'En Ruta' && <button className="btn btn-sm btn-info text-dark rounded-pill w-100" onClick={() => cambiarEstadoPedido(pedido.id, 'Entregado')}>Marcar Listo</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================
            VISTA 3: INVENTARIO (CRUD)
            ========================================= */}
        {activeMenu === 'productos' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Catálogo y Componentes CAD</h5>
              <button className="btn btn-primary rounded-pill fw-bold px-4" onClick={() => alert('Abriendo modal para registrar producto...')}>
                <Plus size={18} className="me-2"/> Nuevo Componente
              </button>
            </div>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Producto</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Proveedor</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(prod => (
                  <tr key={prod.id}>
                    <td className="text-white-50">#{prod.id}</td>
                    <td className="fw-bold text-white">{prod.nombre}</td>
                    <td className="text-info fw-bold">S/ {parseFloat(prod.precio).toFixed(2)}</td>
                    <td><span className={`badge ${prod.stock > 20 ? 'bg-success' : 'bg-danger'}`}>{prod.stock} und.</span></td>
                    <td className="text-white-50">{prod.proveedor}</td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info rounded-circle me-2" onClick={() => alert('Editar producto ' + prod.id)}><Edit size={14}/></button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle" onClick={() => alert('Eliminar producto ' + prod.id)}><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================
            VISTA 4: MOTORIZADOS (CRUD)
            ========================================= */}
        {activeMenu === 'motorizados' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Flota de Logística</h5>
              <button className="btn btn-info text-dark rounded-pill fw-bold px-4" onClick={() => alert('Abriendo modal para registrar motorizado...')}>
                <Plus size={18} className="me-2"/> Añadir Repartidor
              </button>
            </div>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Placa / Vehículo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {motorizados.map(moto => (
                  <tr key={moto.id}>
                    <td className="text-white-50">#{moto.id}</td>
                    <td className="fw-bold text-white">{moto.nombre}</td>
                    <td className="text-white-50 text-uppercase">{moto.placa}</td>
                    <td className="text-white-50">{moto.telefono}</td>
                    <td><span className={`status-badge ${moto.estado === 'Activo' ? 'status-delivered' : 'status-pending'}`}>{moto.estado}</span></td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-info rounded-circle me-2"><Edit size={14}/></button>
                      <button className="btn btn-sm btn-outline-danger rounded-circle"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* =========================================
            VISTA 5: CLIENTES B2B/B2C
            ========================================= */}
        {activeMenu === 'clientes' && (
          <div className="kpi-card animate__animated animate__fadeIn">
            <h5 className="text-white fw-bold mb-4">Directorio de Clientes Registrados</h5>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>DNI / RUC</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th>Frecuencia</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(cli => (
                  <tr key={cli.id}>
                    <td className="fw-bold text-white d-flex align-items-center"><Users size={16} className="me-2 text-info"/> {cli.nombre}</td>
                    <td className="text-white-50">{cli.dni}</td>
                    <td className="text-info">{cli.correo}</td>
                    <td className="text-white-50">{cli.telefono}</td>
                    <td><span className="badge bg-primary rounded-pill">{cli.total_compras} Compras</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
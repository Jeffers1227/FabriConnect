import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import CadUpload from './pages/CadUpload';
import CartOffcanvas from './components/CartOffcanvas';
import Checkout from './pages/Checkout';
import Hero from './components/Hero';
import AdminDashboard from './pages/AdminDashboard'; 
import DriverDashboard from './pages/DriverDashboard'; // <-- Importamos la App del Motorizado

export default function App() {
  const [vista, setVista] = useState('catalogo');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
    // Animación suave de confirmación
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Extraemos la función logout para poder pasarla fácilmente
  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.clear();
    setVista('catalogo');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: vista === 'admin' || vista === 'motorizado' ? '#090E17' : '#0f172a' }}>
      
      {/* Ocultamos el Navbar clásico y el Offcanvas si estamos en el panel de Admin O en la App del Motorizado */}
      {vista !== 'admin' && vista !== 'motorizado' && (
        <>
          <Navbar usuario={usuario} setVista={setVista} logout={logout} cartCount={cartItems.length} />
          <CartOffcanvas cartItems={cartItems} removeFromCart={removeFromCart} setVista={setVista} />
        </>
      )}
      
      {/* El Hero también se oculta si somos Admin o Motorizado */}
      {vista === 'catalogo' && <Hero />}
      
      {/* Contenedor condicional: fluido sin padding para admin/motorizado, con padding para las demás vistas */}
      <main className={vista === 'admin' || vista === 'motorizado' ? "" : "container-fluid px-lg-5 pt-5 mt-5"}>
        {vista === 'catalogo' && <Catalog addToCart={addToCart} token={token} />}
        {vista === 'login' && <Login guardarSesion={(t, u) => {setToken(t); setUsuario(u);}} setVista={setVista} />}
        {vista === 'cad' && <CadUpload token={token} />}
        {vista === 'checkout' && <Checkout cartItems={cartItems} setVista={setVista} />}
        
        {/* VISTA ADMINISTRADOR */}
        {vista === 'admin' && <AdminDashboard setVista={setVista} logout={logout} />}

        {/* NUEVO: VISTA MOTORIZADO (App Móvil) */}
        {vista === 'motorizado' && <DriverDashboard setVista={setVista} logout={logout} />}
      </main>
    </div>
  );
}
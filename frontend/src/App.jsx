import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import SubirCAD from './pages/SubirCAD'; 
import MisCotizaciones from './pages/MisCotizaciones'; // <-- NUEVO: Importamos la vista de cotizaciones
import CartOffcanvas from './components/CartOffcanvas';
import Checkout from './pages/Checkout';
import Hero from './components/Hero';
import AdminDashboard from './pages/AdminDashboard'; 
import DriverDashboard from './pages/DriverDashboard'; 

export default function App() {
  const [vista, setVista] = useState('catalogo');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.clear();
    setVista('catalogo');
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: vista === 'admin' || vista === 'motorizado' ? '#090E17' : '#0f172a' }}>
      
      {vista !== 'admin' && vista !== 'motorizado' && (
        <>
          <Navbar usuario={usuario} setVista={setVista} logout={logout} cartCount={cartItems.length} />
          <CartOffcanvas cartItems={cartItems} removeFromCart={removeFromCart} setVista={setVista} />
        </>
      )}
      
      {vista === 'catalogo' && <Hero />}
      
      <main className={vista === 'admin' || vista === 'motorizado' ? "" : "container-fluid px-lg-5 pt-5 mt-5"}>
        {vista === 'catalogo' && <Catalog addToCart={addToCart} token={token} />}
        
        {vista === 'login' && <Login guardarSesion={(t, u) => {
            setToken(t); 
            setUsuario(u); 
            localStorage.setItem('token', t); 
            localStorage.setItem('usuario', JSON.stringify(u)); 
        }} setVista={setVista} />}
        
        {vista === 'subircad' && <SubirCAD setVista={setVista} />}
        
        {/* NUEVO: RUTA PARA MIS COTIZACIONES */}
        {vista === 'mis_cotizaciones' && <MisCotizaciones setVista={setVista} />}
        
        {vista === 'checkout' && <Checkout cartItems={cartItems} setVista={setVista} />}
        
        {vista === 'admin' && <AdminDashboard setVista={setVista} logout={logout} />}

        {vista === 'motorizado' && <DriverDashboard setVista={setVista} logout={logout} usuario={usuario} />}
      </main>
    </div>
  );
}
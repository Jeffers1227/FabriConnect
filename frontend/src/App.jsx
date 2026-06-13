import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import CadUpload from './pages/CadUpload';
import CartOffcanvas from './components/CartOffcanvas';
import Checkout from './pages/Checkout';
import Hero from './components/Hero';

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

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#211e1e' }}>
      <Navbar usuario={usuario} setVista={setVista} logout={() => {setToken(null); setUsuario(null); localStorage.clear(); setVista('catalogo');}} cartCount={cartItems.length} />
      <CartOffcanvas cartItems={cartItems} removeFromCart={removeFromCart} setVista={setVista} />
      
      {vista === 'catalogo' && <Hero />}
      
      <main className="container-fluid px-lg-5">
        {vista === 'catalogo' && <Catalog addToCart={addToCart} />}
        {vista === 'login' && <Login guardarSesion={(t, u) => {setToken(t); setUsuario(u);}} setVista={setVista} />}
        {vista === 'cad' && <CadUpload token={token} />}
        {vista === 'checkout' && <Checkout cartItems={cartItems} setVista={setVista} />}
      </main>
    </div>
  );
}
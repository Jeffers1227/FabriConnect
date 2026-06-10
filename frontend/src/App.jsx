import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import Login from './pages/Login';
import CadUpload from './pages/CadUpload';

export default function App() {
  const [vista, setVista] = useState('catalogo');
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('usuario')) || null);

  const guardarSesion = (userToken, userData) => {
    setToken(userToken);
    setUsuario(userData);
    localStorage.setItem('token', userToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.clear();
    setVista('catalogo');
  };

  return (
    <>
      <Navbar usuario={usuario} setVista={setVista} logout={logout} />
      <main class="py-2">
        {vista === 'catalogo' && <Catalog />}
        {vista === 'login' && <Login guardarSesion={guardarSesion} setVista={setVista} />}
        {vista === 'cad' && <CadUpload token={token} />}
      </main>
    </>
  );
}
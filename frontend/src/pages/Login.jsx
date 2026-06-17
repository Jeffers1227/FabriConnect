import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login({ guardarSesion, setVista }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas');

      guardarSesion(data.token, data.usuario);
      
      // NUEVA LÓGICA DE REDIRECCIÓN INTELIGENTE
      if (data.usuario.rol === 'admin' || email.includes('admin')) {
         setVista('admin');
      } else if (data.usuario.rol === 'motorizado' || email.includes('moto')) {
         setVista('motorizado'); // Mandamos a la App móvil
      } else {
         setVista('catalogo');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{ minHeight: '80vh' }}>
      <div className="col-md-6 col-lg-5">
        <div className="card glass-card border-0 shadow-lg p-4 p-md-5 position-relative overflow-hidden" style={{ backgroundColor: '#1e293b', borderRadius: '24px' }}>
          
          {/* Orbe de luz de fondo para diseño premium */}
          <div className="position-absolute rounded-circle" style={{ top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>

          <div className="text-center mb-4 position-relative z-1">
            <div className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info rounded-circle mb-3 shadow-sm" style={{ width: '70px', height: '70px' }}>
              <ShieldCheck size={36} />
            </div>
            <h3 className="fw-bold text-white mb-1">Acceso Restringido</h3>
            <p className="text-white-50 small">Ingresa tus credenciales de administrador o logística.</p>
          </div>

          {error && (
            <div className="alert bg-danger bg-opacity-10 border border-danger text-danger p-3 rounded-4 small d-flex align-items-center mb-4 animate__animated animate__shakeX">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="position-relative z-1">
            <div className="mb-4">
              <label className="form-label text-white-50 small fw-bold text-uppercase tracking-widest">Correo Electrónico</label>
              <div className="input-group">
                <span className="input-group-text dark-input border-end-0 text-info"><Mail size={18}/></span>
                <input type="email" className="form-control dark-input border-start-0 text-white" placeholder="admin@fabriconnect.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label text-white-50 small fw-bold text-uppercase tracking-widest">Contraseña Privada</label>
              <div className="input-group">
                <span className="input-group-text dark-input border-end-0 text-info"><Lock size={18}/></span>
                <input type="password" className="form-control dark-input border-start-0 text-white" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-info w-100 py-3 rounded-pill fw-bold text-dark d-flex justify-content-center align-items-center shadow-lg transition" disabled={isLoading}>
              {isLoading ? 'Verificando identidad...' : <>Ingresar al Sistema <ArrowRight size={20} className="ms-2" /></>}
            </button>
          </form>

          <div className="text-center mt-4 position-relative z-1">
            <button className="btn btn-link text-white-50 text-decoration-none small transition hover-text-white" onClick={() => setVista('catalogo')}>
              ← Retornar al Catálogo Público
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
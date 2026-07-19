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
      // Hacemos la petición real a tu base de datos en PostgreSQL
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        
        // ==========================================
        // LA MAGIA: FORZAMOS A GUARDAR EL CORREO
        // ==========================================
        // Si el backend es "ciego" y no manda el email o el ID, nosotros
        // le inyectamos a la fuerza el correo que el usuario acaba de escribir.
        const usuarioCorregido = {
          ...(data.usuario || {}),
          email: email 
        };

        // Pasamos el usuario corregido a la memoria de la aplicación
        guardarSesion(data.token, usuarioCorregido);

        // ==========================================
        // CORRECCIÓN DE REDIRECCIÓN INTELIGENTE
        // ==========================================
        const userRol = data.usuario?.rol ? data.usuario.rol.toLowerCase() : '';
        const userEmail = email.toLowerCase();

        // 1. Si es Administrador
        if (userRol === 'administrador' || userEmail.includes('admin')) {
          setVista('admin');
        } 
        // 2. Si es Motorizado
        else if (userRol === 'motorizado' || userEmail.includes('moto')) {
          setVista('motorizado');
        } 
        // 3. Fallback (Cualquier otro rol no definido)
        else {
          setVista('catalogo');
        }

      } else {
        setError(data.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Asegúrate de que el backend esté encendido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center animate__animated animate__fadeIn" style={{ minHeight: '80vh' }}>
      <div className="card glass-card border-0 shadow-lg p-4 p-md-5 position-relative overflow-hidden" style={{ backgroundColor: '#1e293b', borderRadius: '24px', maxWidth: '450px', width: '100%' }}>
        
        {/* Encabezado del Login */}
        <div className="text-center mb-4">
          <div className="bg-dark rounded-circle d-inline-flex justify-content-center align-items-center mb-3 shadow" style={{ width: '80px', height: '80px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={40} className="text-info" />
          </div>
          <h3 className="text-white fw-bold mb-1">Acceso Restringido</h3>
          <p className="text-white-50 small">Portal exclusivo para Administradores y Motorizados de FabriConnect.</p>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="alert alert-danger border-0 d-flex align-items-center rounded-4 small p-3 mb-4 animate__animated animate__headShake" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#ff6b6b' }}>
            <span className="fw-bold">{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          
          {/* Input Correo */}
          <div className="mb-4">
            <label className="text-white-50 small fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Correo Electrónico</label>
            <div className="input-group shadow-sm rounded-4 overflow-hidden">
              <span className="input-group-text border-0 text-white-50 px-3" style={{ backgroundColor: '#0f172a' }}><Mail size={18} /></span>
              <input 
                type="email" 
                className="form-control text-white border-0 py-3 shadow-none" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@fabriconnect.com"
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          </div>

          {/* Input Contraseña */}
          <div className="mb-5">
            <label className="text-white-50 small fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Contraseña Segura</label>
            <div className="input-group shadow-sm rounded-4 overflow-hidden">
              <span className="input-group-text border-0 text-white-50 px-3" style={{ backgroundColor: '#0f172a' }}><Lock size={18} /></span>
              <input 
                type="password" 
                className="form-control text-white border-0 py-3 shadow-none" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ backgroundColor: '#0f172a' }}
              />
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button 
            type="submit" 
            className="btn btn-info text-dark w-100 py-3 rounded-pill fw-bold d-flex justify-content-center align-items-center shadow-lg transition"
            disabled={isLoading}
            style={{ transform: isLoading ? 'scale(0.98)' : 'scale(1)' }}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <>Ingresar al Sistema <ArrowRight size={20} className="ms-2" /></>
            )}
          </button>

        </form>

        {/* Botón Volver */}
        <div className="text-center mt-4 pt-3 border-top border-secondary">
          <button className="btn btn-link text-white-50 text-decoration-none small transition" onClick={() => setVista('catalogo')}>
            ← Volver a la Tienda
          </button>
        </div>

      </div>
    </div>
  );
}
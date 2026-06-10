import React, { useState } from 'react';

export default function Login({ guardarSesion, setVista }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

      guardarSesion(data.token, data.usuario);
      setVista('catalogo');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow border-0 mt-5">
            <div className="card-body p-5">
              <h3 className="text-center fw-bold mb-4">Iniciar Sesión</h3>
              {error && <div className="alert alert-danger p-2 small">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Correo Electrónico</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold">Contraseña</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">Ingresar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
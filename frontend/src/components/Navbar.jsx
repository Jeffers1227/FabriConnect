import React from 'react';

export default function Navbar({ usuario, setVista, logout, cartCount }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)' }}>
      <div className="container">
        <a className="navbar-brand fw-bold fs-3 text-white" href="#" onClick={() => setVista('catalogo')}>
          Fabri<span style={{color: '#f97316'}}>Connect</span>
        </a>
        <div className="d-flex align-items-center">
            <button className="btn btn-outline-light btn-sm position-relative me-3 rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart">
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{cartCount}</span>}
            </button>
            
            {/* Botón temporal para entrar rápido al Panel Admin */}
            <button className="btn btn-outline-info btn-sm me-3 fw-bold" onClick={() => setVista('admin')}>
              Panel Admin
            </button>

            {usuario ? (
                <div className="dropdown">
                    <button className="btn btn-outline-light dropdown-toggle rounded-pill" data-bs-toggle="dropdown">
                        {usuario.nombre}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" style={{background: '#1e293b'}}>
                        <li><button className="dropdown-item text-white" onClick={logout}>Cerrar Sesión</button></li>
                    </ul>
                </div>
            ) : (
                <button className="btn btn-premium" onClick={() => setVista('login')}>Ingresar</button>
            )}
        </div>
      </div>
    </nav>
  );
}
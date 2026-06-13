import React from 'react';

export default function Navbar({ usuario, setVista, logout }) {
  return (
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm mb-4">
      <div class="container">
        <a class="navbar-brand fw-bold" href="#" onClick={() => setVista('catalogo')}>
          <i class="bi bi-cpu-fill me-2"></i>FabriConnect
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" href="#" onClick={() => setVista('catalogo')}>Catálogo Técnico</a>
            </li>
            {usuario && (
              <li class="nav-item">
                <a class="nav-link" href="#" onClick={() => setVista('cad')}>Solicitar Fabricación</a>
              </li>
            )}
          </ul>
          <div class="d-flex align-items-center">
            {usuario ? (
              <div class="dropdown">
                <button class="btn btn-light dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-person-circle me-1"></i> {usuario.nombre} ({usuario.rol})
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><button class="dropdown-item" onClick={logout}>Cerrar Sesión</button></li>
                </ul>
              </div>
            ) : (
              <button class="btn btn-outline-light btn-sm" onClick={() => setVista('login')}>
                <i class="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
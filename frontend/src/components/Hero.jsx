import React from 'react';
import { Zap, ArrowRight, Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <div className="container-fluid py-5 text-center position-relative overflow-hidden" 
         style={{ background: '#090E17', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      
      {/* Efectos de luces estilo SaaS (Orbes difuminados) */}
      <div className="position-absolute rounded-circle" style={{ top: '-20%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
      <div className="position-absolute rounded-circle" style={{ bottom: '-20%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>

      <div className="container py-5 position-relative z-1">
        {/* Insignia superior */}
        <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Zap size={16} className="text-warning" />
          <span className="text-white-50 small fw-bold tracking-widest text-uppercase">Plataforma de Manufactura 4.0</span>
        </div>

        <h1 className="display-2 fw-bold text-white mb-4 lh-1">
          Fabri<span style={{ color: '#f97316' }}>Connect</span>
        </h1>
        <p className="lead text-white-50 mx-auto mb-5 fs-4" style={{ maxWidth: '700px' }}>
          El futuro de la manufactura digital. Compra componentes de alta precisión o solicita fabricación a medida impulsada por IA.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <a href="#catalogo" className="btn btn-premium btn-lg rounded-pill px-5 shadow-lg d-flex align-items-center gap-2">
            Explorar Inventario <ArrowRight size={20} />
          </a>
          <a href="#cad-upload" className="btn btn-outline-light btn-lg rounded-pill px-5 d-flex align-items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <Cpu size={20} className="text-info" /> Subir CAD
          </a>
        </div>
      </div>
    </div>
  );
}
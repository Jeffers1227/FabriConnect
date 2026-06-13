import React from 'react';

export default function Hero() {
  return (
    <div className="container-fluid py-5 text-center position-relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div className="container py-5">
        <h1 className="display-1 fw-bold text-white mb-3">Fabri<span style={{color: '#f97316'}}>Connect</span></h1>
        <p className="lead text-white-50 mb-5 fs-4">El futuro de la manufactura digital en tus manos.</p>
        <button className="btn btn-premium btn-lg">Comenzar Fabricación</button>
      </div>
      {/* Círculos decorativos de fondo para movimiento visual */}
      <div className="position-absolute" style={{top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, #f9731633 0%, transparent 70%)', filter: 'blur(50px)'}}></div>
    </div>
  );
}
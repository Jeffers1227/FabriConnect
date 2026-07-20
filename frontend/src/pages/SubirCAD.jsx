import React, { useState } from 'react';
import { Box, UploadCloud, Settings, Send, User, Mail, CreditCard, Ruler, Droplet, Layers } from 'lucide-react';

export default function SubirCAD({ setVista }) {
  const [isUploading, setIsUploading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '', email: '', dni: '', material: 'PLA Premium', infill: '20%', color: '', medidas: '', comentarios: ''
  });

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setArchivo(file);
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    if (!archivo) return alert("Por favor, sube tu archivo 3D (.stl, .obj, etc.)");

    setIsUploading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('archivo_cad', archivo); // El archivo físico

      const res = await fetch('http://localhost:3000/api/cad', {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        alert("🎉 ¡Diseño enviado a FabriConnect! Un ingeniero revisará el archivo y te enviaremos la cotización a tu correo.");
        setVista('catalogo');
      } else {
        alert("Ocurrió un error al enviar el diseño.");
      }
    } catch (error) {
      console.error(error);
      alert("Error conectando con el servidor de manufactura.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-5 mt-5 animate__animated animate__fadeIn">
      <button className="btn btn-link text-info text-decoration-none mb-4 p-0 fw-bold" onClick={() => setVista('catalogo')}>
        ← Volver al Catálogo
      </button>

      <div className="text-center mb-5">
        <Box size={50} className="text-info mb-3" />
        <h2 className="fw-bold text-white display-5">Manufactura 3D a Medida</h2>
        <p className="text-white-50 fs-5">Sube tu diseño y nosotros lo fabricamos con la mejor precisión del mercado.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <form onSubmit={enviarSolicitud} className="card glass-card p-4 p-md-5 border-0 shadow-lg" style={{ backgroundColor: '#1e293b', borderRadius: '24px' }}>
            
            {/* SECCIÓN 1: DATOS PERSONALES */}
            <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex align-items-center">
              <User className="me-2 text-info" /> 1. Datos de Contacto
            </h5>
            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <label className="text-white-50 small fw-bold">Nombre Completo *</label>
                <div className="input-group">
                  <span className="input-group-text dark-input border-0"><User size={16}/></span>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-control dark-input border-0 text-white" required />
                </div>
              </div>
              <div className="col-md-4">
                <label className="text-white-50 small fw-bold">Correo (Para enviar cotización) *</label>
                <div className="input-group">
                  <span className="input-group-text dark-input border-0"><Mail size={16}/></span>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-control dark-input border-0 text-white" required />
                </div>
              </div>
              <div className="col-md-4">
                <label className="text-white-50 small fw-bold">DNI / RUC *</label>
                <div className="input-group">
                  <span className="input-group-text dark-input border-0"><CreditCard size={16}/></span>
                  <input type="text" name="dni" value={formData.dni} onChange={handleInputChange} className="form-control dark-input border-0 text-white" required />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: PARÁMETROS TÉCNICOS */}
            <h5 className="text-white fw-bold mb-4 border-bottom border-secondary pb-3 d-flex align-items-center">
              <Settings className="me-2 text-info" /> 2. Especificaciones de Ingeniería
            </h5>
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <label className="text-white-50 small fw-bold"><Layers size={14} className="me-1"/> Material</label>
                <select name="material" value={formData.material} onChange={handleInputChange} className="form-select dark-input border-0 text-white">
                  <option>PLA Premium</option>
                  <option>ABS Industrial</option>
                  <option>PETG (Alta Resistencia)</option>
                  <option>TPU (Flexible)</option>
                  <option>Resina (Alta Definición)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="text-white-50 small fw-bold">Relleno (Infill)</label>
                <select name="infill" value={formData.infill} onChange={handleInputChange} className="form-select dark-input border-0 text-white">
                  <option>20% (Uso Decorativo)</option>
                  <option>50% (Uso Mecánico Ligero)</option>
                  <option>100% (Sólido / Industrial)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="text-white-50 small fw-bold"><Droplet size={14} className="me-1"/> Color preferido</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange} placeholder="Ej. Negro Mate" className="form-control dark-input border-0 text-white" required />
              </div>
              <div className="col-md-3">
                <label className="text-white-50 small fw-bold"><Ruler size={14} className="me-1"/> Medidas aprox (cm)</label>
                <input type="text" name="medidas" value={formData.medidas} onChange={handleInputChange} placeholder="Ej. 15 x 10 x 5 cm" className="form-control dark-input border-0 text-white" />
              </div>
              <div className="col-12">
                <label className="text-white-50 small fw-bold">Instrucciones Adicionales</label>
                <textarea name="comentarios" value={formData.comentarios} onChange={handleInputChange} rows="3" placeholder="Describe si la pieza necesita soportes especiales, pulido, o algún ensamble..." className="form-control dark-input border-0 text-white"></textarea>
              </div>
            </div>

            {/* SECCIÓN 3: CARGA DE ARCHIVO */}
            <div className="bg-dark rounded-4 p-5 text-center border border-info border-2 border-dashed mb-5 position-relative">
              <UploadCloud size={48} className="text-info mb-3" />
              <h5 className="text-white fw-bold">Sube tu Modelo 3D</h5>
              <p className="text-white-50 small mb-4">Formatos compatibles: .STL, .OBJ, .STEP, .GLB (Máx 50MB)</p>
              
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept=".stl,.obj,.step,.stp,.glb,.zip"
                className="form-control mx-auto dark-input text-white" 
                style={{ maxWidth: '350px' }}
                required 
              />
              {archivo && <p className="text-success fw-bold mt-3 mb-0">✓ Archivo cargado: {archivo.name}</p>}
            </div>

            <button 
              type="submit" 
              className="btn btn-info text-dark w-100 py-3 rounded-pill fw-bold fs-5 shadow-lg d-flex justify-content-center align-items-center transition hover-scale"
              disabled={isUploading}
            >
              {isUploading ? (
                <>Subiendo a la nube de FabriConnect <span className="spinner-border spinner-border-sm ms-3"></span></>
              ) : (
                <><Send size={20} className="me-2" /> Solicitar Cotización de Fabricación</>
              )}
            </button>
            <p className="text-center text-white-50 small mt-3 mb-0">Tu archivo será protegido bajo acuerdos de confidencialidad (NDA).</p>
          </form>
        </div>
      </div>
    </div>
  );
}
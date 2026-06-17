import React, { useState } from 'react';
import { UploadCloud, CheckCircle, FileBox, Settings, Loader } from 'lucide-react';

export default function CadUpload({ token }) {
  const [file, setFile] = useState(null);
  const [material, setMaterial] = useState('PLA');
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setRespuesta(null);

    const formData = new FormData();
    formData.append('archivoCad', file);
    formData.append('material', material);

    try {
      const res = await fetch('http://localhost:3000/api/cad/solicitar-fabricacion', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setRespuesta(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="cad-upload" className="card glass-card border-0 shadow-lg p-0 overflow-hidden" style={{ backgroundColor: '#1e293b', borderRadius: '24px' }}>
      <div className="card-header border-0 bg-dark p-4 d-flex align-items-center gap-3">
        <div className="bg-info bg-opacity-10 p-2 rounded-3 text-info">
          <FileBox size={28} />
        </div>
        <div>
          <h4 className="fw-bold text-white mb-0">Solicitud de Fabricación</h4>
          <p className="text-white-50 small mb-0">Sube tus archivos STL, STEP o DXF para validación geométrica automática.</p>
        </div>
      </div>

      <div className="card-body p-4 p-md-5">
        <form onSubmit={handleUpload}>
          <div className="row g-4">
            <div className="col-md-6">
              {/* Zona de Subida de Archivos Estilizada */}
              <label className="form-label text-white-50 fw-bold text-uppercase small tracking-widest mb-3">Archivo Geométrico</label>
              <div className="position-relative d-flex flex-column align-items-center justify-content-center p-5 rounded-4 text-center transition"
                   style={{ border: '2px dashed rgba(6,182,212,0.4)', backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                <UploadCloud size={48} className="text-info mb-3" />
                <span className="text-white fw-bold mb-1">{file ? file.name : "Selecciona tu archivo CAD"}</span>
                <span className="text-white-50 small">{file ? "Archivo listo para envío" : "Haz clic aquí o arrastra (Máx. 50MB)"}</span>
                <input type="file" className="position-absolute w-100 h-100 opacity-0 top-0 start-0" style={{ cursor: 'pointer' }} onChange={(e) => setFile(e.target.files[0])} required />
              </div>
            </div>

            <div className="col-md-6 d-flex flex-column">
              <div className="mb-4">
                <label className="form-label text-white-50 fw-bold text-uppercase small tracking-widest mb-3"><Settings size={14} className="me-2"/> Material de Impresión/Corte</label>
                <select className="form-select dark-input fw-bold text-white shadow-sm" value={material} onChange={(e) => setMaterial(e.target.value)} style={{ height: '60px' }}>
                  <option value="PLA">Plástico PLA de Alta Precisión</option>
                  <option value="ABS">Plástico ABS (Uso Industrial)</option>
                  <option value="Aluminio 6061">Aluminio 6061 (Mecanizado CNC)</option>
                  <option value="Acero Inoxidable">Acero Inoxidable (Corte Láser)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-info text-dark w-100 fw-bold rounded-4 shadow-lg fs-5 mt-auto transition" disabled={loading} style={{ height: '60px' }}>
                {loading ? <><Loader className="spin me-2" size={20} /> Procesando Geometría...</> : 'Solicitar Cotización Técnica'}
              </button>
            </div>
          </div>
        </form>

        {respuesta && (
          <div className="mt-4 p-4 rounded-4 bg-dark border border-success animate__animated animate__fadeInUp">
            <h5 className="fw-bold text-success mb-3 d-flex align-items-center"><CheckCircle className="me-2" size={24}/> {respuesta.mensaje}</h5>
            <div className="row text-white-50 small">
              <div className="col-md-4"><strong className="text-white">ID de Trabajo:</strong> {respuesta.jobId}</div>
              <div className="col-md-4"><strong className="text-white">Estado:</strong> <span className="badge bg-warning text-dark ms-2">{respuesta.estadoActual}</span></div>
              <div className="col-md-4 text-truncate"><strong className="text-white">Ruta Cloud:</strong> {respuesta.urlArchivoGuardado}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
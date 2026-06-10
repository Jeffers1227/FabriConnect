import React, { useState } from 'react';

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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow border-0 p-4">
            <h4 className="card-title fw-bold text-dark mb-3">Solicitud de Fabricación a Medida</h4>
            <p className="text-muted small">Sube tus archivos de diseño (STL, STEP, DXF) para validación geométrica automática con IA.</p>
            <form onSubmit={handleUpload}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Seleccionar Archivo CAD</label>
                <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} required />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold">Material de Fabricación</label>
                <select className="form-select" value={material} onChange={(e) => setMaterial(e.target.value)}>
                  <option value="PLA">Plástico PLA (Impresión 3D)</option>
                  <option value="ABS">Plástico ABS resistente (Impresión 3D)</option>
                  <option value="Aluminio 6061">Aluminio 6061 (Mecanizado CNC)</option>
                  <option value="Acero Inoxidable">Acero Inoxidable (Corte Láser)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-success w-100 fw-bold" disabled={loading}>
                {loading ? 'Subiendo y encolando en Redis...' : 'Enviar a Procesamiento Técnico'}
              </button>
            </form>

            {respuesta && (
              <div className="card mt-4 bg-light border-0 shadow-sm animate__animated animate__fadeIn">
                <div className="card-body">
                  <h6 className="fw-bold text-success"><i className="bi bi-check-circle-fill me-2"></i> {respuesta.mensaje}</h6>
                  <hr/>
                  <p className="mb-1 small"><strong>ID de Trabajo (Redis):</strong> {respuesta.jobId}</p>
                  <p className="mb-1 small"><strong>Estado del Sistema:</strong> <span className="badge bg-warning text-dark">{respuesta.estadoActual}</span></p>
                  <p className="mb-0 small text-truncate"><strong>Ubicación de Archivo:</strong> <a href="#" className="text-decoration-none">{respuesta.urlArchivoGuardado}</a></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
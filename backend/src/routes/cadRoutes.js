const express = require('express');
const router = express.Router();
const cadQueue = require('../workers/cadWorker');
const { verifyToken } = require('../middlewares/authMiddleware');
const { upload, subirArchivo } = require('../services/storageService');

// Ruta protegida: Procesa el archivo adjunto bajo la clave "archivoCad"
router.post('/solicitar-fabricacion', verifyToken, upload.single('archivoCad'), async (req, res) => {
    try {
        // Verificar que el usuario realmente haya adjuntado un archivo
        if (!req.file) {
            return res.status(400).json({ error: 'Por favor, adjunta un archivo geométrico (CAD)' });
        }

        const { material } = req.body;
        if (!material) {
            return res.status(400).json({ error: 'Debe especificar el material para la fabricación' });
        }

        // 1. Subir el archivo de manera segura a S3 (o almacenamiento local de respaldo)
        console.log(`Subiendo archivo: ${req.file.originalname}...`);
        const urlArchivo = await subirArchivo(req.file, 'archivos-cad');

        // 2. Añadir los datos reales y la URL del archivo a la cola asíncrona de Bull
        const trabajo = await cadQueue.add({
            usuario: req.user.email,
            nombreOriginal: req.file.originalname,
            urlAlmacenamiento: urlArchivo,
            material: material,
            pesoBytes: req.file.size
        });

        res.status(202).json({ 
            mensaje: 'Archivo recibido y almacenado con éxito. Procesando geometría con IA...',
            jobId: trabajo.id,
            urlArchivoGuardado: urlArchivo,
            estadoActual: 'En cola de validación técnica'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud de fabricación' });
    }
});

module.exports = router;
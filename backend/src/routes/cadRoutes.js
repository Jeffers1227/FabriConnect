const express = require('express');
const router = express.Router();
const cadQueue = require('../workers/cadWorker');
const { verifyToken } = require('../middlewares/authMiddleware');

// Ruta protegida: Solo usuarios con sesión iniciada pueden solicitar fabricación
router.post('/solicitar-fabricacion', verifyToken, async (req, res) => {
    const { nombreArchivo, material } = req.body;
    
    // Añadimos el trabajo a la cola asíncrona de Bull
    const trabajo = await cadQueue.add({
        usuario: req.user.email,
        nombreArchivo,
        material
    });

    res.status(202).json({ 
        mensaje: 'Tu archivo ha sido enviado a la cola de procesamiento.',
        jobId: trabajo.id,
        estadoActual: 'En cola'
    });
});

module.exports = router;
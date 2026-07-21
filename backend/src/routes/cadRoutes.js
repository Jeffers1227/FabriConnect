const express = require('express');
const router = express.Router();
const multer = require('multer');
const cadController = require('../controllers/cadController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('archivo_cad'), cadController.crearSolicitudCAD);
router.get('/', cadController.obtenerSolicitudes);
router.put('/:id/cotizar', cadController.cotizarSolicitud);

// NUEVAS RUTAS
router.get('/cliente/:dni', cadController.obtenerPorDni);
router.post('/:id/pagar', upload.single('comprobante'), cadController.pagarCotizacion);

module.exports = router;
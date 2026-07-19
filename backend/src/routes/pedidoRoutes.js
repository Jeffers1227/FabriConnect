const express = require('express');
const router = express.Router();
const multer = require('multer');
const pedidoController = require('../controllers/pedidoController');

// Multer captura el archivo del Frontend y lo guarda temporalmente en la Memoria RAM
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', pedidoController.obtenerPedidos);
router.put('/:id/estado', pedidoController.actualizarEstado);

// Usamos upload.single('comprobante') porque así llamamos a la foto en React (Checkout.jsx)
router.post('/', upload.single('comprobante'), pedidoController.crearPedido);

module.exports = router;
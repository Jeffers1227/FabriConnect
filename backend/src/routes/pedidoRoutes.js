const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.obtenerPedidos);
router.put('/:id/estado', pedidoController.actualizarEstado);
// NUEVA RUTA PARA CREAR PEDIDOS
router.post('/', pedidoController.crearPedido);

module.exports = router;
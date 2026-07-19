const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Solo verifyToken para permitir al Admin

// Ruta pública: Cualquiera puede ver el catálogo
router.get('/', productoController.obtenerProductos);

// Rutas protegidas: Requieren Token válido
router.post('/', verifyToken, productoController.crearProducto);
router.put('/:id', verifyToken, productoController.actualizarProducto);
router.delete('/:id', verifyToken, productoController.eliminarProducto);

module.exports = router;
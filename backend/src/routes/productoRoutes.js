const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Ruta pública: Cualquiera puede ver el catálogo
router.get('/', productoController.obtenerProductos);

// Ruta protegida: Solo usuarios con token válido y con rol 'proveedor' pueden añadir productos
router.post('/', verifyToken, verifyRole('proveedor'), productoController.crearProducto);

module.exports = router;
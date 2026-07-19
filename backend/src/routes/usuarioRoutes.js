const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Todas estas rutas están protegidas y solo pueden ser usadas si envían un Token válido
router.get('/motorizados', verifyToken, usuarioController.obtenerMotorizados);
router.post('/motorizados', verifyToken, usuarioController.crearMotorizado);
router.put('/motorizados/:id', verifyToken, usuarioController.actualizarMotorizado);
router.delete('/motorizados/:id', verifyToken, usuarioController.eliminarMotorizado);

module.exports = router;
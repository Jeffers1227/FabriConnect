const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // Obtenemos el token del header de la petición
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Un token es requerido para la autenticación' });
    }

    try {
        // Formato esperado: "Bearer <token>"
        const tokenLimpio = token.split(" ")[1];
        const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);
        req.user = decoded; // Guardamos los datos del usuario en la request
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    return next();
};

// Middleware para verificar roles (ej. solo administradores o proveedores)
const verifyRole = (role) => {
    return (req, res, next) => {
        if (req.user.rol !== role) {
            return res.status(403).json({ error: `Acceso denegado. Se requiere rol: ${role}` });
        }
        next();
    };
};

module.exports = { verifyToken, verifyRole };
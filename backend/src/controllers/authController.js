const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Base de datos en memoria (Solo para esta prueba. Luego se cambiará a PostgreSQL)
const usersDB = [];

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // Validamos que el usuario no exista
        const existe = usersDB.find(u => u.email === email);
        if (existe) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Encriptamos la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creamos el usuario (rol puede ser 'comprador' o 'proveedor')
        const nuevoUsuario = {
            id: usersDB.length + 1,
            nombre,
            email,
            password: hashedPassword,
            rol: rol || 'comprador' 
        };

        usersDB.push(nuevoUsuario);
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: nuevoUsuario.id });

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscamos el usuario
        const usuario = usersDB.find(u => u.email === email);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificamos contraseña
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generamos el JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ mensaje: 'Login exitoso', token });

    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

module.exports = { registrarUsuario, loginUsuario };
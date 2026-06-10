const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Importamos la conexión real a Postgres
require('dotenv').config();

const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        // 1. Verificar si el email ya existe en la base de datos
        const existeUser = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (existeUser.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // 2. Encriptar la contraseña de forma segura
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insertar el nuevo usuario en PostgreSQL
        const queryText = `
            INSERT INTO usuarios (nombre, email, password, rol)
            VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol;
        `;
        const valores = [nombre, email, hashedPassword, rol || 'comprador'];
        
        const { rows } = await db.query(queryText, valores);

        res.status(201).json({ 
            mensaje: 'Usuario registrado exitosamente en PostgreSQL', 
            usuario: rows[0] 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al registrar el usuario' });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar al usuario por su email en la base de datos
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const usuario = rows[0];

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // 2. Comparar la contraseña ingresada con el hash guardado
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if (!passwordValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // 3. Generar el Token JWT con la información del usuario de la BD
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            mensaje: 'Login exitoso', 
            token,
            usuario: { nombre: usuario.nombre, rol: usuario.rol }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al iniciar sesión' });
    }
};

module.exports = { registrarUsuario, loginUsuario };
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Obtener todos los motorizados
const obtenerMotorizados = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT id, nombre, email, rol, fecha_creacion FROM usuarios WHERE rol = 'motorizado' ORDER BY id DESC");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener motorizados' });
    }
};

// Crear nuevo motorizado
const crearMotorizado = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const hashedPwd = await bcrypt.hash(password, 10); // Encriptamos la contraseña
        
        const { rows } = await db.query(
            "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, 'motorizado') RETURNING id, nombre, email, rol",
            [nombre, email, hashedPwd]
        );
        res.status(201).json({ mensaje: 'Motorizado creado', usuario: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear motorizado (Verifica que el correo no esté repetido)' });
    }
};

// Actualizar motorizado
const actualizarMotorizado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password } = req.body;
        let query, params;

        if (password && password.trim() !== '') {
            // Si el admin escribió una nueva contraseña, la encriptamos y la guardamos
            const hashedPwd = await bcrypt.hash(password, 10);
            query = "UPDATE usuarios SET nombre = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, nombre, email";
            params = [nombre, email, hashedPwd, id];
        } else {
            // Si dejó la contraseña en blanco, solo actualizamos nombre y correo
            query = "UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email";
            params = [nombre, email, id];
        }

        const { rows } = await db.query(query, params);
        res.json({ mensaje: 'Motorizado actualizado', usuario: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar motorizado' });
    }
};

// Eliminar motorizado
const eliminarMotorizado = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM usuarios WHERE id = $1", [id]);
        res.json({ mensaje: 'Motorizado eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar motorizado' });
    }
};

module.exports = { obtenerMotorizados, crearMotorizado, actualizarMotorizado, eliminarMotorizado };
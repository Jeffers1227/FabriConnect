const db = require('../config/db');

// Obtener todos los pedidos para la tabla del administrador
const obtenerPedidos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pedidos ORDER BY fecha_creacion DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Cambiar el estado del pedido (Ej: de "Pendiente" a "En Ruta")
const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const result = await db.query(
            'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        res.json({ mensaje: 'Estado actualizado', pedido: result.rows[0] });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// NUEVO: Crear un pedido desde el Checkout
const crearPedido = async (req, res) => {
    try {
        const { cliente_nombre, total, metodo_pago, direccion } = req.body;
        const result = await db.query(
            `INSERT INTO pedidos (cliente_nombre, total, metodo_pago, direccion, estado) 
             VALUES ($1, $2, $3, $4, 'Pendiente') RETURNING *`,
            [cliente_nombre, total, metodo_pago, direccion]
        );
        res.status(201).json({ mensaje: 'Pedido creado con éxito', pedido: result.rows[0] });
    } catch (error) {
        console.error("Error al crear pedido:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerPedidos, actualizarEstado, crearPedido };
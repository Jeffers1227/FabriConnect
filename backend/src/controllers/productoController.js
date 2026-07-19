const db = require('../config/db');

// Obtener todos los productos (READ)
const obtenerProductos = async (req, res) => {
    try {
        const { buscar } = req.query;
        let queryText = 'SELECT * FROM productos';
        let queryParams = [];

        if (buscar) {
            queryText += ' WHERE nombre ILIKE $1 OR descripcion ILIKE $1';
            queryParams.push(`%${buscar}%`);
        }

        queryText += ' ORDER BY id DESC';

        const { rows } = await db.query(queryText, queryParams);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

// Crear Producto (CREATE)
const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, proveedor, imagen_url } = req.body;
        const queryText = `
            INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, imagen_url)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const queryParams = [nombre, descripcion, precio, stock, proveedor, imagen_url];
        
        const { rows } = await db.query(queryText, queryParams);
        res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

// Actualizar Producto (UPDATE)
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock, proveedor, imagen_url } = req.body;
        const queryText = `
            UPDATE productos 
            SET nombre = $1, descripcion = $2, precio = $3, stock = $4, proveedor = $5, imagen_url = $6
            WHERE id = $7 RETURNING *;
        `;
        const queryParams = [nombre, descripcion, precio, stock, proveedor, imagen_url, id];
        
        const { rows } = await db.query(queryText, queryParams);
        res.json({ mensaje: 'Producto actualizado', producto: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

// Eliminar Producto (DELETE)
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };
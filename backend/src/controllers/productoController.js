const db = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        const { buscar } = req.query;
        let queryText = 'SELECT * FROM productos';
        let queryParams = [];

        if (buscar) {
            queryText += ' WHERE nombre ILIKE $1 OR descripcion ILIKE $1';
            queryParams.push(`%${buscar}%`);
        }

        queryText += ' ORDER BY id ASC';

        const { rows } = await db.query(queryText, queryParams);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, proveedor, especificaciones } = req.body;

        const queryText = `
            INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, especificaciones)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const queryParams = [nombre, descripcion, precio, stock, proveedor, especificaciones];

        const { rows } = await db.query(queryText, queryParams);
        res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
};

module.exports = { obtenerProductos, crearProducto };
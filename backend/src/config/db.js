const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('🔗 Conectado a la base de datos PostgreSQL');
});

const initDB = async () => {
    // Query para crear la tabla de usuarios según los roles de tu informe
    const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'comprador', -- comprador, proveedor, administrador
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createProductosTable = `
        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10, 2) NOT NULL,
            stock INT DEFAULT 0,
            proveedor VARCHAR(255),
            especificaciones JSONB,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // 1. Crear tabla de usuarios
        await pool.query(createUsuariosTable);
        console.log('✅ Tabla "usuarios" verificada/creada correctamente.');

        // 2. Crear tabla de productos
        await pool.query(createProductosTable);
        console.log('✅ Tabla "productos" verificada/creada correctamente.');

        // 3. Insertar producto semilla si la tabla está vacía
        const resultadoProductos = await pool.query('SELECT COUNT(*) FROM productos');
        if (parseInt(resultadoProductos.rows[0].count) === 0) {
            const insertSeedQuery = `
                INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, especificaciones)
                VALUES (
                    'Microcontrolador XYZ-123', 
                    'Placa de desarrollo para prototipado rápido.', 
                    45.50, 
                    150, 
                    'ElectroTech',
                    '{"voltaje": "5V", "pines_digitales": 14, "protocolos": ["I2C", "SPI", "UART"]}'
                );
            `;
            await pool.query(insertSeedQuery);
            console.log('🌱 Producto semilla insertado con éxito.');
        }

    } catch (err) {
        console.error('❌ Error al inicializar las tablas de la base de datos:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};
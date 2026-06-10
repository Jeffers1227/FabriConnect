const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('🔗 Conectado a la base de datos PostgreSQL');
});

// Función automática para inicializar tablas y semillas
const initDB = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10, 2) NOT NULL,
            stock INT DEFAULT 0,
            proveedor VARCHAR(255),
            especificaciones JSONB, -- Soporte nativo JSONB para mecatrónica
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        // 1. Intentar crear la tabla si no existe
        await pool.query(createTableQuery);
        console.log('✅ Tabla "productos" verificada/creada correctamente en PostgreSQL.');

        // 2. Verificar si está vacía para insertar el producto semilla
        const resultadoVeces = await pool.query('SELECT COUNT(*) FROM productos');
        const cantidad = parseInt(resultadoVeces.rows[0].count);

        if (cantidad === 0) {
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
            console.log('🌱 Base de datos vacía: Producto semilla insertado con éxito.');
        }

    } catch (err) {
        console.error('❌ Error crítico al inicializar la base de datos:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};
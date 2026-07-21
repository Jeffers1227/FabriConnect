const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('🔗 Conectado a la base de datos PostgreSQL');
});

const initDB = async () => {
    const createUsuariosTable = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            rol VARCHAR(50) DEFAULT 'comprador',
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

    const createPedidosTable = `
        CREATE TABLE IF NOT EXISTS pedidos (
            id SERIAL PRIMARY KEY,
            cliente_nombre VARCHAR(255) NOT NULL,
            total DECIMAL(10, 2) NOT NULL,
            metodo_pago VARCHAR(50),
            estado VARCHAR(50) DEFAULT 'Pendiente',
            direccion TEXT,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // ==========================================
    // NUEVA TABLA: SOLICITUDES CAD / IMPRESIÓN 3D
    // ==========================================
    const createSolicitudesTable = `
        CREATE TABLE IF NOT EXISTS solicitudes_cad (
            id SERIAL PRIMARY KEY,
            cliente_nombre VARCHAR(255) NOT NULL,
            cliente_email VARCHAR(255) NOT NULL,
            cliente_dni VARCHAR(20) NOT NULL,
            material VARCHAR(50),
            infill VARCHAR(50),
            color VARCHAR(50),
            medidas VARCHAR(100),
            comentarios TEXT,
            archivo_url TEXT NOT NULL,
            estado VARCHAR(50) DEFAULT 'Pendiente de Revisión',
            precio_cotizado DECIMAL(10, 2) DEFAULT 0.00,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createUsuariosTable);
        console.log('✅ Tabla "usuarios" verificada/creada.');

        await pool.query(createProductosTable);
        console.log('✅ Tabla "productos" verificada/creada.');

        await pool.query(createPedidosTable);
        console.log('✅ Tabla "pedidos" verificada/creada.');

        await pool.query(createSolicitudesTable);
        console.log('✅ Tabla "solicitudes_cad" verificada/creada.');

        // Modificaciones a tablas existentes
        try { await pool.query('ALTER TABLE productos ADD COLUMN imagen_url TEXT;'); } catch (e) {}
        try { await pool.query('ALTER TABLE pedidos ADD COLUMN motorizado_id INT;'); } catch (e) {}
        try { await pool.query('ALTER TABLE pedidos ADD COLUMN comprobante_url TEXT;'); } catch (e) {}

        // Inserción de Productos Semilla...
        const resultadoProductos = await pool.query('SELECT COUNT(*) FROM productos');
        if (parseInt(resultadoProductos.rows[0].count) === 0) {
            const insertSeedQuery = `
                INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, especificaciones) VALUES
                ('Raspberry Pi 4 Model B 4GB', 'Microcomputadora ideal para proyectos robóticos.', 285.00, 30, 'TechPorts Inc.', '{"procesador": "Broadcom BCM2711"}'),
                ('Sensor Ultrasónico HC-SR04', 'Sensor de distancia por ultrasonido.', 9.50, 500, 'SensorCorp', '{"rango_medicion": "2cm - 400cm"}'),
                ('Motor Paso a Paso NEMA 17', 'Motor paso a paso bipolar.', 48.00, 120, 'ElectroTech', '{"torque": "4.2 kg-cm"}'),
                ('Filamento PLA Premium', 'Rollo de 1kg para impresión 3D.', 65.00, 80, '3D Maker Peru', '{"material": "PLA"}')
            `;
            await pool.query(insertSeedQuery);
        }

        // Motorizado Automático
        const resMoto = await pool.query("SELECT * FROM usuarios WHERE email = 'moto@fabriconnect.com'");
        if (resMoto.rows.length === 0) {
            const hashedPwd = await bcrypt.hash('123456', 10);
            await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)`,
                ['Carlos Repartidor', 'moto@fabriconnect.com', hashedPwd, 'motorizado']
            );
        }

        // Admin Automático
        const resAdmin = await pool.query("SELECT * FROM usuarios WHERE email = 'admin@fabriconnect.com'");
        if (resAdmin.rows.length === 0) {
            const hashedAdminPwd = await bcrypt.hash('123456', 10);
            await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)`,
                ['Administrador Principal', 'admin@fabriconnect.com', hashedAdminPwd, 'administrador']
            );
        }

    } catch (err) {
        console.error('❌ Error al inicializar la base de datos:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};
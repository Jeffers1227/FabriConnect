const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // <-- NUEVO: Importamos bcrypt para cifrar la clave
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

    try {
        await pool.query(createUsuariosTable);
        console.log('✅ Tabla "usuarios" verificada/creada correctamente.');

        await pool.query(createProductosTable);
        console.log('✅ Tabla "productos" verificada/creada correctamente.');

        await pool.query(createPedidosTable);
        console.log('✅ Tabla "pedidos" verificada/creada correctamente.');

        // 1. INSERCIÓN DE PRODUCTOS SEMILLA
        const resultadoProductos = await pool.query('SELECT COUNT(*) FROM productos');
        if (parseInt(resultadoProductos.rows[0].count) === 0) {
            const insertSeedQuery = `
                INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, especificaciones) VALUES
                ('Raspberry Pi 4 Model B 4GB', 'Microcomputadora de placa reducida ideal para proyectos de robótica avanzada.', 285.00, 30, 'TechPorts Inc.', '{"procesador": "Broadcom BCM2711", "RAM": "4GB LPDDR4"}'),
                ('Sensor Ultrasónico HC-SR04', 'Sensor de distancia por ultrasonido, compatible con Arduino.', 9.50, 500, 'SensorCorp', '{"rango_medicion": "2cm - 400cm"}'),
                ('Motor Paso a Paso NEMA 17', 'Motor paso a paso bipolar de alta precisión para impresoras 3D.', 48.00, 120, 'ElectroTech', '{"torque": "4.2 kg-cm"}'),
                ('Servomotor Micro SG90', 'Micro servomotor de 9g para pequeños mecanismos.', 12.00, 300, 'MecaParts', '{"torque": "1.8 kg-cm"}'),
                ('Módulo Bluetooth HC-05', 'Módulo Bluetooth maestro/esclavo para comunicación inalámbrica.', 18.50, 200, 'Wireless Solutions', '{"alcance": "10 metros"}'),
                ('Driver de Motor L298N', 'Controlador dual para motores DC y paso a paso.', 15.00, 150, 'TechPorts Inc.', '{"corriente_max": "2A"}'),
                ('Filamento PLA Premium', 'Rollo de 1kg de ácido poliláctico para impresión 3D.', 65.00, 80, '3D Maker Peru', '{"material": "PLA"}'),
                ('Perfil de Aluminio V-Slot', 'Perfil estructural anodizado para chasis CNC.', 25.00, 250, 'MecaParts', '{"longitud": "1000mm"}');
            `;
            await pool.query(insertSeedQuery);
            console.log('🌱 Catálogo inicial insertado con éxito.');
        }

        // 2. INSERCIÓN DE PEDIDOS DE PRUEBA
        const resPed = await pool.query('SELECT COUNT(*) FROM pedidos');
        if (parseInt(resPed.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO pedidos (cliente_nombre, total, metodo_pago, direccion, estado) VALUES 
                ('Tech Startup SAC', 450.50, 'tarjeta', 'San Isidro, Lima', 'Pendiente'),
                ('Laboratorio UNI', 120.00, 'yape', 'Rímac, Lima', 'En Ruta'),
                ('Maker Space', 85.00, 'tarjeta', 'Miraflores, Lima', 'Entregado');
            `);
            console.log('🌱 Pedidos de prueba insertados con éxito.');
        }

        // 3. NUEVO: INSERCIÓN AUTOMÁTICA DEL MOTORIZADO
        // Verificamos si el correo del motorizado ya existe en la base de datos
        const resMoto = await pool.query("SELECT * FROM usuarios WHERE email = 'moto@fabriconnect.com'");
        
        if (resMoto.rows.length === 0) {
            // Encriptamos la clave '123456' para que el Login no la rechace
            const hashedPwd = await bcrypt.hash('123456', 10);
            
            // Insertamos al usuario con rol 'motorizado'
            await pool.query(
                `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)`,
                ['Carlos Repartidor', 'moto@fabriconnect.com', hashedPwd, 'motorizado']
            );
            console.log('🏍️ Usuario Motorizado (moto@fabriconnect.com) creado automáticamente.');
        }

    } catch (err) {
        console.error('❌ Error al inicializar las tablas de la base de datos:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};
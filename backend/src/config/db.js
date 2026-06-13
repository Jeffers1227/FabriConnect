const { Pool } = require('pg');
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

    try {
        await pool.query(createUsuariosTable);
        console.log('✅ Tabla "usuarios" verificada/creada correctamente.');

        await pool.query(createProductosTable);
        console.log('✅ Tabla "productos" verificada/creada correctamente.');

        // Verificar si la tabla está vacía
        const resultadoProductos = await pool.query('SELECT COUNT(*) FROM productos');
        if (parseInt(resultadoProductos.rows[0].count) === 0) {
            
            // Inserción masiva de catálogo
            const insertSeedQuery = `
                INSERT INTO productos (nombre, descripcion, precio, stock, proveedor, especificaciones) VALUES
                (
                    'Raspberry Pi 4 Model B 4GB', 
                    'Microcomputadora de placa reducida ideal para proyectos de robótica avanzada y visión computacional.', 
                    285.00, 30, 'TechPorts Inc.', 
                    '{"procesador": "Broadcom BCM2711, Quad core Cortex-A72", "RAM": "4GB LPDDR4", "conectividad": ["WiFi 2.4/5.0 GHz", "Bluetooth 5.0", "Gigabit Ethernet"]}'
                ),
                (
                    'Sensor Ultrasónico HC-SR04', 
                    'Sensor de distancia por ultrasonido, compatible con Arduino. Ideal para evasión de obstáculos en robótica.', 
                    9.50, 500, 'SensorCorp', 
                    '{"rango_medicion": "2cm - 400cm", "voltaje": "5V DC", "angulo_apertura": "15 grados"}'
                ),
                (
                    'Motor Paso a Paso NEMA 17', 
                    'Motor paso a paso bipolar de alta precisión para impresoras 3D y máquinas CNC.', 
                    48.00, 120, 'ElectroTech', 
                    '{"torque": "4.2 kg-cm", "pasos_por_vuelta": 200, "corriente_por_fase": "1.5A"}'
                ),
                (
                    'Servomotor Micro SG90', 
                    'Micro servomotor de 9g para pequeños mecanismos y brazos robóticos articulados.', 
                    12.00, 300, 'MecaParts', 
                    '{"torque": "1.8 kg-cm", "voltaje": "4.8V - 6V", "engranajes": "Plástico", "peso": "9g"}'
                ),
                (
                    'Módulo transceptor Bluetooth HC-05', 
                    'Módulo Bluetooth maestro/esclavo para comunicación inalámbrica serial con microcontroladores.', 
                    18.50, 200, 'Wireless Solutions', 
                    '{"version": "Bluetooth V2.0+EDR", "voltaje": "3.3V - 6V", "alcance": "10 metros"}'
                ),
                (
                    'Driver de Motor Puente H L298N', 
                    'Controlador dual para manejar el giro y velocidad de motores DC y motores paso a paso.', 
                    15.00, 150, 'TechPorts Inc.', 
                    '{"chip_control": "L298N", "voltaje_logico": "5V", "voltaje_motor": "5V - 35V", "corriente_max": "2A por puente"}'
                ),
                (
                    'Filamento PLA Premium 1.75mm - Negro', 
                    'Rollo de 1kg de filamento de ácido poliláctico para impresión 3D de alta precisión sin warping.', 
                    65.00, 80, '3D Maker Peru', 
                    '{"material": "PLA", "diametro": "1.75mm", "peso_neto": "1KG", "temperatura_impresion": "190°C - 220°C"}'
                ),
                (
                    'Perfil de Aluminio V-Slot 2020 (1 Metro)', 
                    'Perfil de extrusión de aluminio estructural anodizado para chasis de máquinas CNC e impresoras 3D.', 
                    25.00, 250, 'MecaParts', 
                    '{"material": "Aluminio 6063-T5", "dimensiones": "20mm x 20mm", "longitud": "1000mm", "tipo_ranura": "V-Slot"}'
                );
            `;
            await pool.query(insertSeedQuery);
            console.log('🌱 Catálogo inicial masivo insertado con éxito.');
        }

    } catch (err) {
        console.error('❌ Error al inicializar las tablas de la base de datos:', err);
    }
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    initDB
};
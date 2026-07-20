require('dotenv').config();
const db = require('../config/db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const crearSolicitudCAD = async (req, res) => {
    try {
        const { nombre, email, dni, material, infill, color, medidas, comentarios } = req.body;
        let archivo_url = null;

        if (!req.file) return res.status(400).json({ error: 'Es obligatorio adjuntar un archivo 3D' });

        const fileExtension = req.file.originalname.split('.').pop();
        const fileName = `cad-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;

        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype || 'application/octet-stream',
        };

        await s3.send(new PutObjectCommand(uploadParams));
        archivo_url = `${process.env.R2_PUBLIC_URL}/${fileName}`;

        const result = await db.query(
            `INSERT INTO solicitudes_cad (cliente_nombre, cliente_email, cliente_dni, material, infill, color, medidas, comentarios, archivo_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [nombre, email, dni, material, infill, color, medidas, comentarios, archivo_url]
        );

        res.status(201).json({ mensaje: 'Solicitud enviada', solicitud: result.rows[0] });
    } catch (error) {
        console.error("Error CAD:", error);
        res.status(500).json({ error: 'Error interno' });
    }
};

const obtenerSolicitudes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM solicitudes_cad ORDER BY fecha_creacion DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
};

const cotizarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;
        const { precio_cotizado } = req.body;

        if (!precio_cotizado || isNaN(precio_cotizado)) return res.status(400).json({ error: 'Precio inválido' });

        const result = await db.query(
            `UPDATE solicitudes_cad SET estado = 'Cotizado / Aprobado', precio_cotizado = $1 WHERE id = $2 RETURNING *`,
            [precio_cotizado, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        res.json({ mensaje: 'Aprobada', solicitud: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
};

// ==========================================
// NUEVO: BUSCAR POR DNI (CLIENTE)
// ==========================================
const obtenerPorDni = async (req, res) => {
    try {
        const { dni } = req.params;
        const result = await db.query('SELECT * FROM solicitudes_cad WHERE cliente_dni = $1 ORDER BY fecha_creacion DESC', [dni]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error DNI:", error);
        res.status(500).json({ error: 'Error buscando DNI' });
    }
};

// ==========================================
// NUEVO: PAGAR COTIZACIÓN Y CREAR PEDIDO
// ==========================================
const pagarCotizacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { cliente_nombre, total, metodo_pago, direccion } = req.body;
        let comprobante_url = null;

        // Si paga con Yape, subimos la foto a Cloudflare
        if (req.file) {
            const fileExtension = req.file.originalname.split('.').pop();
            const fileName = `yape-cad-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;

            const uploadParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            };

            await s3.send(new PutObjectCommand(uploadParams));
            comprobante_url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        }

        // 1. Insertamos un PEDIDO NORMAL para que el Admin y el Motorizado lo vean
        const resultPedido = await db.query(
            `INSERT INTO pedidos (cliente_nombre, total, metodo_pago, direccion, estado, comprobante_url) 
             VALUES ($1, $2, $3, $4, 'Pendiente', $5) RETURNING *`,
            [`${cliente_nombre} (Prod. 3D)`, total, metodo_pago, direccion, comprobante_url]
        );

        // 2. Actualizamos la solicitud CAD para que el cliente sepa que ya está pagada
        await db.query(`UPDATE solicitudes_cad SET estado = 'Pagado / En Producción' WHERE id = $1`, [id]);

        res.status(201).json({ mensaje: 'Pago registrado con éxito', pedido: resultPedido.rows[0] });
    } catch (error) {
        console.error("Error Pago CAD:", error);
        res.status(500).json({ error: 'Error procesando el pago' });
    }
};

module.exports = { crearSolicitudCAD, obtenerSolicitudes, cotizarSolicitud, obtenerPorDni, pagarCotizacion };
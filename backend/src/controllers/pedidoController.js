require('dotenv').config(); // 🔴 ESTO ERA LO QUE FALTABA PARA LEER TUS CONTRASEÑAS
const db = require('../config/db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto'); // Para generar nombres únicos para las fotos

// Alerta temprana por si te olvidaste de configurar el .env
if (!process.env.R2_ACCOUNT_ID) {
    console.error("⚠️ ALERTA CRÍTICA: No se detectan tus llaves de Cloudflare en el archivo .env");
}

// ==========================================
// CONFIGURACIÓN DE CLOUDFLARE R2
// ==========================================
const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const obtenerPedidos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM pedidos ORDER BY fecha_creacion DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const actualizarEstado = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, motorizado_id } = req.body;

        let queryText = 'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *';
        let queryParams = [estado, id];

        if (motorizado_id) {
            queryText = 'UPDATE pedidos SET estado = $1, motorizado_id = $2 WHERE id = $3 RETURNING *';
            queryParams = [estado, motorizado_id, id];
        }

        const result = await db.query(queryText, queryParams);
        res.json({ mensaje: 'Estado actualizado', pedido: result.rows[0] });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// ==========================================
// CREAR PEDIDO + SUBIR IMAGEN A LA NUBE
// ==========================================
const crearPedido = async (req, res) => {
    try {
        console.log("➡️ Iniciando creación de pedido...");
        const { cliente_nombre, total, metodo_pago, direccion } = req.body;
        let comprobante_url = null;

        if (req.file) {
            console.log("📸 Imagen recibida:", req.file.originalname);
            const fileExtension = req.file.originalname.split('.').pop();
            const fileName = `yape-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;

            const uploadParams = {
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: req.file.buffer, 
                ContentType: req.file.mimetype, 
            };

            console.log("☁️ Subiendo imagen a Cloudflare R2...");
            await s3.send(new PutObjectCommand(uploadParams));
            console.log("✅ Imagen subida a Cloudflare con éxito.");

            comprobante_url = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        } else {
            console.log("⚠️ No se adjuntó ninguna imagen al pedido.");
        }

        console.log("💾 Guardando el pedido en PostgreSQL...");
        const result = await db.query(
            `INSERT INTO pedidos (cliente_nombre, total, metodo_pago, direccion, estado, comprobante_url) 
             VALUES ($1, $2, $3, $4, 'Pendiente', $5) RETURNING *`,
            [cliente_nombre, total, metodo_pago, direccion, comprobante_url]
        );

        console.log("🎉 ¡Pedido guardado con éxito! ID:", result.rows[0].id);
        res.status(201).json({ mensaje: 'Pedido creado con éxito', pedido: result.rows[0] });
        
    } catch (error) {
        // 🔥 ESTO NOS DIRÁ EL ERROR EXACTO EN LA TERMINAL
        console.error("🔥 ERROR COMPLETO AL CREAR PEDIDO:");
        console.error(error); 
        res.status(500).json({ 
            error: 'Error interno al procesar el pedido o la imagen',
            detalle: error.message 
        });
    }
};

module.exports = { obtenerPedidos, actualizarEstado, crearPedido };
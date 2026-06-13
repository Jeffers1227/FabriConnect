const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 1. Configurar Multer para almacenar el archivo temporalmente en la memoria RAM
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Límite de 20MB por archivo CAD
});

// 2. Inicializar el cliente de Amazon S3 solo si existen las credenciales
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
}

// 3. Función principal para subir el archivo (S3 o Local)
const subirArchivo = async (file, carpetaDestino) => {
    const nombreUnico = `${Date.now()}-${file.originalname}`;

    // MODO PRODUCCIÓN: Si AWS está configurado, subir a Amazon S3
    if (s3Client) {
        try {
            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `${carpetaDestino}/${nombreUnico}`,
                Body: file.buffer,
                ContentType: file.mimetype
            });
            await s3Client.send(command);
            // Retorna la URL pública simulada de Amazon S3
            return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${carpetaDestino}/${nombreUnico}`;
        } catch (error) {
            console.error("❌ Error subiendo a Amazon S3, usando respaldo local:", error);
        }
    }

    // MODO RESPALDO LOCAL: Guardar en la carpeta del servidor si no hay AWS
    console.log("📂 AWS no configurado o inaccesible. Guardando archivo localmente...");
    const dirLocal = path.join(__dirname, `../../uploads/${carpetaDestino}`);
    
    // Crear las carpetas locales si no existen
    if (!fs.existsSync(dirLocal)) {
        fs.mkdirSync(dirLocal, { recursive: true });
    }

    const rutaCompleta = path.join(dirLocal, nombreUnico);
    fs.writeFileSync(rutaCompleta, file.buffer);
    
    return `/uploads/${carpetaDestino}/${nombreUnico}`;
};

module.exports = { upload, subirArchivo };
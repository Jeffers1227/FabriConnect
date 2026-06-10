const express = require('express');
require('dotenv').config();
const db = require('./config/db');

// Importación de rutas de la plataforma
const authRoutes = require('./routes/authRoutes');
const cadRoutes = require('./routes/cadRoutes');
const productoRoutes = require('./routes/productoRoutes');

const app = express();

// Middleware obligatorio para procesar solicitudes JSON
app.use(express.json());

// Registro de Módulos de la API
app.use('/api/auth', authRoutes);
app.use('/api/cad', cadRoutes);
app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Servidor Backend de FabriConnect funcionando correctamente.');
});

const PORT = process.env.PORT || 3000;

// Primero inicializamos/verificamos la BD y luego encendemos el servidor
db.initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});
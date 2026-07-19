const express = require('express');
const cors = require('cors'); // <-- Importamos CORS
require('dotenv').config();
const db = require('./config/db');

// Importación de rutas de la plataforma
const authRoutes = require('./routes/authRoutes');
const cadRoutes = require('./routes/cadRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes'); // <-- NUEVA LÍNEA: Importamos la ruta de usuarios/motorizados

const app = express();

// Habilitamos CORS para que React pueda comunicarse con Node
app.use(cors()); 

// Middleware obligatorio para procesar solicitudes JSON
app.use(express.json());

// Registro de Módulos de la API
app.use('/api/auth', authRoutes);
app.use('/api/cad', cadRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes); // <-- NUEVA LÍNEA: Registramos la ruta en la API

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
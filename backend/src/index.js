const express = require('express');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const cadRoutes = require('./routes/cadRoutes');

const app = express();

// Middleware para leer JSON en el body de las peticiones
app.use(express.json());

// Registrar las rutas en Express
app.use('/api/auth', authRoutes);
app.use('/api/cad', cadRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor Backend funcionando correctamente.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
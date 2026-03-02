require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración estricta de CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://proyectosakaridentalconnect-production.up.railway.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 1. Middlewares (Configuración Global)
app.use(helmet());




app.use(express.json());

// 2. Rutas
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

app.get('/api/status', (req, res) => {
    res.json({ status: "API Online", version: "1.0.0" });
});

// 3. Inicialización del Sistema
const startServer = async () => {
    try {
        // A) Verificar conexión con la BD
        await testConnection();

        // B) Sincronización de Modelos
        // Usamos alter: true para que agrgeue las columnas nuevas (tokens de password)
        // a la tabla que ya existe de Laravel sin borrar sus datos.
        await sequelize.sync({ alter: true });
        console.log('Tablas sincronizadas correctamente. Columnas nuevas añadidas si faltaban.');

        // C) Levantar el servidor Express
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error fatal al iniciar el servicio:', error);
    }
};

startServer();

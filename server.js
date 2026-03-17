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
    origin: process.env.FRONTEND_URL || 'https://dentalconnect.cloud',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 1. Middlewares (Configuración Global)
app.use(helmet());




app.use(express.json());

// 2. Rutas
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

const citasRoutes = require('./src/routes/citas.routes');
app.use('/api/citas', citasRoutes);

app.get('/api/status', (req, res) => {
    res.json({ status: "API Online", version: "1.0.0" });
});

// 3. Inicialización del Sistema
const startServer = async () => {
    try {
        // A) Verificar conexión con la BD
        await testConnection();

        // B) Sincronización de Modelos
        // En un entorno compartido con Laravel, evitamos que Sequelize altere las tablas.
        // Solo autenticamos la conexión.
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // C) Levantar el servidor Express
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error fatal al iniciar el servicio:', error);
    }
};

startServer();

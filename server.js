require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración dinámica y a prueba de fallos de CORS
app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
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
        await testConnection();
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // Escuchar en 0.0.0.0 para que Railway pueda conectarlo a internet
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor expuesto y corriendo en el puerto ${PORT}`);
        });

    } catch (error) {
        console.error('Error fatal al iniciar el servicio:', error);
    }
};

startServer();
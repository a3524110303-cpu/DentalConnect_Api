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
// Configuración dinámica y a prueba de fallos de CORS
app.use(cors({
    // Al poner 'true', Express refleja automáticamente el dominio que hace la petición
    // Esto evita cualquier problema de espacios en blanco o URLs mal escritas
    origin: true,
    // Es vital agregar 'OPTIONS' para que el preflight request pase
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    // Declarar explícitamente las cabeceras permitidas
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
        // A) Verificar conexión con la BD
        await testConnection();

        // B) Sincronización de Modelos
        // En un entorno compartido con Laravel, evitamos que Sequelize altere las tablas.
        // Solo autenticamos la conexión.
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida correctamente.');

        // C) Levantar el servidor Express
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor expuesto y corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error fatal al iniciar el servicio:', error);
    }
};

startServer();

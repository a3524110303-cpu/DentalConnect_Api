const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');

// Definir Endpoints Públicos
// POST http://localhost:4000/api/auth/forgot-password
router.post('/forgot-password', passwordController.forgotPassword);

// POST http://localhost:4000/api/auth/reset-password
router.post('/reset-password', passwordController.resetPassword);

// GET handler para dar feedback en caso de que abran el enlace directamente en el navegador
router.get('/reset-password', (req, res) => {
    res.status(405).json({
        error: 'Método no permitido',
        message: 'Para restablecer la contraseña, debes enviar una petición POST desde el formulario (con token, email y password).'
    });
});

module.exports = router;

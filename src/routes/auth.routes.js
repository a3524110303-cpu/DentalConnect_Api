const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password.controller');

// Definir Endpoints Públicos
// POST http://localhost:4000/api/auth/forgot-password
router.post('/forgot-password', passwordController.forgotPassword);

// POST http://localhost:4000/api/auth/reset-password
router.post('/reset-password', passwordController.resetPassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');

// Definir el Endpoint
// GET http://localhost:4000/api/citas/proxima/:id_paciente
router.get('/proxima/:id_paciente', citasController.getProximaCita);

module.exports = router;

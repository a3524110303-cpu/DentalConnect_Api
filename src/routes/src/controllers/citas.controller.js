const { sequelize } = require('../config/database');

exports.getProximaCita = async (req, res) => {
    try {
        const { id_paciente } = req.params;

        const query = `
            SELECT 
                c.fecha_hora_inicio, 
                c.estado_cita, 
                c.motivo, 
                u.nombre_completo AS nombre_doctor, 
                s.nombre_servicio
            FROM citas c
            JOIN doctores d ON c.id_doctor = d.id_doctor
            JOIN usuarios_sistema u ON d.id_usuario = u.id_usuario
            JOIN catalogo_servicios s ON c.id_servicio = s.id_servicio
            WHERE c.id_paciente = :id_paciente 
              AND c.fecha_hora_inicio >= NOW() 
              AND c.estado_cita IN ('pendiente', 'confirmada')
            ORDER BY c.fecha_hora_inicio ASC
            LIMIT 1;
        `;

        const [results] = await sequelize.query(query, {
            replacements: { id_paciente: id_paciente }
        });

        // Si el arreglo está vacío, el paciente no tiene citas futuras
        if (results.length === 0) {
            return res.status(404).json({ message: 'No tienes citas próximas agendadas.' });
        }

        // Devolvemos el primer resultado encontrado
        res.status(200).json(results[0]);

    } catch (error) {
        console.error("Error al obtener próxima cita:", error);
        res.status(500).json({ error: 'Error del servidor al obtener la cita.' });
    }
};

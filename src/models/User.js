const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Mapeamos el modelo a la tabla "usuarios_sistema" de Laravel
const User = sequelize.define('User', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // Foreign key a clínicas (opcional aquí si no hacemos JOINs)
    id_clinica: {
type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
    },
    nombre_completo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('administrador', 'doctor', 'recepcionista', 'paciente'),
        defaultValue: 'doctor'
    },
    // Añadimos campos para el token de recuperación (Laravel passwords_resets o directo aquí)
    // Para simplificar, añadimos el token directo en la tabla si lo vas a crear en Node
    // o usamos JWT estatico
    reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'usuarios_sistema',
    timestamps: true, // asume que Laravel tiene created_at y updated_at
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = User;

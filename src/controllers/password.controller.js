const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { enviarCorreoRecuperacion } = require('../utils/emailService');

// 1. SOLICITAR RESTABLECIMIENTO (Generar y Enviar Token por Correo)
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar si el usuario existe
        const usuario = await User.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ error: 'No existe una cuenta con este correo' });
        }

        // Generar un token único (como lo hace Laravel en la tabla password_resets, pero simple)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Encriptar el token para guardarlo en BD (Seguridad adicional)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Guardar en la DB con expiración (15 minutos)
        usuario.reset_password_token = hashedToken;
        usuario.reset_password_expires = Date.now() + 15 * 60 * 1000;
        await usuario.save();

        // Construir URL de reseteo para el Frontend (React o Laravel Blade)
        // Obtenemos FRONTEND_URL de las variables de entorno o usamos auth/restablecer-password por defecto
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8000';
        const resetUrl = `${frontendURL}/recuperar-password?token=${resetToken}&email=${email}`;

        // Enviar Correo
        await enviarCorreoRecuperacion(usuario.email, resetUrl);

        res.status(200).json({
            success: true,
            message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña'
        });

    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ error: 'Error al enviar el correo. Por favor, intenta de nuevo.' });
    }
};

// 2. APLICAR RESTABLECIMIENTO (Validar Token y Actualizar Password)
exports.resetPassword = async (req, res) => {
    try {
        const { token, email, newPassword, password } = req.body;
        const pass = newPassword || password;

        if (!token || !email || !pass) {
            return res.status(400).json({ error: 'Faltan datos requeridos (token, email, password)' });
        }

        // Validaciones de seguridad de contraseña (mismas reglas que el registro)
        if (pass.length < 8) {
            return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres.' });
        }
        if (!/[A-Z]/.test(pass)) {
            return res.status(400).json({ error: 'La contraseña debe contener al menos una letra mayúscula.' });
        }
        if (!/[\W_]/.test(pass)) {
            return res.status(400).json({ error: 'La contraseña debe contener al menos un carácter especial (ej. @, #, $, !).' });
        }
        if (/123/.test(pass)) {
            return res.status(400).json({ error: 'La contraseña no puede contener secuencias numéricas como 123.' });
        }

        // Hashear el token recibido para cruzarlo con el de la Base de Datos
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar al usuario con ese correo, ese token
        const DateNow = new Date();
        const usuario = await User.findOne({
            where: {
                email: email,
                reset_password_token: hashedToken
            }
        });

        if (!usuario) {
            return res.status(400).json({ error: 'El token es inválido o el correo no coincide' });
        }

        // Validar expiración (is expired?)
        if (usuario.reset_password_expires < DateNow) {
            return res.status(400).json({ error: 'El token de restablecimiento ha expirado' });
        }

        // Aqui encriptamos la NUEVA contraseña (bcrypt)
        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(pass, salt);

        //aqui le decimos a la base de datos que la ecriptacion de la contraseña que fue cambiada
        //sea compatible con la encriptacion de la contraseña que fue cambiada en laravel
        hashedPassword = hashedPassword.replace(/^\$2[ab]\$/, '$2y$');

        // Actualizar y Limpiar Tokens
        usuario.password = hashedPassword;
        usuario.reset_password_token = null;
        usuario.reset_password_expires = null;
        await usuario.save();

        res.status(200).json({
            success: true,
            message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error("Error en resetPassword:", error);
        res.status(500).json({ error: 'Error del servidor al restablecer contraseña.' });
    }
};

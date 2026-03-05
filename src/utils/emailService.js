const nodemailer = require('nodemailer');

// Configuramos el "transporter" de Nodemailer usando variables de entorno
// Esto es ideal para configurarlo directamente en tu panel de Railway
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, 
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true para el puerto 465, false para otros (como 587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const enviarCorreoRecuperacion = async (email, resetUrl) => {
    try {
        const mailOptions = {
            // El remitente ahora será el correo que configures en tu SMTP
            from: `"DentalConnect" <${process.env.SMTP_USER}>`,
            to: email, // Ahora sí, a cualquier correo de la base de datos
            subject: 'Recuperación de Contraseña - DentalConnect',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #00b4d8;">Recuperación de Contraseña</h2>
                    <p>Hola,</p>
                    <p>Has solicitado restablecer tu contraseña en DentalConnect.</p>
                    <p>Para crear una nueva contraseña, haz clic en el siguiente enlace. Este enlace expira en 15 minutos:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #00b4d8; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
                    </div>
                    <p>Si no solicitaste este cambio, simplemente ignora este correo.</p>
                    <br>
                    <p>Saludos,<br>El equipo de DentalConnect</p>
                </div>
            `
        };

        // Enviamos el correo
        const info = await transporter.sendMail(mailOptions);
        
        console.log("Correo enviado exitosamente con Nodemailer. ID:", info.messageId);
        return info;

    } catch (error) {
        console.error("Error al enviar con Nodemailer:", error);
        throw new Error('Fallo al enviar correo de recuperación');
    }
};

module.exports = { enviarCorreoRecuperacion };
const { Resend } = require('resend');

// Inicializamos Resend con la llave que pusiste en Railway
const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreoRecuperacion = async (email, resetUrl) => {
    try {
        const { data, error } = await resend.emails.send({
            // IMPORTANTE: En el plan gratis, el remitente siempre debe ser este:
            from: 'DentalConnect <onboarding@resend.dev>',
            to: email, // Recuerda: para pruebas, usa el mismo correo con el que creaste tu cuenta de Resend
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
        });

        if (error) {
            console.error("Error al enviar con Resend:", error);
            throw new Error('Fallo al enviar correo con Resend');
        }

        console.log("Correo enviado exitosamente:", data);
        return data;

    } catch (error) {
        console.error("Error en emailService:", error);
        throw error;
    }
};

module.exports = { enviarCorreoRecuperacion };
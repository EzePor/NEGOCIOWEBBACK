const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail que envía los correos
    pass: process.env.EMAIL_PASS, // Contraseña de Aplicación de Google
  },
});

exports.enviarEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fotos App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error al enviar email:", error);
    throw error;
  }
};

// Función para enviar correos
const enviarCorreo = async (destinatario, asunto, mensaje) => {
  try {
    const mailOptions = {
      from: `"RapidFoto Tienda" <${process.env.EMAIL_USER}>`,
      to: destinatario, // Dirección de email del cliente o usuario
      subject: asunto,
      html: mensaje, // Contenido en HTML
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Email enviado a: ${destinatario}`);
  } catch (error) {
    console.error("❌ Error enviando email:", error);
  }
};

module.exports = { enviarCorreo };

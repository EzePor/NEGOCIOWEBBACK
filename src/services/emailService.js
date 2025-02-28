const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail que envía los correos
    pass: process.env.EMAIL_PASS, // Contraseña de Aplicación de Google
  },
});

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

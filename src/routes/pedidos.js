const express = require("express");
const router = express.Router();
const { enviarCorreo } = require("../services/emailService");

router.post("/procesar-compra", async (req, res) => {
  try {
    const { usuario, carrito, total } = req.body;

    // Generar ID único del pedido
    const orderId = `ORD-${Date.now()}`;

    console.log("Datos recibidos:", { usuario, carrito, total, orderId });

    if (!usuario || !carrito || !total) {
      return res.status(400).json({
        mensaje: "Faltan datos requeridos",
        debug: { usuario, carrito, total },
      });
    }

    // Generar el detalle del pedido en HTML incluyendo el ID
    let detalleCompra = `
      <h2>¡Gracias por tu compra, ${usuario.nombre}!</h2>
      <p><strong>Número de Pedido:</strong> ${orderId}</p>
      <p><strong>Email:</strong> ${usuario.email}</p>
      <p><strong>Dirección:</strong> ${usuario.direccion}, ${usuario.localidad}, ${usuario.provincia}</p>
      <p><strong>DNI:</strong> ${usuario.dni}</p>
      <h3>Detalles de la compra:</h3>
      <ul>
    `;

    carrito.forEach((producto) => {
      detalleCompra += `
        <li>${producto.nombre} - ${producto.cantidad} x $${producto.precio}</li>
      `;
    });

    detalleCompra += `</ul><h3>Total: $${total}</h3>`;

    // Enviar emails con el ID del pedido en el asunto
    await enviarCorreo(
      usuario.email,
      `Confirmación de tu compra - Pedido ${orderId}`,
      detalleCompra
    );

    await enviarCorreo(
      process.env.ADMIN_EMAIL || "rapidfototienda@gmail.com",
      `Nueva compra recibida - Pedido ${orderId}`,
      detalleCompra
    );

    res.status(200).json({
      mensaje: "Compra realizada con éxito",
      orderId,
      usuario: usuario.email,
      total,
      productos: carrito.length,
    });
  } catch (error) {
    console.error("Error procesando compra:", error);
    res
      .status(500)
      .json({ mensaje: "Error al procesar la compra", error: error.message });
  }
});

module.exports = router;

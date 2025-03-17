const PedidoFotos = require("../models/PedidoFotos");
const { enviarCorreo } = require("../services/emailService");

exports.crearPedido = async (req, res) => {
  try {
    console.log("📝 Datos recibidos:", req.body);

    const pedidoData = {
      numeroOrden: `ORDEN-${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}`,
      usuario: {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dni: req.body.dni,
        email: req.body.email,
        direccion: req.body.direccion,
        localidad: req.body.localidad,
        provincia: req.body.provincia,
      },
      medida: req.body.medidaFoto,
      cantidadFotos: req.body.cantidadFotos,
      fotos: req.body.fotos.map((fotoId) => ({
        fotoId,
      })),
    };

    const nuevoPedido = new PedidoFotos(pedidoData);
    await nuevoPedido.save();

    console.log("✅ Pedido guardado:", nuevoPedido.numeroOrden);

    // Enviar email de confirmación
    const mensajeEmail = `
      <h2>¡Nuevo pedido de fotos!</h2>
      <p><strong>Número de orden:</strong> ${nuevoPedido.numeroOrden}</p>
      <p><strong>Cliente:</strong> ${req.body.nombre} ${req.body.apellido}</p>
      <p><strong>DNI:</strong> ${req.body.dni}</p>
      <p><strong>Email:</strong> ${req.body.email}</p>
      <p><strong>Dirección de entrega:</strong></p>
      <p>${req.body.direccion}</p>
      <p>${req.body.localidad}, ${req.body.provincia}</p>
      <h3>Detalles del pedido:</h3>
      <p><strong>Cantidad de fotos:</strong> ${req.body.cantidadFotos}</p>
      <p><strong>Medida seleccionada:</strong> ${req.body.medidaFoto}</p>
    `;
    // envio email al cliente
    await enviarCorreo(
      req.body.email,
      `Confirmación Pedido - ${nuevoPedido.numeroOrden}`,
      mensajeEmail
    );

    // Enviar el mismo email al administrador
    await enviarCorreo(
      process.env.ADMIN_EMAIL || "rapidfototienda@gmail.com",
      `Nuevo pedido de fotos recibido - ${nuevoPedido.numeroOrden}`,
      mensajeEmail
    );

    res.status(201).json({
      success: true,
      mensaje: "Pedido creado exitosamente",
      datos: {
        numeroOrden: nuevoPedido.numeroOrden,
        cantidadFotos: nuevoPedido.cantidadFotos,
      },
    });
  } catch (error) {
    console.error("❌ Error al crear pedido:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el pedido",
      error: error.message,
    });
  }
};

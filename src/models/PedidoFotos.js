const mongoose = require("mongoose");

const pedidoFotosSchema = new mongoose.Schema({
  numeroOrden: {
    type: String,
    required: true,
    unique: true,
  },
  usuario: {
    nombre: String,
    apellido: String,
    dni: String,
    email: {
      type: String,
      required: true,
    },
    direccion: String,
    localidad: String,
    provincia: String,
  },
  fotos: [
    {
      fotoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FotoUsuario",
      },
      url: String,
      nombreOriginal: String,
    },
  ],
  medida: {
    type: String,
    enum: ["7x10", "10x15", "13x18", "15x21", "20x30"],
    required: true,
  },
  cantidadFotos: {
    type: Number,
    required: true,
  },
  fechaPedido: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    enum: ["pendiente", "procesando", "completado"],
    default: "pendiente",
  },
});

module.exports = mongoose.model("PedidoFotos", pedidoFotosSchema);

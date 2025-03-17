const mongoose = require("mongoose");

const fotoUsuarioSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  nombreOriginal: {
    type: String,
  },
  fechaSubida: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FotoUsuario", fotoUsuarioSchema);

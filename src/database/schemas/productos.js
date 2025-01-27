const mongoose = require("mongoose");

const ProductosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  imagen: {
    type: String,
    required: true,
  },
  descuento: {
    type: Number,
  },
  precioDescuento: {
    type: Number,
  },
});

module.exports = mongoose.model("Productos", ProductosSchema);

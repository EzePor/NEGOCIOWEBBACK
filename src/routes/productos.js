const express = require("express");
const upload = require("../middleware/multer");
const RUTAS_PRODUCTOS = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productos");

RUTAS_PRODUCTOS.route("/")
  .get(obtenerProductos)
  .post(upload.single("imagen"), crearProducto);

RUTAS_PRODUCTOS.route("/:id")
  .get(obtenerProductoPorId)
  .put(upload.single("imagen"), actualizarProducto)
  .delete(eliminarProducto);

module.exports = RUTAS_PRODUCTOS;

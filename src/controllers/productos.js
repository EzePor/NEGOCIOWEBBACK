const mongoose = require("mongoose");
const MDB_PRODUCTOS = require("../database/schemas/productos");
const cloudinary = require("../config/cloudinary");

// GET TODOS LOS PRODUCTOS
const obtenerProductos = async (req, res) => {
  const response = await MDB_PRODUCTOS.find();

  res.send(response);
};

// GET PRODUCTO POR ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido o no proporcionado" });
    }

    // Buscar el producto por su ID
    const producto = await MDB_PRODUCTOS.findById(id);
    console.log("Producto encontrado:", producto); // Log completo del producto
    console.log("URL de imagen:", producto?.imagen); // Log específico de la imagen

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Respuesta exitosa con el producto encontrado
    res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res
      .status(500)
      .json({ error: "Error al obtener el producto", details: error.message });
  }
};

// POST NUEVO PRODUCTO
const crearProducto = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);

    const {
      nombre,
      descripcion,
      categoria,
      precio,
      descuento,
      precioDescuento,
    } = req.body;

    // Validar si hay una imagen adjunta
    if (!req.file) {
      return res.status(400).json({
        error: "La imagen es requerida",
        debug: { body: req.body, file: req.file },
      });
    }

    // Generar un identificador basado en el nombre del producto
    const nombreProducto = nombre.toLowerCase().replace(/ /g, "_"); // Reemplazar espacios por guiones bajos

    // Subir la imagen a Cloudinary con un `public_id` personalizado
    const resultadoImagen = await cloudinary.uploader.upload(req.file.path, {
      public_id: `productos/${nombreProducto}`, // Definir la carpeta y el identificador único
      overwrite: true, // Sobrescribir si ya existe
    });

    // Crear un nuevo producto en la base de datos con la URL de la imagen
    const nuevoProducto = await MDB_PRODUCTOS.create({
      nombre,
      descripcion,
      categoria,
      precio: Number(precio),
      imagen: resultadoImagen.secure_url, // Guardar la URL generada por Cloudinary
      descuento: Number(descuento),
      precioDescuento: Number(precioDescuento),
    });

    // Respuesta exitosa
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error detallado:", error);
    res.status(500).json({
      error: "No se pudo crear el producto",
      details: error.message,
    });
  }
};

// PUT ACTUALIZAR PRODUCTO
const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID recibido:", id);
    console.log("Body recibido:", req.body);
    console.log("Archivo recibido:", req.file);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID no válido",
        details: { id },
      });
    }

    // Obtener producto actual
    const productoActual = await MDB_PRODUCTOS.findById(id);
    if (!productoActual) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      categoria: req.body.categoria,
      precio: Number(req.body.precio),
      descuento: req.body.descuento ? Number(req.body.descuento) : undefined,
      precioDescuento: req.body.precioDescuento
        ? Number(req.body.precioDescuento)
        : undefined,
      imagen: productoActual.imagen, // Mantener imagen existente por defecto
    };

    // Procesar nueva imagen si existe
    if (req.file) {
      const timestamp = Date.now();
      const nombreProducto = `${req.body.nombre
        .toLowerCase()
        .replace(/ /g, "_")}_${timestamp}`;

      const resultadoImagen = await cloudinary.uploader.upload(req.file.path, {
        public_id: `productos/${nombreProducto}`,
        folder: "productos",
        overwrite: true,
      });

      datosActualizacion.imagen = resultadoImagen.secure_url;
    }

    // Actualizar producto
    const productoActualizado = await MDB_PRODUCTOS.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Error al actualizar producto",
      details: error.message,
    });
  }
};

// DELETE ELIMINAR PRODUCTO
const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Intentando eliminar producto con ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        mensaje: "ID no válido",
        details: { id },
      });
    }

    // Buscar el producto
    const producto = await MDB_PRODUCTOS.findById(id);
    console.log("Producto encontrado:", producto);

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado",
        details: { id },
      });
    }

    try {
      // Extraer public_id de la URL de Cloudinary
      const urlParts = producto.imagen.split("/");
      const publicId = urlParts[urlParts.length - 1].split(".")[0];
      console.log("Public ID de Cloudinary:", publicId);

      // Eliminar imagen de Cloudinary
      await cloudinary.uploader.destroy(`productos/${publicId}`);
      console.log("Imagen eliminada de Cloudinary");
    } catch (cloudinaryError) {
      console.error("Error al eliminar imagen de Cloudinary:", cloudinaryError);
    }

    // Eliminar producto de la base de datos
    await MDB_PRODUCTOS.deleteOne({ _id: id });
    console.log("Producto eliminado de la base de datos");

    res.status(200).json({
      mensaje: "Producto eliminado correctamente",
      details: { id, nombre: producto.nombre },
    });
  } catch (error) {
    console.error("Error completo al eliminar:", error);
    res.status(500).json({
      mensaje: "Error al eliminar el producto",
      error: error.message,
      stack: error.stack,
    });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};

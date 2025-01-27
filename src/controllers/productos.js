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

    // Validar ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID no válido",
        details: { id, body: req.body },
      });
    }

    const {
      nombre,
      descripcion,
      categoria,
      precio,
      descuento,
      precioDescuento,
    } = req.body;

    // Obtener el producto actual para conservar la imagen existente
    const productoActual = await MDB_PRODUCTOS.findById(id);
    if (!productoActual) {
      return res.status(404).json({
        error: "Producto no encontrado",
        details: { id },
      });
    }

    // Inicializar datos de actualización
    const datosActualizacion = {
      nombre,
      descripcion,
      categoria,
      precio: Number(precio),
      descuento: descuento ? Number(descuento) : undefined,
      precioDescuento: precioDescuento ? Number(precioDescuento) : undefined,
      imagen: productoActual.imagen, // Imagen existente como predeterminada
    };

    // Manejo del archivo (si se proporciona uno)
    if (req.file && req.file.size > 0) {
      const timestamp = Date.now();
      const nombreProducto = `${nombre
        .toLowerCase()
        .replace(/ /g, "_")}_${timestamp}`;

      const resultadoImagen = await cloudinary.uploader.upload(req.file.path, {
        public_id: `productos/${nombreProducto}`,
        folder: "productos",
        resource_type: "auto",
        overwrite: true,
      });

      datosActualizacion.imagen = resultadoImagen.secure_url;
    }

    // Actualizar el producto
    const productoActualizado = await MDB_PRODUCTOS.findByIdAndUpdate(
      id,
      datosActualizacion,
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        error: "Producto no encontrado",
        details: { id },
      });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({
      error: "Error al actualizar el producto",
      details: error.message,
      stack: error.stack,
    });
  }
};

// DELETE ELIMINAR PRODUCTO
const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto)
      return res.status(404).json({ mensaje: "Producto no encontrado" });

    // Obtener el public_id de la imagen desde la URL
    const publicId = producto.imagen.split("/").pop().split(".")[0];

    // Eliminar la imagen de Cloudinary
    await cloudinary.uploader.destroy(`ecommerce_products/${publicId}`);

    // Eliminar el producto de la base de datos
    await producto.remove();

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el producto", error });
  }
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};

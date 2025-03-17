const FotoUsuario = require("../models/FotosUsuario");
const axios = require("axios");
const archiver = require("archiver");

const {
  cloudinary,
  cloudinaryConfig,
} = require("../config/cloudinaryImpresiones");

{
  /*exports.subirFoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No se subió ninguna imagen" });

    const nuevaFoto = new FotoUsuario({
      usuarioId: req.usuario.id, // Se obtiene desde el token JWT
      url: req.file.path, // URL en Cloudinary
    });

    await nuevaFoto.save();
    res.json(nuevaFoto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al subir la foto" });
  }
};*/
}

exports.subirImagenes = async (req, res) => {
  try {
    console.log("📥 Iniciando proceso de subida...");
    console.log("Files recibidos:", req.files);

    // Verificación más robusta de archivos
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("❌ No se recibieron archivos");
      return res.status(400).json({
        success: false,
        mensaje: "No se encontraron imágenes para subir",
      });
    }

    // Obtener los archivos, ya sea como array o single
    const archivos = Array.isArray(req.files) ? req.files : [req.files];
    console.log(`📸 Procesando ${archivos.length} archivos...`);

    const fotosGuardadas = [];
    const errores = [];

    for (const archivo of archivos) {
      try {
        console.log(`Procesando archivo: ${archivo.originalname}`);

        const resultado = await cloudinary.uploader.upload(archivo.path, {
          folder: "impresiones_usuarios",
          resource_type: "image",
          transformation: [
            { width: 5000, height: 5000, crop: "limit" },
            { quality: 100 },
          ],
          eager: [
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: 85,
            },
            {
              width: 400,
              height: 400,
              crop: "limit",
              quality: 85,
            },
          ],
        });

        const nuevaFoto = new FotoUsuario({
          usuarioId: req.usuario.id,
          url: resultado.secure_url,
          nombreOriginal: archivo.originalname,
          public_id: resultado.public_id,
        });

        await nuevaFoto.save();
        fotosGuardadas.push({
          _id: nuevaFoto._id,
          url: nuevaFoto.url,
          nombreOriginal: nuevaFoto.nombreOriginal,
        });

        console.log(`✅ Imagen guardada: ${archivo.originalname}`);
      } catch (error) {
        console.error(`❌ Error procesando ${archivo.originalname}:`, error);
        errores.push({
          nombre: archivo.originalname,
          error: error.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      mensaje: "Proceso de subida completado",
      fotos: fotosGuardadas,
      errores: errores,
      total: {
        procesadas: fotosGuardadas.length,
        fallidas: errores.length,
      },
    });
  } catch (error) {
    console.error("❌ Error general en subida:", error);
    return res.status(500).json({
      success: false,
      mensaje: "Error al procesar la subida de archivos",
      error: error.message,
    });
  }
};

exports.obtenerFotosUsuario = async (req, res) => {
  try {
    // Verificar que el usuario autenticado solo pueda ver sus propias fotos
    if (req.usuario.id !== req.params.usuarioId) {
      return res.status(403).json({ error: "No tienes permiso" });
    }

    // Obtener fotos y contar total
    const fotos = await FotoUsuario.find({ usuarioId: req.usuario.id });
    const totalFotos = fotos.length;

    // Enviar respuesta con fotos y total
    res.json({
      fotos: fotos,
      total: totalFotos,
      mensaje: "Fotos obtenidas exitosamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las fotos" });
  }
};

exports.obtenerTodasLasFotos = async (req, res) => {
  try {
    // Solo el administrador puede ver todas las fotos
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const fotos = await FotoUsuario.find().populate(
      "usuarioId",
      "nombre email"
    );
    res.json(fotos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las fotos" });
  }
};

exports.eliminarFoto = async (req, res) => {
  try {
    const { fotoId } = req.params;

    // Buscar la foto
    const foto = await FotoUsuario.findById(fotoId);

    if (!foto) {
      return res.status(404).json({ error: "Foto no encontrada" });
    }

    // Verificar permisos (solo el dueño o admin pueden eliminar)
    if (
      foto.usuarioId.toString() !== req.usuario.id &&
      req.usuario.rol !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "No tienes permiso para eliminar esta foto" });
    }

    try {
      // Extraer public_id de la URL de Cloudinary
      const urlParts = foto.url.split("/");
      const publicId = urlParts[urlParts.length - 1].split(".")[0];

      // Eliminar imagen de Cloudinary
      await cloudinary.uploader.destroy(`impresiones_usuarios/${publicId}`);
      console.log("Imagen eliminada de Cloudinary");
    } catch (cloudinaryError) {
      console.error("Error al eliminar de Cloudinary:", cloudinaryError);
    }

    // Eliminar registro de la base de datos
    await FotoUsuario.findByIdAndDelete(fotoId);

    res.json({ mensaje: "Foto eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar foto:", error);
    res.status(500).json({
      error: "Error al eliminar la foto",
      details: error.message,
    });
  }
};

exports.descargarFoto = async (req, res) => {
  try {
    // Verificar permisos de admin
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        mensaje: "Solo los administradores pueden descargar fotos",
      });
    }

    const { fotoId } = req.params;
    const foto = await FotoUsuario.findById(fotoId);

    if (!foto) {
      return res.status(404).json({
        success: false,
        mensaje: "Foto no encontrada",
      });
    }

    console.log("📥 Iniciando descarga de foto:", foto.url);

    try {
      const response = await axios({
        method: "GET",
        url: foto.url,
        responseType: "stream", // Cambiar a stream
      });

      // Configurar headers
      res.setHeader("Content-Type", response.headers["content-type"]);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${foto.nombreOriginal || `foto_${fotoId}.jpg`}"`
      );

      // Pipe directamente la respuesta
      response.data.pipe(res);
    } catch (downloadError) {
      console.error("Error en la descarga:", downloadError);
      return res.status(500).json({
        success: false,
        mensaje: "Error al descargar el archivo",
        error: downloadError.message,
      });
    }
  } catch (error) {
    console.error("❌ Error general:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

exports.descargarTodasLasFotos = async (req, res) => {
  try {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        success: false,
        mensaje: "Solo los administradores pueden descargar fotos",
      });
    }

    const { usuarioId } = req.params;
    const fotos = await FotoUsuario.find({ usuarioId });

    if (!fotos.length) {
      return res.status(404).json({
        success: false,
        mensaje: "No se encontraron fotos para este usuario",
      });
    }

    console.log(
      `📥 Admin descargando ${fotos.length} fotos del usuario:`,
      usuarioId
    );

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Configurar headers para la descarga del ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=fotos_${usuarioId}.zip`
    );

    // Pipe archivo al response
    archive.pipe(res);

    // Agregar cada foto al ZIP
    for (const foto of fotos) {
      try {
        const response = await axios({
          method: "GET",
          url: foto.url,
          responseType: "arraybuffer",
        });

        const extension = foto.url.split(".").pop();
        const fileName = `foto_${foto._id}.${extension}`;

        archive.append(Buffer.from(response.data), {
          name: fileName,
        });
      } catch (err) {
        console.warn(`⚠️ Error al procesar foto ${foto._id}:`, err.message);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("❌ Error al descargar fotos:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al descargar las fotos",
      error: error.message,
    });
  }
};

exports.eliminarTodasLasFotos = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    console.log(
      "🔍 Intentando eliminar todas las fotos del usuario:",
      usuarioId
    );

    // Buscar todas las fotos del usuario
    const fotos = await FotoUsuario.find({ usuarioId });
    console.log(`📝 Encontradas ${fotos.length} fotos para eliminar`);

    if (fotos.length === 0) {
      return res.json({
        success: true,
        mensaje: "No hay fotos para eliminar",
        eliminadas: 0,
      });
    }

    let eliminadasCloudinary = 0;
    let erroresCloudinary = [];

    // Eliminar cada foto de Cloudinary
    for (const foto of fotos) {
      try {
        const urlParts = foto.url.split("/");
        const nombreArchivo = urlParts[urlParts.length - 1];
        const publicId = `impresiones_usuarios/${nombreArchivo.split(".")[0]}`;

        console.log(`🗑️ Eliminando de Cloudinary: ${publicId}`);
        const resultadoCloudinary = await cloudinary.uploader.destroy(publicId);

        if (resultadoCloudinary.result === "ok") {
          eliminadasCloudinary++;
        } else {
          erroresCloudinary.push(foto._id);
        }
      } catch (error) {
        console.error(`Error al eliminar de Cloudinary:`, error);
        erroresCloudinary.push(foto._id);
      }
    }

    // Eliminar de la base de datos
    const resultadoDB = await FotoUsuario.deleteMany({ usuarioId });

    // Verificar resultado
    const fotosRestantes = await FotoUsuario.countDocuments({ usuarioId });

    const resultado = {
      success: true,
      mensaje: `Fotos eliminadas: ${resultadoDB.deletedCount}`,
      detalles: {
        totalEncontradas: fotos.length,
        eliminadasCloudinary,
        eliminadasDB: resultadoDB.deletedCount,
        erroresCloudinary: erroresCloudinary.length,
        fotosRestantes,
      },
    };

    console.log("✅ Resultado de eliminación:", resultado);
    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al eliminar fotos:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar las fotos",
      error: error.message,
    });
  }
};

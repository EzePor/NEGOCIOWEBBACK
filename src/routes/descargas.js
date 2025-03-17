const express = require("express");
const router = express.Router();
const axios = require("axios");
const archiver = require("archiver");
const FotoUsuario = require("../models/FotoUsuario");
const { verificarToken } = require("../middlewares/auth");

// Endpoint para descargar una foto individual (solo admin)
router.get("/descargar/:fotoId", verificarToken, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "Solo los administradores pueden descargar fotos",
      });
    }

    const { fotoId } = req.params;
    const foto = await FotoUsuario.findById(fotoId);

    if (!foto) {
      return res.status(404).json({ mensaje: "Foto no encontrada" });
    }

    // Descargar la imagen desde la URL
    const response = await axios({
      method: "GET",
      url: foto.url,
      responseType: "stream",
    });

    // Configurar headers para la descarga
    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${foto.nombreOriginal || `foto_${foto._id}.jpg`}"`
    );

    // Enviar la imagen
    response.data.pipe(res);
  } catch (error) {
    console.error("❌ Error al descargar foto:", error);
    res.status(500).json({
      mensaje: "Error al descargar la foto",
      error: error.message,
    });
  }
});

// Endpoint para descargar todas las fotos de un usuario (solo admin)
router.get("/descargarTodas/:usuarioId", verificarToken, async (req, res) => {
  try {
    // Verificar si es admin
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({
        mensaje: "Solo los administradores pueden descargar fotos",
      });
    }

    const { usuarioId } = req.params;
    const fotos = await FotoUsuario.find({ usuarioId });

    if (!fotos.length) {
      return res.status(404).json({
        mensaje: "No se encontraron fotos para este usuario",
      });
    }

    // Configurar la respuesta ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=fotos_usuario_${usuarioId}.zip`
    );

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.pipe(res);

    // Agregar cada foto al ZIP
    let fotosAgregadas = 0;
    for (const foto of fotos) {
      try {
        const response = await axios({
          method: "GET",
          url: foto.url,
          responseType: "stream",
        });

        const nombreArchivo = foto.nombreOriginal || `foto_${foto._id}.jpg`;
        archive.append(response.data, { name: nombreArchivo });
        fotosAgregadas++;
      } catch (err) {
        console.warn(`⚠️ Error al procesar foto ${foto._id}:`, err.message);
      }
    }

    if (fotosAgregadas === 0) {
      return res.status(500).json({
        mensaje: "No se pudo procesar ninguna foto",
      });
    }

    console.log(`✅ Se procesaron ${fotosAgregadas} fotos para el ZIP`);
    await archive.finalize();
  } catch (error) {
    console.error("❌ Error al descargar fotos:", error);
    res.status(500).json({
      mensaje: "Error al descargar las fotos",
      error: error.message,
    });
  }
});

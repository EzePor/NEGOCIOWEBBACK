const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Middleware de autenticación
const {
  upload,
  handleMulterError,
  checkFileSize,
} = require("../middleware/multerImpresiones");
const {
  subirFoto,
  subirImagenes,
  obtenerFotosUsuario,
  obtenerTodasLasFotos,
  eliminarFoto,
  eliminarTodasLasFotos,
  descargarFoto,
  descargarTodasLasFotos,
} = require("../controllers/fotosUsuario");

router.post(
  "/subir",
  auth,
  upload.array("imagenes", 30),
  checkFileSize,
  handleMulterError,
  subirImagenes
);
router.get("/:usuarioId", auth, obtenerFotosUsuario);
router.get("/descargarTodas/:usuarioId", auth, descargarTodasLasFotos);
router.get("/admin/todas", auth, obtenerTodasLasFotos);
router.delete("/:usuarioId/todas", auth, eliminarTodasLasFotos);
router.get("/descargar/:fotoId", auth, descargarFoto);
router.delete("/:fotoId", auth, eliminarFoto);

module.exports = router;

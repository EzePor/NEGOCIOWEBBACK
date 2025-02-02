const express = require("express");
const router = express.Router();
const uploadImpresiones = require("../../middleware/multerImpresiones");
const {
  subirFoto,
  obtenerFotosUsuario,
} = require("../controllers/fotosUsuario");

router.post("/subir", uploadImpresiones.single("imagen"), subirFoto);
router.get("/:usuarioId", obtenerFotosUsuario);

module.exports = router;

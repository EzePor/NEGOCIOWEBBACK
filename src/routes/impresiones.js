const express = require("express");
const router = express.Router();
const uploadImpresiones = require("../middleware/multerImpresiones");

router.post("/subir", uploadImpresiones.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }
  res.json({ url: req.file.path });
});

module.exports = router;

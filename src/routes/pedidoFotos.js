const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { crearPedido } = require("../controllers/pedidoFotos");

router.post("/crear", auth, crearPedido);

module.exports = router;

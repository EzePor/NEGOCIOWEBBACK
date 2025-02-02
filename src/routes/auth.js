const express = require("express");
const {
  registrarUsuario,
  loginUsuario,
} = require("../controllers/authUsuario");
const router = express.Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

module.exports = router;

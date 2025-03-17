const Usuario = require("../models/Usuario");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Registrarse
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    let usuario = await Usuario.findOne({ email });
    if (usuario) return res.status(400).json({ msg: "El usuario ya existe" });

    // 🔹 Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    usuario = new Usuario({ nombre, email, password: passwordHash });
    await usuario.save();

    res.json({ msg: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// 🔹 Iniciar sesión
exports.loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // 🔹 Crear token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol, // Asegurarse de incluir el rol
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Responde con el token y los datos del usuario
    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};

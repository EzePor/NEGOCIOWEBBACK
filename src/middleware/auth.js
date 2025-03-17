const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        mensaje: "No hay token, acceso denegado",
        error: "TOKEN_MISSING",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar que el token incluya rol
      if (!decoded.rol) {
        return res.status(401).json({
          mensaje: "Token inválido - falta rol",
          error: "TOKEN_INVALID_ROLE",
        });
      }

      req.usuario = decoded;
      console.log("Usuario autenticado:", {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
      });

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          mensaje: "El token ha expirado",
          error: "TOKEN_EXPIRED",
          expiredAt: error.expiredAt,
        });
      }

      return res.status(401).json({
        mensaje: "Token no válido",
        error: "TOKEN_INVALID",
      });
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
    res.status(500).json({
      mensaje: "Error en la autenticación",
      error: error.message,
    });
  }
};

module.exports = auth;

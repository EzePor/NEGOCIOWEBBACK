const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinaryImpresiones"); // Cambiamos la importación

// Configuración de límites
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 300 * 1024 * 1024; // 300MB total
const MAX_FILES = 30;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "impresiones_usuarios",
    allowed_formats: ["jpg", "png", "jpeg"],
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
    eager_async: true,
    use_filename: true,
    unique_filename: true,
    chunk_size: 10485760, // 10MB
  },
});

// Crear instancia de multer

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Solo se permiten imágenes"), false);
    }
    cb(null, true);
  },
});

// Middleware para verificar tamaño total de archivos
const checkFileSize = (req, res, next) => {
  let totalSize = 0;

  if (!req.files) {
    return next();
  }

  req.files.forEach((file) => {
    totalSize += file.size;
  });

  if (totalSize > MAX_TOTAL_SIZE) {
    return res.status(413).json({
      success: false,
      mensaje: `El tamaño total de los archivos (${Math.round(
        totalSize / 1024 / 1024
      )}MB) excede el límite permitido (${Math.round(
        MAX_TOTAL_SIZE / 1024 / 1024
      )}MB)`,
    });
  }

  next();
};

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        mensaje: `Archivo demasiado grande. Máximo ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB por archivo`,
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(413).json({
        success: false,
        mensaje: `Demasiados archivos. Máximo ${MAX_FILES} archivos permitidos`,
      });
    }
  }

  console.error("❌ Error en multer:", err);
  return res.status(500).json({
    success: false,
    mensaje: "Error al procesar los archivos",
    error: err.message,
  });
};

module.exports = {
  upload: uploadMiddleware,
  checkFileSize,
  handleMulterError,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
};

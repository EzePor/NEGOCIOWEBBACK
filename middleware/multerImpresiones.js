const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinaryImpresiones = require("../src/config/cloudinaryImpresiones");

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryImpresiones,
  params: {
    folder: "impresiones", // Carpeta en Cloudinary para fotos de usuarios
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploadImpresiones = multer({ storage });

module.exports = uploadImpresiones;

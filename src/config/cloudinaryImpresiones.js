const cloudinary = require("cloudinary").v2;

// Configuración básica de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_IMPRESIONES,
  api_key: process.env.CLOUDINARY_API_KEY_IMPRESIONES,
  api_secret: process.env.CLOUDINARY_API_SECRET_IMPRESIONES,
});

// Configuraciones específicas para impresiones
const cloudinaryConfig = {
  folder: "impresiones_usuarios",
  allowed_formats: ["jpg", "jpeg", "png"],
  resource_type: "image",

  // Configuración de transformaciones para máxima calidad
  transformation: [
    { width: 5000, height: 5000, crop: "limit" }, // Mantiene tamaño original
    { quality: 100 }, // Máxima calidad
  ],

  // Versiones optimizadas
  eager: [
    {
      width: 800,
      height: 800,
      crop: "limit",
      quality: 85,
      format: "jpg",
    },
    {
      width: 400,
      height: 400,
      crop: "limit",
      quality: 85,
      format: "jpg",
    },
  ],

  // Configuración de carga
  eager_async: true,
  use_filename: true,
  unique_filename: true,
  overwrite: false,
  max_file_size: 25000000, // 25MB
  chunk_size: 6000000, // 6MB
};

module.exports = { cloudinary, cloudinaryConfig };

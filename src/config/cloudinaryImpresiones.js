const cloudinary = require("cloudinary").v2;

const cloudinaryImpresiones = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_IMPRESIONES,
  api_key: process.env.CLOUDINARY_API_KEY_IMPRESIONES,
  api_secret: process.env.CLOUDINARY_API_SECRET_IMPRESIONES,
  secure: true,
});

module.exports = cloudinaryImpresiones;

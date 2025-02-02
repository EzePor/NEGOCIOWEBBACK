const FotoUsuario = require("../models/FotosUsuario");

exports.subirFoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No se subió ninguna imagen" });

    const nuevaFoto = new FotoUsuario({
      usuarioId: req.body.usuarioId, // El ID del usuario que subió la foto
      url: req.file.path, // URL en Cloudinary
    });

    await nuevaFoto.save();
    res.json(nuevaFoto);
  } catch (error) {
    res.status(500).json({ error: "Error al subir la foto" });
  }
};

exports.obtenerFotosUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const fotos = await FotoUsuario.find({ usuarioId });
    res.json(fotos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las fotos" });
  }
};
